package com.livebox.config;

import com.livebox.module.server.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.UUID;

/**
 * WebSocketEventListener — listens to STOMP session connect/disconnect events.
 *
 * <p>Important note on Spring WS events:
 * <ul>
 *   <li>{@link SessionConnectEvent}: client sends STOMP CONNECT frame — session attributes (userId) are present</li>
 *   <li>SessionConnectedEvent: server sends CONNECTED back to client — session attributes are NOT present</li>
 *   <li>{@link SessionDisconnectEvent}: WS session closed — session attributes are present</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final PresenceService presenceService;

    /**
     * Marks the user online when a STOMP CONNECT frame is received.
     * Uses SessionConnectEvent (not SessionConnectedEvent) because only this event carries session attributes.
     */
    @EventListener
    public void handleSessionConnected(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();

        if (sessionAttributes == null) return;

        String userIdStr = (String) sessionAttributes.get("userId");
        String sessionId = accessor.getSessionId();

        if (userIdStr != null && sessionId != null) {
            try {
                UUID userId = UUID.fromString(userIdStr);
                presenceService.markOnline(userId, sessionId);
                log.info("WS Connected: user={} session={}", userId, sessionId);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid userId in session attributes: {}", userIdStr);
            }
        } else {
            log.warn("SessionConnectEvent: missing userId or sessionId — attributes={}", sessionAttributes);
        }
    }

    /**
     * Marks the user offline when the WS session disconnects (only when all sessions are closed).
     */
    @EventListener
    public void handleSessionDisconnected(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();

        if (sessionAttributes == null) return;

        String userIdStr = (String) sessionAttributes.get("userId");
        String sessionId = accessor.getSessionId();

        if (userIdStr != null && sessionId != null) {
            try {
                UUID userId = UUID.fromString(userIdStr);
                presenceService.markOffline(userId, sessionId);
                log.info("WS Disconnected: user={} session={}", userId, sessionId);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid userId in session attributes: {}", userIdStr);
            }
        }
    }
}
