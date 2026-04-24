package com.livebox.module.message.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.message.dto.UnreadCountResponse;
import com.livebox.module.message.service.ReadReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * ReadReceiptController — SCRUM-62, 63.
 *
 * <ul>
 *   <li>POST /api/v1/channels/{channelId}/read       — Mark as Read</li>
 *   <li>GET  /api/v1/servers/{serverId}/unread        — Unread badge counts per channel</li>
 * </ul>
 */
@RestController
@RequiredArgsConstructor
public class ReadReceiptController {

    private final ReadReceiptService readReceiptService;

    /**
     * SCRUM-63: User mở channel → gọi API này để reset badge về 0.
     * FE gọi ngay khi user click vào channel.
     */
    @PostMapping("/api/v1/channels/{channelId}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(@PathVariable UUID channelId) {
        readReceiptService.markAsRead(channelId);
    }

    /**
     * SCRUM-61: Lấy unread count cho tất cả channel trong server.
     * FE gọi khi load sidebar để hiển thị badge số.
     */
    @GetMapping("/api/v1/servers/{serverId}/unread")
    public ApiResponse<List<UnreadCountResponse>> getUnreadCounts(@PathVariable UUID serverId) {
        return ApiResponse.success(readReceiptService.getUnreadCounts(serverId));
    }
}
