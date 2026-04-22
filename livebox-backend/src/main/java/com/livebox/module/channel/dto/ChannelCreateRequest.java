package com.livebox.module.channel.dto;

import com.livebox.module.channel.entity.ChannelType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChannelCreateRequest {

    @Schema(example = "general", description = "Tên của channel")
    @NotBlank(message = "Channel name is required")
    @Size(min = 1, max = 100, message = "Channel name must be between 1 and 100 characters")
    private String name;

    @Schema(example = "TEXT", description = "Loại channel (TEXT, VOICE, etc.)")
    @NotNull(message = "Channel type is required")
    private ChannelType type;
}
