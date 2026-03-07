package com.rujulw.timbre.controller;

import com.rujulw.timbre.config.SpotifyProperties;
import com.rujulw.timbre.dto.SpotifyArtistDTO;
import com.rujulw.timbre.dto.SpotifyRecentlyPlayedDTO;
import com.rujulw.timbre.dto.SpotifyTokenResponse;
import com.rujulw.timbre.dto.SpotifyTrackDTO;
import com.rujulw.timbre.dto.SpotifyUserDTO;
import com.rujulw.timbre.model.User;
import com.rujulw.timbre.service.SpotifyAuthService;
import com.rujulw.timbre.service.UserService;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String RESPONSE_TYPE = "code";

    private final SpotifyProperties spotifyProperties;
    private final SpotifyAuthService spotifyAuthService;
    private final UserService userService;

    public AuthController(
            SpotifyProperties spotifyProperties,
            SpotifyAuthService spotifyAuthService,
            UserService userService
    ) {
        this.spotifyProperties = spotifyProperties;
        this.spotifyAuthService = spotifyAuthService;
        this.userService = userService;
    }

    @GetMapping("/login")
    public RedirectView login() {
        String scopes = String.join(" ", spotifyProperties.scopes());

        String authorizationUri = ServletUriComponentsBuilder
                .fromUriString(spotifyProperties.authorizeUrl())
                .queryParam("response_type", RESPONSE_TYPE)
                .queryParam("client_id", spotifyProperties.clientId())
                .queryParam("scope", scopes)
                .queryParam("redirect_uri", spotifyProperties.redirectUri())
                .build()
                .toUriString();

        return new RedirectView(authorizationUri);
    }

    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> callback(@RequestParam String code) {
        SpotifyTokenResponse tokenResponse = spotifyAuthService.exchangeCodeForToken(code);
        SpotifyUserDTO currentUser = spotifyAuthService.getCurrentUser(tokenResponse.getAccessToken());
        User persistedUser = userService.syncUser(currentUser, tokenResponse);
        List<SpotifyTrackDTO> topTracks = spotifyAuthService.getTopTracks(tokenResponse.getAccessToken(), "short_term");
        List<SpotifyArtistDTO> topArtists = spotifyAuthService.getTopArtists(tokenResponse.getAccessToken(), "short_term");
        List<SpotifyRecentlyPlayedDTO> recentTracks = spotifyAuthService.getRecentlyPlayed(tokenResponse.getAccessToken());
        List<SpotifyTrackDTO.Album> topAlbums = calculateTopAlbums(topTracks);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("status", "dashboard_hydrated");
        payload.put("userId", persistedUser.getId());
        payload.put("spotifyId", persistedUser.getSpotifyId());
        payload.put("accessToken", tokenResponse.getAccessToken());
        payload.put("refreshToken", tokenResponse.getRefreshToken());
        payload.put("expiresIn", tokenResponse.getExpiresIn());
        payload.put("user", currentUser);
        payload.put("songs", topTracks);
        payload.put("artists", topArtists);
        payload.put("albums", topAlbums);
        payload.put("recentlyPlayed", recentTracks);
        payload.put("message", "Initial dashboard hydration payload prepared.");
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/top-tracks")
    public ResponseEntity<List<SpotifyTrackDTO>> getTopTracks(
            @RequestParam String token,
            @RequestParam(defaultValue = "short_term") String range
    ) {
        return ResponseEntity.ok(spotifyAuthService.getTopTracks(token, range));
    }

    @GetMapping("/top-artists")
    public ResponseEntity<List<SpotifyArtistDTO>> getTopArtists(
            @RequestParam String token,
            @RequestParam(defaultValue = "short_term") String range
    ) {
        return ResponseEntity.ok(spotifyAuthService.getTopArtists(token, range));
    }

    @GetMapping("/recently-played")
    public ResponseEntity<List<SpotifyRecentlyPlayedDTO>> getRecentlyPlayed(@RequestParam String token) {
        return ResponseEntity.ok(spotifyAuthService.getRecentlyPlayed(token));
    }

    @GetMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestParam String refreshToken) {
        SpotifyTokenResponse refreshed = spotifyAuthService.refreshAccessToken(refreshToken);
        if (refreshed == null || refreshed.getAccessToken() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "refresh_failed"));
        }

        String resolvedRefreshToken = refreshed.getRefreshToken() != null ? refreshed.getRefreshToken() : refreshToken;
        return ResponseEntity.ok(Map.of(
                "accessToken", refreshed.getAccessToken(),
                "refreshToken", resolvedRefreshToken,
                "expiresIn", refreshed.getExpiresIn()
        ));
    }

    private List<SpotifyTrackDTO.Album> calculateTopAlbums(List<SpotifyTrackDTO> topTracks) {
        if (topTracks == null || topTracks.isEmpty()) {
            return List.of();
        }

        Map<String, Long> albumCounts = topTracks.stream()
                .map(SpotifyTrackDTO::getAlbum)
                .filter(album -> album != null && album.getName() != null)
                .collect(Collectors.groupingBy(SpotifyTrackDTO.Album::getName, Collectors.counting()));

        return topTracks.stream()
                .map(SpotifyTrackDTO::getAlbum)
                .filter(album -> album != null && album.getName() != null)
                .distinct()
                .sorted(Comparator.comparing((SpotifyTrackDTO.Album a) -> albumCounts.getOrDefault(a.getName(), 0L)).reversed())
                .limit(10)
                .toList();
    }
}
