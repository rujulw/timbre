package com.rujulw.timbre.controller;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.rujulw.timbre.config.SpotifyProperties;
import com.rujulw.timbre.dto.SpotifyArtistDTO;
import com.rujulw.timbre.dto.SpotifyPlaylistDTO;
import com.rujulw.timbre.dto.SpotifyRecentlyPlayedDTO;
import com.rujulw.timbre.dto.SpotifyTokenResponse;
import com.rujulw.timbre.dto.SpotifyTrackDTO;
import com.rujulw.timbre.dto.SpotifyUserDTO;
import com.rujulw.timbre.model.User;
import com.rujulw.timbre.service.SpotifyAuthService;
import com.rujulw.timbre.service.UserService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
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

        SpotifyTrackDTO track = new SpotifyTrackDTO();
        track.setId("track-1");
        track.setName("Track One");
        SpotifyTrackDTO.Album album = new SpotifyTrackDTO.Album();
        album.setId("album-1");
        album.setName("Album One");
        track.setAlbum(album);

        SpotifyArtistDTO artist = new SpotifyArtistDTO();
        artist.setId("artist-1");
        artist.setName("Artist One");

        SpotifyRecentlyPlayedDTO recent = new SpotifyRecentlyPlayedDTO();
        recent.setTrack(track);
        recent.setPlayedAt("2026-03-06T00:00:00Z");

        SpotifyPlaylistDTO playlist = new SpotifyPlaylistDTO();
        playlist.setId("playlist-1");
        playlist.setName("Playlist One");

        when(spotifyAuthService.exchangeCodeForToken("code-abc")).thenReturn(tokenResponse);
        when(spotifyAuthService.getCurrentUser("access-123")).thenReturn(profile);
        when(userService.syncUser(profile, tokenResponse)).thenReturn(user);
        when(spotifyAuthService.getTopTracks("access-123", "short_term")).thenReturn(List.of(track));
        when(spotifyAuthService.getTopArtists("access-123", "short_term")).thenReturn(List.of(artist));
        when(spotifyAuthService.getRecentlyPlayed("access-123")).thenReturn(List.of(recent));
        when(spotifyAuthService.getUserPlaylists("access-123")).thenReturn(List.of(playlist));

        mockMvc.perform(get("/api/auth/callback").param("code", "code-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("dashboard_hydrated"))
                .andExpect(jsonPath("$.userId").value(42))
                .andExpect(jsonPath("$.spotifyId").value("spotify-user-1"))
                .andExpect(jsonPath("$.accessToken").value("access-123"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-123"))
                .andExpect(jsonPath("$.expiresIn").value(3600))
                .andExpect(jsonPath("$.user.id").value("spotify-user-1"))
                .andExpect(jsonPath("$.songs[0].id").value("track-1"))
                .andExpect(jsonPath("$.artists[0].id").value("artist-1"))
                .andExpect(jsonPath("$.albums[0].id").value("album-1"))
                .andExpect(jsonPath("$.playlists[0].id").value("playlist-1"))
                .andExpect(jsonPath("$.recentlyPlayed[0].track.id").value("track-1"));
    }

    @Test
    void refreshToken_returnsRefreshedAccessToken() throws Exception {
        SpotifyTokenResponse refreshed = new SpotifyTokenResponse();
        refreshed.setAccessToken("new-access-456");
        refreshed.setExpiresIn(3600);

        when(spotifyAuthService.refreshAccessToken("refresh-abc")).thenReturn(refreshed);

        mockMvc.perform(get("/api/auth/refresh-token").param("refreshToken", "refresh-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-456"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-abc"))
                .andExpect(jsonPath("$.expiresIn").value(3600));
    }

    @Test
    void currentlyPlaying_mapsIsPlayingAlias() throws Exception {
        when(spotifyAuthService.getCurrentlyPlaying("token-abc", "refresh-abc"))
                .thenReturn(Map.of("is_playing", true, "item", Map.of("id", "track-1")));

        mockMvc.perform(get("/api/auth/currently-playing")
                        .param("token", "token-abc")
                        .param("refresh", "refresh-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.is_playing").value(true))
                .andExpect(jsonPath("$.isPlaying").value(true))
                .andExpect(jsonPath("$.item.id").value("track-1"));
    }

    @Test
    void currentlyPlaying_returnsSafeFalseWhenServiceReturnsNull() throws Exception {
        when(spotifyAuthService.getCurrentlyPlaying("token-abc", null)).thenReturn(null);

        mockMvc.perform(get("/api/auth/currently-playing")
                        .param("token", "token-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPlaying").value(false));
    }

    @Test
    void createSnapshot_forwardsPayloadAndReturnsServiceResponse() throws Exception {
        when(spotifyAuthService.createSnapshotPlaylist(
                "token-abc",
                "my snapshot",
                List.of("track-1", "spotify:track:track-2")
        )).thenReturn(Map.of("snapshot_id", "snap-123"));

        mockMvc.perform(post("/api/auth/create-snapshot")
                        .param("token", "token-abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "my snapshot",
                                  "uris": ["track-1", "spotify:track:track-2"]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                        {"snapshot_id":"snap-123"}
                        """));
    }
}
