package com.livebox.module.message.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.message.dto.MessageResponse;
import com.livebox.module.message.dto.SendMessageRequest;
import com.livebox.module.message.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

import java.util.UUID;

/**
 * MessageController — xử lý cả REST API lẫn WebSocket endpoint cho messaging.
 *
 * <p>REST:
 * <ul>
 *   <li>GET /api/v1/channels/{channelId}/messages — SCRUM-53: Lịch sử tin nhắn (phân trang)</li>
 * </ul>
 *
 * <p>WebSocket (STOMP):
 * <ul>
 *   <li>/app/channels/{channelId}/send — SCRUM-54: Gửi tin nhắn, tự động broadcast</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/channels")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // ── REST ─────────────────────────────────────────────────────────────────

    /**
     * SCRUM-53: GET lịch sử tin nhắn của một Channel, phân trang.
     * <p>Trả về tin nhắn mới nhất trước (DESC). Client cuộn ngược lên để load thêm.
     *
     * @param channelId Channel ID
     * @param page      Trang số (default 0)
     * @param size      Số tin nhắn mỗi trang (default 50, max 100)
     */
    @GetMapping("/{channelId}/messages")
    public ApiResponse<Page<MessageResponse>> getMessages(
            @PathVariable UUID channelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.success(messageService.getMessageHistory(channelId, page, size));
    }

    // ── WebSocket / STOMP ────────────────────────────────────────────────────

    /**
     * SCRUM-54 + 55: Nhận tin nhắn qua STOMP, lưu DB, và broadcast.
     * <p>Client subscribe: /topic/channels/{channelId}
     * <p>Client publish:   /app/channels/{channelId}/send
     */
    @MessageMapping("/channels/{channelId}/send")
    public void sendMessage(
            @DestinationVariable UUID channelId,
            @Payload @Valid SendMessageRequest request,
            Principal principal) {
        // Principal.getName() trả về email vì ta set UsernamePasswordAuthenticationToken
        // với UserDetails (username = email) trong JwtHandshakeInterceptor
        String senderEmail = principal.getName();
        messageService.sendAndBroadcast(channelId, senderEmail, request);
    }
}
