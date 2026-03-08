package com.rujulw.timbre.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "spotify")
public record SpotifyProperties(
        String clientId,
        String clientSecret,
        String oauthStateSecret,
        String redirectUri,
        String authorizeUrl,
        String tokenUrl,
        String apiBaseUrl,
        List<String> scopes
) {
}
