package com.livebox.module.channel.dto;

import com.livebox.module.channel.entity.ChannelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChannelCreateRequest {

    @NotBlank(message = "Channel name is required")
    @Size(min = 1, max = 100, message = "Channel name must be between 1 and 100 characters")
    private String name;

    @NotNull(message = "Channel type is required")
    private ChannelType type;
}
