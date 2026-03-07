package com.rujulw.timbre;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;


@SpringBootApplication
@ConfigurationPropertiesScan
public class TimbreApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimbreApplication.class, args);
    }
}
