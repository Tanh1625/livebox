package com.livebox.module.server.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * InvitePreviewResponse — dữ liệu trả về khi client fetch preview của invite link.
 *
 * <p>Dùng cho bước đầu tiên của invite flow:
 * <ol>
 *   <li>Frontend nhận invite link: /invite/{code}</li>
 *   <li>Gọi GET /api/v1/invites/{code} → nhận DTO này để hiển thị Server preview</li>
 *   <li>User ấn "Tham gia" → gọi POST /api/v1/invites/{code}/join</li>
 * </ol>
 */
@Getter
@Builder
public class InvitePreviewResponse {

    /** Code của invite link */
    private String code;

    /** Thông tin server sẽ join */
    private UUID serverId;
    private String serverName;
    private String serverAvatarUrl;

    /** Số thành viên hiện tại trong server */
    private long memberCount;

    /** Thời hạn hết hạn của invite link */
    private Instant expiresAt;

    /** Người dùng hiện tại đã là member chưa (null nếu chưa đăng nhập) */
    private Boolean alreadyMember;
}
