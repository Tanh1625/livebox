package com.livebox.module.server.service;

import com.livebox.common.exception.LiveBoxException;
import com.livebox.common.security.MembershipGuard;
import com.livebox.common.util.SecurityUtils;
import com.livebox.module.auth.entity.User;
import com.livebox.module.auth.repository.UserRepository;
import com.livebox.module.server.dto.InvitePreviewResponse;
import com.livebox.module.server.dto.InviteResponse;
import com.livebox.module.server.dto.ServerResponse;
import com.livebox.module.server.entity.BanList;
import com.livebox.module.server.entity.InviteCode;
import com.livebox.module.server.entity.Membership;
import com.livebox.module.server.entity.Role;
import com.livebox.module.server.entity.Server;
import com.livebox.module.server.repository.BanListRepository;
import com.livebox.module.server.repository.InviteCodeRepository;
import com.livebox.module.server.repository.MembershipRepository;
import com.livebox.module.server.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;


/**
 * InviteService — LB-202: Invite link with a 7-day TTL that auto-joins the user to a server.
 */
@Service
@RequiredArgsConstructor
public class InviteService {

    // C06: Invite link TTL — 7 days
    private static final long INVITE_TTL_DAYS = 7;

    private final ServerRepository serverRepository;
    private final MembershipRepository membershipRepository;
    private final BanListRepository banListRepository;
    private final InviteCodeRepository inviteCodeRepository;
    private final UserRepository userRepository;
    private final MembershipGuard membershipGuard;

    /**
     * LB-202: Generates a new invite link for the server (Owner only).
     * Each call creates a new code (short UUID) with a 7-day TTL.
     */
    @Transactional
    public InviteResponse generateInvite(UUID serverId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(serverId, currentUserId);

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND, "Server not found: " + serverId));

        // Short, shareable code (first 8 characters of a UUID, uppercased)
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        Instant expiresAt = Instant.now().plus(INVITE_TTL_DAYS, ChronoUnit.DAYS);

        InviteCode invite = new InviteCode();
        invite.setServer(server);
        invite.setCode(code);
        invite.setExpiresAt(expiresAt);
        inviteCodeRepository.save(invite);

        return InviteResponse.builder()
                .id(invite.getId())
                .code(code)
                .inviteUrl("/invite/" + code)
                .expiresAt(expiresAt)
                .serverId(serverId)
                .build();
    }

    /**
     * Step 1 of the invite flow: shows a server preview before the user decides to join.
     *
     * <p>No strict authentication required — but if the user is already logged in,
     * returns {@code alreadyMember=true/false} so the frontend can show/hide the join button.
     *
     * @param code invite code (8 characters)
     * @return server preview information
     */
    @Transactional(readOnly = true)
    public InvitePreviewResponse previewInvite(String code) {
        InviteCode invite = inviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND, "Invite link không hợp lệ."));

        if (invite.getExpiresAt().isBefore(Instant.now())) {
            throw new LiveBoxException(HttpStatus.GONE, "Invite link đã hết hạn.");
        }

        Server server = invite.getServer();
        long memberCount = membershipRepository.countByServerId(server.getId());

        // If logged in, return alreadyMember status; if not authenticated, return null
        Boolean alreadyMember = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            try {
                UUID currentUserId = SecurityUtils.getCurrentUserId();
                alreadyMember = membershipRepository.existsByUserIdAndServerId(currentUserId, server.getId());
            } catch (Exception ignored) {
                // Cannot resolve userId — treat as unauthenticated
            }
        }

        return InvitePreviewResponse.builder()
                .code(code)
                .serverId(server.getId())
                .serverName(server.getName())
                .serverAvatarUrl(server.getAvatarUrl())
                .memberCount(memberCount)
                .expiresAt(invite.getExpiresAt())
                .alreadyMember(alreadyMember)
                .build();
    }

    /**
     * LB-202: Joins a server via invite link if:
     * 1. The code is valid and not expired
     * 2. The user is not banned from this server
     * 3. The user is not already a member
     */
    @Transactional
    public ServerResponse joinByInvite(String code) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        InviteCode invite = inviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND, "Invite link không hợp lệ."));

        if (invite.getExpiresAt().isBefore(Instant.now())) {
            throw new LiveBoxException(HttpStatus.GONE, "Invite link đã hết hạn.");
        }

        UUID serverId = invite.getServer().getId();

        // Check if the user is banned from this server
        if (banListRepository.existsByServerIdAndBannedUserId(serverId, currentUserId)) {
            throw new LiveBoxException(HttpStatus.FORBIDDEN, "You have been banned from this server.");
        }

        // Check if the user is already a member
        if (membershipRepository.existsByUserIdAndServerId(currentUserId, serverId)) {
            return ServerResponse.fromEntity(invite.getServer());
        }

        // Create a new Membership
        User user = userRepository.getReferenceById(currentUserId);
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setServer(invite.getServer());
        membership.setRole(Role.MEMBER.name());
        membership.setStatus("ACTIVE");
        membership.setJoinedAt(Instant.now());
        membershipRepository.save(membership);

        return ServerResponse.fromEntity(invite.getServer());
    }
}
