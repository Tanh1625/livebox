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
 * PresenceService — manages online/offline status for server members.
 *
 * <p>Phase 1: In-memory store (ConcurrentHashMap). Accepted trade-off:
 * server restart resets presence (clients will re-broadcast ONLINE on WebSocket reconnect).
 *
 * <p>Data structure:
 * <pre>
 *   onlineUsers: Map&lt;userId, Set&lt;sessionId&gt;&gt;
 *   — A user can open multiple tabs, resulting in multiple sessionIds.
 *   — OFFLINE is only broadcast when the Set is empty (all tabs closed).
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
     * Marks the user online on STOMP CONNECT. Broadcasts ONLINE event to all servers the user belongs to.
     */
    public void markOnline(UUID userId, String sessionId) {
        onlineUsers.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        log.debug("User {} online (session={})", userId, sessionId);
        broadcastPresence(userId, PresenceEvent.Status.ONLINE);
    }

    /**
     * Marks the user offline on STOMP DISCONNECT.
     * Only broadcasts OFFLINE when no active sessions remain (all tabs closed).
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

    /** Returns true if the user currently has at least one active WebSocket session. */
    public boolean isOnline(UUID userId) {
        return onlineUsers.containsKey(userId);
    }

    /**
     * Broadcasts a presence event to all servers the user belongs to.
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

        // Broadcast to every server the user is a member of
        membershipRepository.findByUserId(userId).forEach(membership -> {
            String destination = "/topic/servers/" + membership.getServer().getId() + "/members";
            messagingTemplate.convertAndSend(destination, event);
        });
    }

    /**
     * Returns all members of a server with their current online/offline status.
     * Used by the member list sidebar.
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
