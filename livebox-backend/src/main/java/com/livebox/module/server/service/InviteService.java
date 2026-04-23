package com.livebox.module.server.service;

import com.livebox.common.exception.LiveBoxException;
import com.livebox.common.security.MembershipGuard;
import com.livebox.common.util.SecurityUtils;
import com.livebox.module.auth.entity.User;
import com.livebox.module.auth.repository.UserRepository;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * InviteService — LB-202: Invite link TTL 7 ngày → auto join server.
 */
@Service
@RequiredArgsConstructor
public class InviteService {

    // C06: TTL 7 ngày cho invite link
    private static final long INVITE_TTL_DAYS = 7;

    private final ServerRepository serverRepository;
    private final MembershipRepository membershipRepository;
    private final BanListRepository banListRepository;
    private final InviteCodeRepository inviteCodeRepository;
    private final UserRepository userRepository;
    private final MembershipGuard membershipGuard;

    /**
     * LB-202: Owner tạo invite link mới cho server.
     * Mỗi lần gọi tạo một code mới (UUID ngắn) với TTL 7 ngày.
     */
    @Transactional
    public InviteResponse generateInvite(UUID serverId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        membershipGuard.requireOwner(serverId, currentUserId);

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new LiveBoxException(HttpStatus.NOT_FOUND, "Server not found: " + serverId));

        // Tạo code ngắn gọn dễ share (8 ký tự đầu của UUID)
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
     * LB-202: User nhấn invite link → tự động join server nếu:
     * 1. Code hợp lệ và chưa hết hạn
     * 2. User chưa bị ban khỏi server này
     * 3. User chưa là member
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

        // Kiểm tra ban
        if (banListRepository.existsByServerIdAndBannedUserId(serverId, currentUserId)) {
            throw new LiveBoxException(HttpStatus.FORBIDDEN, "Bạn đã bị cấm khỏi server này.");
        }

        // Kiểm tra đã là member chưa
        if (membershipRepository.existsByUserIdAndServerId(currentUserId, serverId)) {
            return ServerResponse.fromEntity(invite.getServer());
        }

        // Tạo Membership mới
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
