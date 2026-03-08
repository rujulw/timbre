package com.rujulw.timbre.service;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.rujulw.timbre.config.SpotifyProperties;
import com.rujulw.timbre.dto.SpotifyTokenResponse;
import com.rujulw.timbre.dto.SpotifyUserDTO;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;

class SpotifyAuthServiceTest {

    private MockRestServiceServer server;
    private SpotifyAuthService spotifyAuthService;

    @BeforeEach
    void setUp() {
        SpotifyProperties properties = new SpotifyProperties(
                "client-id-123",
                "client-secret-123",
                "http://127.0.0.1:5173/callback",
                "https://accounts.spotify.com/authorize",
                "https://accounts.spotify.com/api/token",
                "https://api.spotify.com/v1",
                List.of("user-read-email", "user-read-private")
        );

        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        spotifyAuthService = new SpotifyAuthService(properties, builder.build());
    }

    @Test
    void exchangeCodeForToken_returnsTokenResponse() {
        server.expect(requestTo("https://accounts.spotify.com/api/token"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().string(containsString("grant_type=authorization_code")))
                .andExpect(content().string(containsString("code=code-abc")))
                .andExpect(content().string(containsString("client_id=client-id-123")))
                .andRespond(withSuccess("""
                        {
                          "access_token": "access-123",
                          "token_type": "Bearer",
                          "scope": "user-read-email",
                          "expires_in": 3600,
                          "refresh_token": "refresh-123"
                        }
                        """, MediaType.APPLICATION_JSON));

        SpotifyTokenResponse response = spotifyAuthService.exchangeCodeForToken("code-abc");

        assertEquals("access-123", response.getAccessToken());
        assertEquals("refresh-123", response.getRefreshToken());
        assertEquals(3600, response.getExpiresIn());
        server.verify();
    }

    @Test
    void refreshAccessToken_returnsNewAccessToken() {
        server.expect(requestTo("https://accounts.spotify.com/api/token"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().string(containsString("grant_type=refresh_token")))
                .andExpect(content().string(containsString("refresh_token=refresh-xyz")))
                .andExpect(content().string(containsString("client_id=client-id-123")))
                .andRespond(withSuccess("""
                        {
                          "access_token": "access-refreshed-1",
                          "token_type": "Bearer",
                          "scope": "user-read-email",
                          "expires_in": 3600
                        }
                        """, MediaType.APPLICATION_JSON));

        SpotifyTokenResponse response = spotifyAuthService.refreshAccessToken("refresh-xyz");

        assertEquals("access-refreshed-1", response.getAccessToken());
        assertEquals(3600, response.getExpiresIn());
        server.verify();
    }

    @Test
    void getCurrentUser_returnsUserProfile() {
        server.expect(requestTo("https://api.spotify.com/v1/me"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer access-abc"))
                .andRespond(withSuccess("""
                        {
                          "id": "spotify-user-1",
                          "display_name": "Rujul",
                          "email": "rujul@example.com",
                          "images": [{"url":"https://img.example/user.png"}]
                        }
                        """, MediaType.APPLICATION_JSON));

        SpotifyUserDTO user = spotifyAuthService.getCurrentUser("access-abc");

        assertEquals("spotify-user-1", user.getId());
        assertEquals("Rujul", user.getDisplayName());
        assertEquals("rujul@example.com", user.getEmail());
        assertEquals("https://img.example/user.png", user.getImages().get(0).getUrl());
        server.verify();
    }

    @Test
    void getCurrentlyPlaying_refreshesTokenOnUnauthorizedAndRetries() {
        server.expect(requestTo("https://api.spotify.com/v1/me/player/currently-playing"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer expired-access"))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        server.expect(requestTo("https://accounts.spotify.com/api/token"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().string(containsString("grant_type=refresh_token")))
                .andExpect(content().string(containsString("refresh_token=refresh-xyz")))
                .andRespond(withSuccess("""
                        {
                          "access_token": "new-access-1",
                          "token_type": "Bearer",
                          "expires_in": 3600
                        }
                        """, MediaType.APPLICATION_JSON));

        server.expect(requestTo("https://api.spotify.com/v1/me/player/currently-playing"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer new-access-1"))
                .andRespond(withSuccess("""
                        {
                          "is_playing": true,
                          "item": {
                            "id": "track-1"
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        Map<String, Object> response = spotifyAuthService.getCurrentlyPlaying("expired-access", "refresh-xyz");

        assertNotNull(response);
        assertEquals(true, response.get("is_playing"));
        assertEquals("new-access-1", response.get("newAccessToken"));
        server.verify();
    }
}
