package com.livebox.module.channel.dto;

import com.livebox.module.channel.entity.Channel;
import com.livebox.module.channel.entity.ChannelType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ChannelResponse {
    private UUID id;
    private UUID serverId;
    private String name;
    private ChannelType type;
    private Instant createdAt;
}
