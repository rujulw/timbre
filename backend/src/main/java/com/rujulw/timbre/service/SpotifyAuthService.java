package com.rujulw.timbre.service;

import com.rujulw.timbre.config.SpotifyProperties;
import com.rujulw.timbre.dto.SpotifyTokenResponse;
import com.rujulw.timbre.dto.SpotifyUserDTO;
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

    public SpotifyAuthService(SpotifyProperties spotifyProperties) {
        this.spotifyProperties = spotifyProperties;
        this.restClient = RestClient.create();
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

    public SpotifyUserDTO getCurrentUser(String accessToken) {
        return restClient.get()
                .uri(spotifyProperties.apiBaseUrl() + "/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(SpotifyUserDTO.class);
    }
}
