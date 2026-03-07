package com.rujulw.timbre.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SpotifyProperties.class)
public class ConfigurationPropertiesConfig {
}
