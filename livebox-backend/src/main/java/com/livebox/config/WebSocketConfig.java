package com.livebox.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.Map;

/**
 * WebSocketConfig — STOMP over WebSocket configuration (SCRUM-56 updated).
 *
 * <p>Architecture ref: ADR-001 §3.1 — Spring Boot embedded SimpleBroker.
 *
 * <p>Authentication flow:
 * <ol>
 *   <li>Client kết nối: /ws?token={jwt}</li>
 *   <li>JwtHandshakeInterceptor validate và đặt principal vào WS session attributes</li>
 *   <li>ChannelInterceptor (bên dưới) propagate principal vào STOMP CONNECT frame</li>
 * </ol>
 *
 * <p>Topic destinations:
 * <ul>
 *   <li>{@code /topic/channels/{channelId}} — broadcast messages</li>
 *   <li>{@code /topic/servers/{serverId}/members} — presence events</li>
 *   <li>{@code /user/queue/notifications} — per-user unread badges</li>
 * </ul>
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500/")
                .addInterceptors(jwtHandshakeInterceptor) // SCRUM-56: JWT auth at handshake
                .withSockJS();
    }

    /**
     * SCRUM-56: Propagate the Principal from WebSocket session into each STOMP CONNECT frame.
     * Without this, @AuthenticationPrincipal in @MessageMapping would return null.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                    if (sessionAttributes != null) {
                        Object principal = sessionAttributes.get("principal");
                        if (principal instanceof Principal p) {
                            accessor.setUser(p);
                        }
                    }
                }
                return message;
            }
        });
    }
}
