package com.livebox.module.server.dto;
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
}
