package com.livebox.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * SecurityConfig — Spring Security filter chain for the LiveBox API.
 *
 * <p>Strategy: JWT stateless (no sessions). CORS is delegated to
 * {@link AppConfig#corsConfigurationSource()}. The JWT filter will be
 * added in the Auth module (Sprint 1).
 *
 * <p>Public routes (no token required):
 * <ul>
 *   <li>{@code POST /api/v1/auth/**} — register, login, token refresh</li>
 *   <li>{@code GET  /api/v1/invites/**} — validate invite link before login</li>
 *   <li>WebSocket handshake {@code /ws/**}</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource) {
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF — stateless JWT API does not need it
                .csrf(AbstractHttpConfigurer::disable)

                // Wire CORS from AppConfig
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Stateless session — JWT carries all auth state
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints are open
                        .requestMatchers("/auth/**").permitAll()
                        // Invite link validation before authentication
                        .requestMatchers("/invites/**").permitAll()
                        // WebSocket handshake (STOMP)
                        .requestMatchers("/ws/**").permitAll()
                        // Everything else requires a valid JWT
                        .anyRequest().authenticated()
                );

        // Note: JwtAuthenticationFilter will be registered here in Sprint 1
        // http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
