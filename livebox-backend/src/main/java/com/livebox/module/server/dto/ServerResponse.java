package com.livebox.module.server.dto;

import com.livebox.module.server.entity.Server;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ServerResponse {
    private UUID id;
    private String name;
    private String avatarUrl;
    private UUID ownerId;
    private Instant createdAt;

    public static ServerResponse fromEntity(Server server) {
        return ServerResponse.builder()
                .id(server.getId())
                .name(server.getName())
                .avatarUrl(server.getAvatarUrl())
                .ownerId(server.getOwnerId())
                .createdAt(server.getCreatedAt())
                .build();
    }
}
