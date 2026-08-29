package com.recovery.autopilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class RevpilotApplication {
    public static void main(String[] args) {
        SpringApplication.run(RevpilotApplication.class, args);
    }
}
