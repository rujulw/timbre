package com.rujulw.timbre.service;

import com.rujulw.timbre.config.SpotifyProperties;
import com.rujulw.timbre.dto.SpotifyArtistDTO;
import com.rujulw.timbre.dto.SpotifyPager;
import com.rujulw.timbre.dto.SpotifyPlaylistDTO;
import com.rujulw.timbre.dto.SpotifyRecentlyPlayedDTO;
import com.rujulw.timbre.dto.SpotifyTrackDTO;
import com.rujulw.timbre.dto.SpotifyTokenResponse;
import com.rujulw.timbre.dto.SpotifyUserDTO;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
public class SpotifyAuthService {

    private final SpotifyProperties spotifyProperties;
    private final RestClient restClient;

    @Autowired
    public SpotifyAuthService(SpotifyProperties spotifyProperties) {
        this(spotifyProperties, RestClient.create());
    }

    SpotifyAuthService(SpotifyProperties spotifyProperties, RestClient restClient) {
        this.spotifyProperties = spotifyProperties;
        this.restClient = restClient;
    }

    public SpotifyTokenResponse exchangeCodeForToken(String code) {
        MultiValueMap<String, String> formBody = new LinkedMultiValueMap<>();
        formBody.add("grant_type", "authorization_code");
        formBody.add("code", code);
        formBody.add("redirect_uri", spotifyProperties.redirectUri());
        formBody.add("client_id", spotifyProperties.clientId());
        formBody.add("client_secret", spotifyProperties.clientSecret());

        return restClient.post()
                .uri(spotifyProperties.tokenUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formBody)
                .retrieve()
                .body(SpotifyTokenResponse.class);
    }

    public SpotifyTokenResponse refreshAccessToken(String refreshToken) {
        MultiValueMap<String, String> formBody = new LinkedMultiValueMap<>();
        formBody.add("grant_type", "refresh_token");
        formBody.add("refresh_token", refreshToken);
        formBody.add("client_id", spotifyProperties.clientId());
        formBody.add("client_secret", spotifyProperties.clientSecret());

        return restClient.post()
                .uri(spotifyProperties.tokenUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formBody)
                .retrieve()
                .body(SpotifyTokenResponse.class);
    }

    public SpotifyUserDTO getCurrentUser(String accessToken) {
        return restClient.get()
                .uri(spotifyProperties.apiBaseUrl() + "/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(SpotifyUserDTO.class);
    }

    public List<SpotifyTrackDTO> getTopTracks(String accessToken, String timeRange) {
        String uri = spotifyProperties.apiBaseUrl() + "/me/top/tracks?time_range=" + timeRange + "&limit=50";
        SpotifyPager<SpotifyTrackDTO> pager = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<SpotifyPager<SpotifyTrackDTO>>() { });

        if (pager == null || pager.getItems() == null) {
            return List.of();
        }
        return pager.getItems();
    }

    public List<SpotifyArtistDTO> getTopArtists(String accessToken, String timeRange) {
        String uri = spotifyProperties.apiBaseUrl() + "/me/top/artists?time_range=" + timeRange + "&limit=50";
        SpotifyPager<SpotifyArtistDTO> pager = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<SpotifyPager<SpotifyArtistDTO>>() { });

        if (pager == null || pager.getItems() == null) {
            return List.of();
        }
        return pager.getItems();
    }

    public List<SpotifyRecentlyPlayedDTO> getRecentlyPlayed(String accessToken) {
        String uri = spotifyProperties.apiBaseUrl() + "/me/player/recently-played?limit=50";
        SpotifyPager<SpotifyRecentlyPlayedDTO> pager = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<SpotifyPager<SpotifyRecentlyPlayedDTO>>() { });

        if (pager == null || pager.getItems() == null) {
            return List.of();
        }
        return pager.getItems();
    }

    public List<SpotifyPlaylistDTO> getUserPlaylists(String accessToken) {
        String uri = spotifyProperties.apiBaseUrl() + "/me/playlists?limit=50";
        SpotifyPager<SpotifyPlaylistDTO> pager = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<SpotifyPager<SpotifyPlaylistDTO>>() { });

        if (pager == null || pager.getItems() == null) {
            return List.of();
        }

        return pager.getItems().stream()
                .filter(playlist ->
                        Boolean.TRUE.equals(playlist.getPublicPlaylist())
                                || Boolean.TRUE.equals(playlist.getCollaborative()))
                .toList();
    }

    public Map<String, Object> getCurrentlyPlaying(String accessToken, String refreshToken) {
        try {
            return executeCurrentlyPlayingRequest(accessToken);
        } catch (HttpClientErrorException.Unauthorized unauthorized) {
            if (refreshToken == null || refreshToken.isBlank()) {
                return Map.of("is_playing", false, "error", "refresh_failed");
            }

            try {
                SpotifyTokenResponse refreshed = refreshAccessToken(refreshToken);
                String newAccessToken = refreshed != null ? refreshed.getAccessToken() : null;
                if (newAccessToken == null || newAccessToken.isBlank()) {
                    return Map.of("is_playing", false, "error", "refresh_failed");
                }

                Map<String, Object> result = executeCurrentlyPlayingRequest(newAccessToken);
                if (result == null) {
                    return Map.of("is_playing", false);
                }
                result.put("newAccessToken", newAccessToken);
                return result;
            } catch (Exception refreshFailure) {
                return Map.of("is_playing", false, "error", "refresh_failed");
            }
        } catch (Exception e) {
            return Map.of("is_playing", false);
        }
    }

    private Map<String, Object> executeCurrentlyPlayingRequest(String accessToken) {
        String uri = spotifyProperties.apiBaseUrl() + "/me/player/currently-playing";
        Map<String, Object> response = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() { });

        return response != null ? response : Map.of("is_playing", false);
    }

    public Map<String, Object> createSnapshotPlaylist(String token, String name, List<String> trackUris) {
        try {
            Map<String, Object> profile = restClient.get()
                    .uri(spotifyProperties.apiBaseUrl() + "/me")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() { });

            String userId = profile != null ? (String) profile.get("id") : null;
            if (userId == null || userId.isBlank()) {
                return Map.of("success", false, "error", "missing_user_id");
            }

            Map<String, Object> playlistBody = Map.of(
                    "name", name,
                    "description", "Timbre. Audio Snapshot",
                    "public", false
            );

            Map<String, Object> playlist = restClient.post()
                    .uri(spotifyProperties.apiBaseUrl() + "/users/" + userId + "/playlists")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(playlistBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() { });

            String playlistId = playlist != null ? (String) playlist.get("id") : null;
            if (playlistId == null || playlistId.isBlank()) {
                return Map.of("success", false, "error", "missing_playlist_id");
            }

            List<String> formattedUris = (trackUris == null ? List.<String>of() : trackUris).stream()
                    .filter(uri -> uri != null)
                    .map(uri -> uri.startsWith("spotify:track:") ? uri : "spotify:track:" + uri)
                    .collect(Collectors.toList());

            if (formattedUris.isEmpty()) {
                return playlist;
            }

            Map<String, Object> tracksBody = Map.of("uris", formattedUris);

            Map<String, Object> addResponse = restClient.post()
                    .uri(spotifyProperties.apiBaseUrl() + "/playlists/" + playlistId + "/tracks")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(tracksBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() { });

            return addResponse != null ? addResponse : Map.of();
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}
