package com.livebox.module.server.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class InviteResponse {
    private UUID id;
    private String code;
    private String inviteUrl;
    private Instant expiresAt;
    private UUID serverId;
}
