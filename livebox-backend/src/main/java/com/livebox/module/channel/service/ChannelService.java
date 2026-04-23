package com.livebox.module.channel.service;

import com.livebox.common.exception.LiveBoxException;
import com.livebox.common.exception.ResourceNotFoundException;
import com.livebox.common.security.MembershipGuard;
import com.livebox.common.util.SecurityUtils;
import com.livebox.module.channel.dto.ChannelCreateRequest;
import com.livebox.module.channel.dto.ChannelResponse;
import com.livebox.module.channel.entity.Channel;
import com.livebox.module.channel.repository.ChannelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ChannelService — LB-302: Tạo, đổi tên, xóa kênh text (Owner only).
 * LB-303: List kênh theo server (Member only).
 */
@Service
@RequiredArgsConstructor
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final MembershipGuard membershipGuard;

    /**
     * LB-302: Tạo channel mới trong server. Chỉ Owner được phép.
     */
    @Transactional
    public ChannelResponse createChannel(UUID serverId, ChannelCreateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(serverId, currentUserId); // Owner only

        Channel channel = Channel.builder()
                .serverId(serverId)
                .name(request.getName().toLowerCase().replace(" ", "-")) // lowercase, no spaces
                .type(request.getType())
                .build();
        channel = channelRepository.save(channel);
        return ChannelResponse.fromEntity(channel);
    }

    /**
     * LB-303: Lấy danh sách channel của server. Chỉ Member mới được xem.
     */
    @Transactional(readOnly = true)
    public List<ChannelResponse> getChannelsByServerId(UUID serverId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireMembership(serverId, currentUserId); // Member only

        return channelRepository.findByServerId(serverId).stream()
                .map(ChannelResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * LB-302: Đổi tên channel. Chỉ Owner được phép.
     */
    @Transactional
    public ChannelResponse renameChannel(UUID serverId, UUID channelId, String newName) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(serverId, currentUserId); // Owner only

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found: " + channelId));

        if (!channel.getServerId().equals(serverId)) {
            throw new LiveBoxException(HttpStatus.BAD_REQUEST, "Channel does not belong to this server.");
        }

        channel.setName(newName.toLowerCase().replace(" ", "-"));
        return ChannelResponse.fromEntity(channelRepository.save(channel));
    }

    /**
     * LB-302: Xóa channel. Chỉ Owner được phép.
     */
    @Transactional
    public void deleteChannel(UUID serverId, UUID channelId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(serverId, currentUserId); // Owner only

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found: " + channelId));

        if (!channel.getServerId().equals(serverId)) {
            throw new LiveBoxException(HttpStatus.BAD_REQUEST, "Channel does not belong to this server.");
        }

        channelRepository.delete(channel);
    }
}
