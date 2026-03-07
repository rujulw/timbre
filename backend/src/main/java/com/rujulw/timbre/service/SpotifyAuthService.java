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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
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
}
