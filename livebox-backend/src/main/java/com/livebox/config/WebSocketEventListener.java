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
 * WebSocketEventListener — SCRUM-58: Lắng nghe STOMP session connect/disconnect.
 *
 * <p>Lưu ý quan trọng về Spring WS events:
 * <ul>
 *   <li>{@link SessionConnectEvent}: Client gửi STOMP CONNECT frame → CÓ session attributes (userId)</li>
 *   <li>SessionConnectedEvent: Server gửi CONNECTED về client → KHÔNG có session attributes</li>
 *   <li>{@link SessionDisconnectEvent}: WS session đóng → CÓ session attributes</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final PresenceService presenceService;

    /**
     * SCRUM-58/59: User gửi STOMP CONNECT → đánh dấu online.
     * Dùng SessionConnectEvent (không phải SessionConnectedEvent) vì chỉ event này có session attributes.
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
     * SCRUM-58/59: User ngắt kết nối → đánh dấu offline (nếu hết tất cả session).
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
