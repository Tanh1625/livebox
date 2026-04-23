package com.livebox.module.server.service;

import com.livebox.module.auth.entity.User;
import com.livebox.module.auth.repository.UserRepository;
import com.livebox.module.server.dto.MemberStatusResponse;
import com.livebox.module.server.dto.PresenceEvent;
import com.livebox.module.server.entity.Membership;
import com.livebox.module.server.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * PresenceService — SCRUM-59, 60: Quản lý trạng thái online/offline.
 *
 * <p>Phase 1: In-memory store (ConcurrentHashMap). Trade-off đã chấp nhận:
 * restart server → reset presence (user reconnect WS sẽ tự cập nhật lại).
 *
 * <p>Data structure:
 * <pre>
 *   onlineUsers: Map&lt;userId, Set&lt;sessionId&gt;&gt;
 *   — Một user có thể mở nhiều tab → nhiều sessionId.
 *   — Chỉ OFFLINE khi Set rỗng (tất cả tab đóng).
 * </pre>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PresenceService {

    /** userId → Set of active STOMP session IDs */
    private final Map<UUID, Set<String>> onlineUsers = new ConcurrentHashMap<>();

    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * SCRUM-58/59: Đánh dấu user online khi WS CONNECT.
     * Broadcast ONLINE event đến tất cả server user đang tham gia.
     */
    public void markOnline(UUID userId, String sessionId) {
        onlineUsers.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        log.debug("User {} online (session={})", userId, sessionId);
        broadcastPresence(userId, PresenceEvent.Status.ONLINE);
    }

    /**
     * SCRUM-58/59: Đánh dấu user offline khi WS DISCONNECT.
     * Chỉ broadcast OFFLINE khi không còn session nào active (đóng hết tab).
     */
    public void markOffline(UUID userId, String sessionId) {
        Set<String> sessions = onlineUsers.get(userId);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                onlineUsers.remove(userId);
                log.debug("User {} fully offline", userId);
                broadcastPresence(userId, PresenceEvent.Status.OFFLINE);
            }
        }
    }

    /** Kiểm tra user có đang online không. */
    public boolean isOnline(UUID userId) {
        return onlineUsers.containsKey(userId);
    }

    /**
     * SCRUM-60: Broadcast presence event đến tất cả server mà user là member.
     * Destination: /topic/servers/{serverId}/members
     */
    private void broadcastPresence(UUID userId, PresenceEvent.Status status) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        PresenceEvent event = PresenceEvent.builder()
                .userId(userId)
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .status(status)
                .build();

        // Broadcast đến mọi server user là thành viên
        membershipRepository.findByUserId(userId).forEach(membership -> {
            String destination = "/topic/servers/" + membership.getServer().getId() + "/members";
            messagingTemplate.convertAndSend(destination, event);
        });
    }

    /**
     * REST: Lấy danh sách member của server kèm trạng thái online/offline.
     * Dùng cho sidebar member list (SCRUM-59).
     */
    public List<MemberStatusResponse> getMembersWithStatus(UUID serverId) {
        return membershipRepository.findByServerId(serverId).stream()
                .map(m -> {
                    User u = m.getUser();
                    return MemberStatusResponse.builder()
                            .userId(u.getId())
                            .displayName(u.getDisplayName())
                            .avatarUrl(u.getAvatarUrl())
                            .role(m.getRole())
                            .online(isOnline(u.getId()))
                            .build();
                })
                .collect(Collectors.toList());
    }
}
