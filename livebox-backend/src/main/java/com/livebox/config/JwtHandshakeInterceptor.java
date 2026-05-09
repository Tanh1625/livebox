package com.livebox.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * JwtHandshakeInterceptor — validates JWT at the WebSocket handshake.
 *
 * <p>Flow:
 * <ol>
 *   <li>Client connects to /ws?token=&lt;jwt_access_token&gt;</li>
 *   <li>Extracts the token from the query parameter</li>
 *   <li>Validates the token and stores UserDetails in the WebSocket session attributes</li>
 *   <li>Spring Security automatically recognises the Principal for @MessageMapping</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = extractTokenFromQuery(request);

        if (StringUtils.hasText(token) && jwtProvider.validateToken(token)) {
            try {
                String email = jwtProvider.getEmailFromToken(token);
                String userId = jwtProvider.getUserIdFromToken(token); // UUID string from JWT claim
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // Store principal in WebSocket session for Spring Security @MessageMapping resolution
                attributes.put("principal", authentication);
                // Store userId so the subscribe interceptor can check membership without an extra DB call
                attributes.put("userId", userId);
                log.debug("WebSocket handshake authenticated for user: {} (id={})", email, userId);
                return true;
            } catch (Exception e) {
                log.warn("WebSocket handshake authentication failed: {}", e.getMessage());
                return false;
            }
        }

        log.warn("WebSocket handshake rejected: missing or invalid JWT token");
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception exception) {
        // No-op
    }

    private String extractTokenFromQuery(ServerHttpRequest request) {
        String query = request.getURI().getQuery();
        if (StringUtils.hasText(query)) {
            for (String param : query.split("&")) {
                String[] kv = param.split("=");
                if (kv.length == 2 && "token".equals(kv[0])) {
                    return kv[1];
                }
            }
        }
        return null;
    }
}
