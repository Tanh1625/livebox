package com.livebox.config;

import com.livebox.common.security.MembershipGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.UUID;


/**
 * WebSocketConfig — STOMP over WebSocket configuration.
 *
 * <p>Architecture ref: ADR-001 §3.1 — Spring Boot embedded SimpleBroker.
 *
 * <p>Authentication flow:
 * <ol>
 *   <li>Client connects to /ws?token={jwt}</li>
 *   <li>JwtHandshakeInterceptor validates the token and stores the principal in WS session attributes</li>
 *   <li>ChannelInterceptor (below) propagates the principal into the STOMP CONNECT frame</li>
 * </ol>
 *
 * <p>Topic destinations:
 * <ul>
 *   <li>{@code /topic/channels/{channelId}} — broadcast messages</li>
 *   <li>{@code /topic/servers/{serverId}/members} — presence events</li>
 *   <li>{@code /user/queue/notifications} — per-user unread badges</li>
 * </ul>
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final MembershipGuard membershipGuard;

    /** Destination prefix for channel messages: /topic/channels/{channelId} */
    private static final String CHANNEL_TOPIC_PREFIX = "/topic/channels/";

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
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500/", "https://livebox-pi.vercel.app")
                .addInterceptors(jwtHandshakeInterceptor)
                .withSockJS();
    }

    /**
     * Inbound channel interceptor — handles two cases:
     *
     * <ul>
     *   <li>CONNECT: propagates the Principal from session into the STOMP frame (required for @MessageMapping)</li>
     *   <li>SUBSCRIBE: validates channel membership before allowing subscription (security check)</li>
     * </ul>
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) return message;

                StompCommand command = accessor.getCommand();

                if (StompCommand.CONNECT.equals(command)) {
                    // Propagate Principal from WebSocket session into STOMP session
                    Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                    if (sessionAttributes != null) {
                        Object principal = sessionAttributes.get("principal");
                        if (principal instanceof Principal p) {
                            accessor.setUser(p);
                        }
                    }
                } else if (StompCommand.SUBSCRIBE.equals(command)) {
                    // Security: block subscription if the user is not a member of the server owning this channel
                    String destination = accessor.getDestination();
                    if (destination != null && destination.startsWith(CHANNEL_TOPIC_PREFIX)) {
                        String channelIdStr = destination.substring(CHANNEL_TOPIC_PREFIX.length());
                        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                        if (sessionAttributes == null) {
                            log.warn("SUBSCRIBE blocked: no session attributes (session={})",
                                    accessor.getSessionId());
                            throw new IllegalStateException("WebSocket session not authenticated.");
                        }

                        String userIdStr = (String) sessionAttributes.get("userId");
                        if (userIdStr == null) {
                            log.warn("SUBSCRIBE blocked: userId not in session (dest={})", destination);
                            throw new IllegalStateException("WebSocket session not authenticated.");
                        }

                        try {
                            UUID channelId = UUID.fromString(channelIdStr);
                            UUID userId = UUID.fromString(userIdStr);
                            // Throws LiveBoxException(403) if the user is not a member
                            membershipGuard.requireChannelMembership(channelId, userId);
                            log.debug("SUBSCRIBE authorized: user={} channel={}", userId, channelId);
                        } catch (IllegalArgumentException e) {
                            // Non-UUID channel destination (e.g. presence topics) — skip membership check
                            log.debug("SUBSCRIBE: non-UUID channel destination '{}', skipping check",
                                    destination);
                        }
                    }
                }
                // Other topics (/topic/servers/..., /user/queue/...) and other commands (SEND, DISCONNECT) pass through

                return message;
            }
        });
    }
}
