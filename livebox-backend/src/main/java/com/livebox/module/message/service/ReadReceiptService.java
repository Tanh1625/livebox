package com.livebox.module.message.service;

import com.livebox.common.security.MembershipGuard;
import com.livebox.common.util.SecurityUtils;
import com.livebox.module.channel.entity.Channel;
import com.livebox.module.channel.repository.ChannelRepository;
import com.livebox.module.message.dto.UnreadCountResponse;
import com.livebox.module.message.entity.ReadReceipt;
import com.livebox.module.message.repository.MessageRepository;
import com.livebox.module.message.repository.ReadReceiptRepository;
import com.livebox.module.server.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ReadReceiptService — SCRUM-62, 63: Đánh dấu đã đọc và tính unread badge.
 */
@Service
@RequiredArgsConstructor
public class ReadReceiptService {

    private final ReadReceiptRepository readReceiptRepository;
    private final MessageRepository messageRepository;
    private final MembershipRepository membershipRepository;
    private final ChannelRepository channelRepository;
    private final MembershipGuard membershipGuard;

    /**
     * SCRUM-63: Đánh dấu user đã đọc hết tin nhắn trong channel tại thời điểm hiện tại.
     * Dùng UPSERT để tránh duplicate record.
     */
    @Transactional
    public void markAsRead(UUID channelId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireChannelMembership(channelId, currentUserId);
        readReceiptRepository.upsertReadAt(currentUserId, channelId, Instant.now());
    }

    /**
     * SCRUM-61: Lấy unread count cho tất cả channel trong một server.
     * Dùng cho FE sidebar để hiển thị badge số.
     *
     * @param serverId server cần lấy unread
     * @return list {channelId, unreadCount} — channel có unread = 0 vẫn trả về
     */
    @Transactional(readOnly = true)
    public List<UnreadCountResponse> getUnreadCounts(UUID serverId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireMembership(serverId, currentUserId);

        List<Channel> channels = channelRepository.findByServerId(serverId);

        return channels.stream().map(channel -> {
            // Tìm readAt của user trong channel này (mặc định EPOCH nếu chưa đọc lần nào)
            Instant since = readReceiptRepository
                    .findByUserIdAndChannelId(currentUserId, channel.getId())
                    .map(ReadReceipt::getReceiptUpdatedAt)
                    .orElse(Instant.EPOCH);

            long count = messageRepository.countUnreadSince(channel.getId(), since);

            return UnreadCountResponse.builder()
                    .channelId(channel.getId())
                    .unreadCount(count)
                    .build();
        }).collect(Collectors.toList());
    }
}
