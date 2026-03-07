package com.rujulw.timbre.controller;

import com.rujulw.timbre.config.SpotifyProperties;
import com.rujulw.timbre.dto.SpotifyTokenResponse;
import com.rujulw.timbre.dto.SpotifyUserDTO;
import com.rujulw.timbre.model.User;
import com.rujulw.timbre.service.SpotifyAuthService;
import com.rujulw.timbre.service.UserService;
import java.util.LinkedHashMap;
import java.util.Map;
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

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("status", "user_synced");
        payload.put("userId", persistedUser.getId());
        payload.put("spotifyId", persistedUser.getSpotifyId());
        payload.put("accessToken", tokenResponse.getAccessToken());
        payload.put("refreshToken", tokenResponse.getRefreshToken());
        payload.put("expiresIn", tokenResponse.getExpiresIn());
        payload.put("user", currentUser);
        payload.put("message", "Spotify profile and token metadata persisted.");
        return ResponseEntity.ok(payload);
    }
}
