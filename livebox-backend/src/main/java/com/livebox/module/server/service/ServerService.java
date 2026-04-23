package com.livebox.module.server.service;

import com.livebox.common.exception.LiveBoxException;
import com.livebox.common.exception.ResourceNotFoundException;
import com.livebox.common.security.MembershipGuard;
import com.livebox.common.util.SecurityUtils;
import com.livebox.module.auth.entity.User;
import com.livebox.module.auth.repository.UserRepository;
import com.livebox.module.server.dto.ServerCreateRequest;
import com.livebox.module.server.dto.ServerUpdateRequest;
import com.livebox.module.server.dto.ServerResponse;
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

    @Transactional
    public ServerResponse createServer(ServerCreateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Server server = Server.builder()
                .name(request.getName())
                .avatarUrl(request.getAvatarUrl())
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

        return ServerResponse.fromEntity(server);
    }

    @Transactional(readOnly = true)
    public List<ServerResponse> getMyServers() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return membershipRepository.findByUserId(currentUserId).stream()
                .map(m -> ServerResponse.fromEntity(m.getServer()))
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách server mà mình là OWNER (dùng cho màn hình quản lý: sửa/xóa server).
     * Khác với getMyServers() trả về tất cả server mình tham gia (kể cả server của người khác).
     */
    @Transactional(readOnly = true)
    public List<ServerResponse> getMyOwnedServers() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return serverRepository.findByOwnerId(currentUserId).stream()
                .map(ServerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServerResponse getServerById(UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireMembership(id, currentUserId);
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + id));
        return ServerResponse.fromEntity(server);
    }

    @Transactional
    public ServerResponse updateServer(UUID id, ServerUpdateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(id, currentUserId);

        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + id));

        if (request.getName() != null) server.setName(request.getName());
        if (request.getAvatarUrl() != null) server.setAvatarUrl(request.getAvatarUrl());

        return ServerResponse.fromEntity(serverRepository.save(server));
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
     * Owner kick một member ra khỏi server. Member vẫn có thể rejoin qua invite link mới.
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
     * Owner ban vĩnh viễn một member. User sẽ không thể join lại dù có invite link.
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

        // Kick khỏi server trước (nếu đang là member)
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
     * Member tự rời server. Owner phải chuyển quyền trước (chưa implement transfer — trả lỗi rõ ràng).
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
