package com.livebox.module.channel.mapper;

import com.livebox.module.channel.dto.ChannelResponse;
import com.livebox.module.channel.entity.Channel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ChannelMapper {
    ChannelResponse toResponse(Channel channel);
}