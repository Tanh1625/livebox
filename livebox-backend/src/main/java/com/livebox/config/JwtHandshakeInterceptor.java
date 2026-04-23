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
 * JwtHandshakeInterceptor — SCRUM-56: Xác thực JWT tại WebSocket handshake.
 *
 * <p>Flow:
 * <ol>
 *   <li>Client kết nối tới /ws?token=<jwt_access_token></li>
 *   <li>Interceptor này bóc tách token từ query param</li>
 *   <li>Validate token và nạp UserDetails vào WebSocket session attributes</li>
 *   <li>Spring Security tự động nhận diện Principal cho @MessageMapping</li>
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
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // Lưu principal vào WebSocket session để Spring Security dùng trong @MessageMapping
                attributes.put("principal", authentication);
                log.debug("WebSocket handshake authenticated for user: {}", email);
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
