package com.rujulw.timbre.controller;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.rujulw.timbre.config.SpotifyProperties;
import com.rujulw.timbre.dto.SpotifyTokenResponse;
import com.rujulw.timbre.dto.SpotifyUserDTO;
import com.rujulw.timbre.model.User;
import com.rujulw.timbre.service.SpotifyAuthService;
import com.rujulw.timbre.service.UserService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private SpotifyProperties spotifyProperties;

    @Mock
    private SpotifyAuthService spotifyAuthService;

    @Mock
    private UserService userService;

    @BeforeEach
    void setUp() {
        spotifyProperties = new SpotifyProperties(
                "client-123",
                "secret-123",
                "http://127.0.0.1:5173/callback",
                "https://accounts.spotify.com/authorize",
                "https://accounts.spotify.com/api/token",
                "https://api.spotify.com/v1",
                List.of("user-read-email", "user-top-read")
        );
        AuthController authController = new AuthController(spotifyProperties, spotifyAuthService, userService);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void login_redirectsToSpotifyAuthorizeUrl() throws Exception {
        mockMvc.perform(get("/api/auth/login"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", containsString("https://accounts.spotify.com/authorize")))
                .andExpect(header().string("Location", containsString("response_type=code")))
                .andExpect(header().string("Location", containsString("client_id=client-123")))
                .andExpect(header().string("Location", containsString("redirect_uri=http://127.0.0.1:5173/callback")));
    }

    @Test
    void callback_returnsPersistedHappyPathPayload() throws Exception {
        SpotifyTokenResponse tokenResponse = new SpotifyTokenResponse();
        tokenResponse.setAccessToken("access-123");
        tokenResponse.setRefreshToken("refresh-123");
        tokenResponse.setExpiresIn(3600);

        SpotifyUserDTO profile = new SpotifyUserDTO();
        profile.setId("spotify-user-1");
        profile.setDisplayName("Rujul");
        profile.setEmail("rujul@example.com");

        User user = new User();
        user.setId(42L);
        user.setSpotifyId("spotify-user-1");

        when(spotifyAuthService.exchangeCodeForToken("code-abc")).thenReturn(tokenResponse);
        when(spotifyAuthService.getCurrentUser("access-123")).thenReturn(profile);
        when(userService.syncUser(profile, tokenResponse)).thenReturn(user);

        mockMvc.perform(get("/api/auth/callback").param("code", "code-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("user_synced"))
                .andExpect(jsonPath("$.userId").value(42))
                .andExpect(jsonPath("$.spotifyId").value("spotify-user-1"))
                .andExpect(jsonPath("$.accessToken").value("access-123"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-123"))
                .andExpect(jsonPath("$.expiresIn").value(3600))
                .andExpect(jsonPath("$.user.id").value("spotify-user-1"));
    }
}
