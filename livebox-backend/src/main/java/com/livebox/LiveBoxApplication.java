package com.livebox;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * LiveBoxApplication — entry point for the LiveBox backend (Modular Monolith).
 *
 * <p>Architecture: Spring Boot 3.x · Java 21 (Virtual Threads ready)
 * <p>ADR reference: ADR-001-adopt-modular-monolith-springboot-react.md
 */
@SpringBootApplication
public class LiveBoxApplication {

    public static void main(String[] args) {
        SpringApplication.run(LiveBoxApplication.class, args);
    }
}
