package com.livebox.module.channel.service;

import com.livebox.common.exception.ResourceNotFoundException;
import com.livebox.module.channel.dto.ChannelCreateRequest;
import com.livebox.module.channel.dto.ChannelResponse;
import com.livebox.module.channel.entity.Channel;
import com.livebox.module.channel.repository.ChannelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChannelService {

    private final ChannelRepository channelRepository;

    @Transactional
    public ChannelResponse createChannel(UUID serverId, ChannelCreateRequest request) {
        Channel channel = Channel.builder()
                .serverId(serverId)
                .name(request.getName())
                .type(request.getType())
                .build();
        channel = channelRepository.save(channel);
        return ChannelResponse.fromEntity(channel);
    }

    @Transactional(readOnly = true)
    public List<ChannelResponse> getChannelsByServerId(UUID serverId) {
        return channelRepository.findByServerId(serverId).stream()
                .map(ChannelResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteChannel(UUID serverId, UUID channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found with id: " + channelId));
        
        if (!channel.getServerId().equals(serverId)) {
            throw new IllegalArgumentException("Channel does not belong to the specified server");
        }
        
        channelRepository.delete(channel);
    }
}
