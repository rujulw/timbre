package com.rujulw.timbre.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${FRONTEND_URL:http://127.0.0.1:5173}")
    private String frontendUrl;

    @Value("${FRONTEND_URLS:}")
    private String frontendUrls;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] allowedOrigins = frontendUrls == null || frontendUrls.isBlank()
                ? new String[] { frontendUrl }
                : Arrays.stream(frontendUrls.split(","))
                        .map(String::trim)
                        .filter(value -> !value.isBlank())
                        .toArray(String[]::new);

        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }
}
