package com.livebox.module.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * SendMessageRequest — payload client gửi lên khi nhắn tin qua WebSocket.
 * <p>SCRUM-54: Destination: /app/channels/{channelId}/send
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 2000, message = "Message content cannot exceed 2000 characters")
    private String content;
}
