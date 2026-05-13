package com.livebox.module.server.service;

import com.livebox.common.exception.LiveBoxException;
import com.livebox.common.exception.ResourceNotFoundException;
import com.livebox.common.security.MembershipGuard;
import com.livebox.common.util.FileUploadService;
import com.livebox.common.util.SecurityUtils;
import com.livebox.module.auth.entity.User;
import com.livebox.module.auth.repository.UserRepository;
import com.livebox.module.server.dto.ServerCreateRequest;
import com.livebox.module.server.dto.ServerUpdateRequest;
import com.livebox.module.server.dto.ServerResponse;
import com.livebox.module.server.mapper.ServerMapper;
import com.livebox.module.server.entity.BanList;
import com.livebox.module.server.entity.Membership;
import com.livebox.module.server.entity.Role;
import com.livebox.module.server.entity.Server;
import com.livebox.module.server.repository.BanListRepository;
import com.livebox.module.server.repository.MembershipRepository;
import com.livebox.module.server.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServerService {

    private final ServerRepository serverRepository;
    private final MembershipRepository membershipRepository;
    private final BanListRepository banListRepository;
    private final UserRepository userRepository;
    private final MembershipGuard membershipGuard;
    private final FileUploadService fileUploadService;
    private final ServerMapper serverMapper;

    @Transactional
    public ServerResponse createServer(ServerCreateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        String avatarUrl = null;
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            avatarUrl = fileUploadService.uploadImage(request.getAvatar(), "server_icons");
        }

        Server server = Server.builder()
                .name(request.getName())
                .avatarUrl(avatarUrl)
                .ownerId(currentUserId)
                .build();
        server = serverRepository.save(server);

        Membership membership = new Membership();
        membership.setServer(server);
        membership.setUser(userRepository.getReferenceById(currentUserId));
        membership.setRole(Role.OWNER.name());
        membership.setStatus("ACTIVE");
        membership.setJoinedAt(Instant.now());
        membershipRepository.save(membership);

        return serverMapper.toResponse(server);
    }

    @Transactional(readOnly = true)
    public List<ServerResponse> getMyServers() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return membershipRepository.findByUserId(currentUserId).stream()
                .map(m -> serverMapper.toResponse(m.getServer()))
                .collect(Collectors.toList());
    }

    /**
     * Returns only the servers owned by the current user (used by the management screen
     * where they can edit or delete their own servers).
     * Unlike getMyServers(), this excludes servers where the user is just a member.
     */
    @Transactional(readOnly = true)
    public List<ServerResponse> getMyOwnedServers() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return serverRepository.findByOwnerId(currentUserId).stream()
                .map(serverMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServerResponse getServerById(UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireMembership(id, currentUserId);
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + id));
        return serverMapper.toResponse(server);
    }

    @Transactional
    public ServerResponse updateServer(UUID id, ServerUpdateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(id, currentUserId);

        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + id));

        if (request.getName() != null) server.setName(request.getName());
        
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            if (server.getAvatarUrl() != null) {
                // To avoid storing orphaned images, we could extract the public ID and call fileUploadService.deleteImage
                // But for now, we'll just upload the new one
            }
            String avatarUrl = fileUploadService.uploadImage(request.getAvatar(), "server_icons");
            server.setAvatarUrl(avatarUrl);
        }

        return serverMapper.toResponse(serverRepository.save(server));
    }

    @Transactional
    public void deleteServer(UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(id, currentUserId);
        if (!serverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Server not found with id: " + id);
        }
        serverRepository.deleteById(id);
    }

    // ── LB-203: Kick Member (Owner only) ─────────────────────────────────────

    /**
     * Removes a member from the server (Owner only). The member can re-join via a new invite link.
     */
    @Transactional
    public void kickMember(UUID serverId, UUID targetUserId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(serverId, currentUserId);

        if (!membershipRepository.existsByUserIdAndServerId(targetUserId, serverId)) {
            throw new LiveBoxException(HttpStatus.NOT_FOUND, "User is not a member of this server.");
        }
        if (targetUserId.equals(currentUserId)) {
            throw new LiveBoxException(HttpStatus.BAD_REQUEST, "Owner cannot kick themselves.");
        }

        membershipRepository.deleteByUserIdAndServerId(targetUserId, serverId);
    }

    // ── LB-203: Ban Member (Owner only) ──────────────────────────────────────

    /**
     * Permanently bans a member from the server (Owner only). The user cannot re-join even with an invite link.
     */
    @Transactional
    public void banMember(UUID serverId, UUID targetUserId, String reason) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(serverId, currentUserId);

        if (targetUserId.equals(currentUserId)) {
            throw new LiveBoxException(HttpStatus.BAD_REQUEST, "Owner cannot ban themselves.");
        }
        if (banListRepository.existsByServerIdAndBannedUserId(serverId, targetUserId)) {
            throw new LiveBoxException(HttpStatus.CONFLICT, "User is already banned from this server.");
        }

        // Remove from server membership first (if still an active member)
        if (membershipRepository.existsByUserIdAndServerId(targetUserId, serverId)) {
            membershipRepository.deleteByUserIdAndServerId(targetUserId, serverId);
        }

        Server server = serverRepository.getReferenceById(serverId);
        User bannedUser = userRepository.getReferenceById(targetUserId);
        User bannedBy = userRepository.getReferenceById(currentUserId);

        BanList ban = new BanList();
        ban.setServer(server);
        ban.setBannedUser(bannedUser);
        ban.setBannedBy(bannedBy);
        ban.setReason(reason);
        ban.setBannedAt(Instant.now());
        banListRepository.save(ban);
    }

    // ── LB-204: Leave Server (Member tự rời) ─────────────────────────────────

    /**
     * Allows a member to leave a server voluntarily.
     * The owner must transfer ownership first (transfer not yet implemented — returns a clear error).
     */
    @Transactional
    public void leaveServer(UUID serverId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireMembership(serverId, currentUserId);

        Membership membership = membershipRepository.findByUserIdAndServerId(currentUserId, serverId)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND, "Membership not found."));

        if (Role.OWNER.name().equals(membership.getRole())) {
            throw new LiveBoxException(HttpStatus.BAD_REQUEST,
                    "Owner cannot leave the server. Transfer ownership first.");
        }

        membershipRepository.deleteByUserIdAndServerId(currentUserId, serverId);
    }
}
