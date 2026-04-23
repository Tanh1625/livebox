package com.livebox.common.security;

import com.livebox.common.exception.LiveBoxException;
import com.livebox.module.channel.entity.Channel;
import com.livebox.module.channel.repository.ChannelRepository;
import com.livebox.module.server.entity.Membership;
import com.livebox.module.server.entity.Role;
import com.livebox.module.server.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * MembershipGuard — centralized access control for Server/Channel operations.
 *
 * <p>Inject this into any Service that needs to verify:
 * <ul>
 *   <li>User is a Member of the Server owning a Channel</li>
 *   <li>User is the Owner of a Server (for privileged actions)</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class MembershipGuard {

    private final MembershipRepository membershipRepository;
    private final ChannelRepository channelRepository;

    /**
     * Ensures the user is an active member of the given server.
     * Throws 403 Forbidden if not.
     */
    public void requireMembership(UUID serverId, UUID userId) {
        if (!membershipRepository.existsByUserIdAndServerId(userId, serverId)) {
            throw new LiveBoxException(HttpStatus.FORBIDDEN,
                    "Access denied: you are not a member of this server.");
        }
    }

    /**
     * Ensures the user is the OWNER of the given server.
     * Throws 403 Forbidden if not.
     */
    public void requireOwner(UUID serverId, UUID userId) {
        Membership membership = membershipRepository.findByUserIdAndServerId(userId, serverId)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.FORBIDDEN,
                        "Access denied: you are not a member of this server."));

        if (!Role.OWNER.name().equals(membership.getRole())) {
            throw new LiveBoxException(HttpStatus.FORBIDDEN,
                    "Access denied: only the server Owner can perform this action.");
        }
    }

    /**
     * Resolves the server that owns the given channel, then checks membership.
     * Use this before reading/sending messages in a channel.
     */
    public void requireChannelMembership(UUID channelId, UUID userId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND,
                        "Channel not found: " + channelId));
        requireMembership(channel.getServerId(), userId);
    }

    /**
     * Resolves the server that owns the given channel, then checks ownership.
     * Use this before creating/deleting channels.
     */
    public void requireChannelOwner(UUID channelId, UUID userId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND,
                        "Channel not found: " + channelId));
        requireOwner(channel.getServerId(), userId);
    }
}
