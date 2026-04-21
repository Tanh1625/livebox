package com.livebox.module.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class ServerCreateRequest {

    @NotBlank(message = "Server name is required")
    @Size(min = 1, max = 100, message = "Server name must be between 1 and 100 characters")
    private String name;

    private String avatarUrl;

    @NotNull(message = "Owner ID is required")
    private UUID ownerId;
}
