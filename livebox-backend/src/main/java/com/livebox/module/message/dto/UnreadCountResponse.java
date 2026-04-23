package com.livebox.module.message.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/** SCRUM-61: Badge count cho một channel. */
@Getter
@Builder
public class UnreadCountResponse {
    private UUID channelId;
    private long unreadCount;
}
