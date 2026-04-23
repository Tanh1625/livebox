package com.livebox.module.message.service;

import com.livebox.common.exception.LiveBoxException;
import com.livebox.common.security.MembershipGuard;
import com.livebox.common.util.SecurityUtils;
import com.livebox.module.auth.entity.User;
import com.livebox.module.auth.repository.UserRepository;
import com.livebox.module.channel.entity.Channel;
import com.livebox.module.channel.entity.ChannelType;
import com.livebox.module.channel.repository.ChannelRepository;
import com.livebox.module.message.dto.MessageResponse;
import com.livebox.module.message.dto.SendMessageRequest;
import com.livebox.module.message.entity.Message;
import com.livebox.module.message.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * MessageService — Core logic cho Text Messaging (SCRUM-53, 54, 55).
 *
 * <p>Flow khi gửi tin nhắn:
 * <ol>
 *   <li>Validate channel tồn tại và là TEXT type</li>
 *   <li>Lưu Message vào DB (persistent)</li>
 *   <li>Broadcast MessageResponse tới /topic/channels/{channelId} qua STOMP</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MembershipGuard membershipGuard;

    /**
     * SCRUM-53: Lấy lịch sử tin nhắn của Channel, phân trang.
     *
     * @param channelId ID của Channel cần lấy lịch sử
     * @param page      số trang (0-indexed)
     * @param size      số tin nhắn mỗi trang (mặc định 50)
     * @return Page<MessageResponse>
     */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessageHistory(UUID channelId, int page, int size) {
        // 🔒 Security: chỉ member của server chứa channel mới được đọc lịch sử
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireChannelMembership(channelId, currentUserId);

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return messageRepository.findByChannelIdOrderByCreatedAtDesc(channelId, pageable)
                .map(MessageResponse::from);
    }

    /**
     * SCRUM-54 + 55: Lưu tin nhắn vào DB và broadcast realtime qua STOMP.
     *
     * @param channelId ID của Channel
     * @param senderEmail Email của người gửi (từ JWT principal)
     * @param request payload chứa content
     * @return MessageResponse đã được lưu
     */
    @Transactional
    public MessageResponse sendAndBroadcast(UUID channelId, String senderEmail, SendMessageRequest request) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND, "Channel not found: " + channelId));

        if (channel.getType() != ChannelType.TEXT) {
            throw new LiveBoxException(HttpStatus.BAD_REQUEST, "Cannot send text messages to a Voice channel.");
        }

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND, "User not found: " + senderEmail));

        // 🔒 Security: kiểm tra sender là member của server chứa channel
        membershipGuard.requireMembership(channel.getServerId(), sender.getId());

        Message message = Message.builder()
                .channel(channel)
                .sender(sender)
                .content(request.getContent())
                .build();

        Message saved = messageRepository.save(message);
        MessageResponse response = MessageResponse.from(saved);

        String destination = "/topic/channels/" + channelId;
        messagingTemplate.convertAndSend(destination, response);
        log.debug("Broadcast message {} to {}", saved.getId(), destination);

        return response;
    }

}
