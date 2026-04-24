package com.livebox.module.server.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * PresenceEvent — SCRUM-60: Broadcast payload khi user online/offline.
 * Gửi đến /topic/servers/{serverId}/members
 */
@Getter
@Builder
public class PresenceEvent {

    public enum Status { ONLINE, OFFLINE }

    private UUID userId;
    private String displayName;
    private String avatarUrl;
    private Status status;
}
