package com.livebox.module.message.dto;

import com.livebox.module.message.entity.Message;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * MessageResponse — DTO gửi ra cho client (REST response và WebSocket broadcast).
 * <p>SCRUM-55: Payload được broadcast đến /topic/channels/{channelId}
 */
@Getter
@Builder
public class MessageResponse {

    private UUID id;
    private String content;
    private Instant createdAt;
    private SenderDto sender;

    @Getter
    @Builder
    public static class SenderDto {
        private UUID id;
        private String displayName;
        private String avatarUrl;
    }

    /**
     * Chuyển đổi Message Entity sang MessageResponse DTO.
     * Tránh dùng MapStruct cho object đơn giản này — giữ code dễ đọc.
     */
    public static MessageResponse from(Message message) {
        SenderDto senderDto = null;
        if (message.getSender() != null) {
            senderDto = SenderDto.builder()
                    .id(message.getSender().getId())
                    .displayName(message.getSender().getDisplayName())
                    .avatarUrl(message.getSender().getAvatarUrl())
                    .build();
        }

        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .sender(senderDto)
                .build();
    }
}
