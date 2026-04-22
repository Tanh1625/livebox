package com.livebox.module.server.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class ServerCreateRequest {

    @Schema(example = "LiveBox Global", description = "Tên của server")
    @NotBlank(message = "Server name is required")
    @Size(min = 1, max = 100, message = "Server name must be between 1 and 100 characters")
    private String name;

    @Schema(example = "https://avatar.iran.liara.run/public/1", description = "Ảnh đại diện server")
    private String avatarUrl;

    @Schema(example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", description = "ID của chủ sở hữu server")
    @NotNull(message = "Owner ID is required")
    private UUID ownerId;
}
