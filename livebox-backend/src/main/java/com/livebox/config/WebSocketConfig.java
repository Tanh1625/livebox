package com.livebox.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig — STOMP over WebSocket configuration.
 *
 * <p>Architecture ref: ADR-001 §3.1 — Spring Boot embedded SimpleBroker.
 *
 * <p>Topic destinations follow the pattern:
 * <ul>
 *   <li>{@code /topic/channels/{channelId}} — broadcast messages to all channel subscribers</li>
 *   <li>{@code /topic/servers/{serverId}/members} — online/offline presence events</li>
 *   <li>{@code /user/queue/notifications} — per-user unread badge updates</li>
 * </ul>
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // In-memory SimpleBroker handles /topic/** and /queue/** destinations
        // Post-MVP: replace with Redis-backed broker for multi-instance support
        registry.enableSimpleBroker("/topic", "/queue");

        // Client sends messages to /app/** which Spring routes to @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");

        // Per-user private messages (unread badges, notifications)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws")
                // Allow React dev server to open the WebSocket connection
                .setAllowedOriginPatterns("http://localhost:3000")
                // SockJS fallback for environments that block raw WebSocket
                .withSockJS();
    }
}
