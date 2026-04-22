package com.livebox.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * AppConfig — application-wide cross-cutting configuration.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Enable JPA auditing so {@code @CreatedDate} / {@code @LastModifiedDate}
 *       on BaseEntity are auto-populated.</li>
 *   <li>Configure CORS to allow the React dev server ({@code localhost:3000}).</li>
 *   <li>Configure Jackson: camelCase, ignore unknown properties,
 *       Java-Time serialisation.</li>
 * </ul>
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "securityAuditorAware")
public class AppConfig {

    // ─────────────────────────────────────────────────────────────────────────
    // CORS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Expose this bean so {@link SecurityConfig} can wire it into the security
     * filter chain via {@code http.cors(c -> c.configurationSource(corsConfigurationSource()))}.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // React dev server (localhost:3000) — extend list for Vercel preview URLs in staging
        config.setAllowedOrigins(List.of("http://localhost:3000"));

        // Standard HTTP methods for a RESTful + WebSocket upgrade handshake
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow Authorization header (Bearer JWT) and Content-Type
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));

        // Expose the Authorization header so the React client can read it
        config.setExposedHeaders(List.of("Authorization"));

        // Required for cookies / credentials if we ever add them; harmless now
        config.setAllowCredentials(true);

        // Cache pre-flight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Jackson
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Primary {@link ObjectMapper} bean.
     *
     * <ul>
     *   <li>Property naming: {@code camelCase} (LOWER_CAMEL_CASE — Spring Boot default,
     *       declared explicitly for clarity).</li>
     *   <li>Deserialization: silently ignore unknown JSON fields (forward-compatible).</li>
     *   <li>Serialisation: Java 8+ date/time types via {@link JavaTimeModule}.</li>
     * </ul>
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // camelCase — mirrors coding_conventions.md §2 naming rules
        mapper.setPropertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE);

        // Silently drop unknown fields → forward-compatible with future API additions
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        // Support LocalDateTime, Instant, etc.
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(
                com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
                false
        );

        return mapper;
    }
}
