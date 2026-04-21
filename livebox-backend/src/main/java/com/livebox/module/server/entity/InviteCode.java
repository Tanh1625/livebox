package com.livebox.module.server.entity;

import com.livebox.common.entity.BaseEntity;
import com.livebox.module.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * InviteCode — mã mời tạm thời với TTL 7 ngày để onboard Member mới vào Server.
 *
 * <p><b>ERD ref:</b> {@code invite_codes} table (ERD v2).
 * <p><b>Glossary:</b> G07 (Invite Link — URL dạng /invite/{code}).
 * <p><b>UC ref:</b> UC-202 (Generate Invite Link, Join via Link).
 * <p><b>Business Rules:</b>
 * <ul>
 *   <li>BR-05 — Invite Link phải có TTL và tự động hết hạn sau 7 ngày (C06).</li>
 *   <li>BR-06 — BANNED user không được join dù có invite link hợp lệ
 *       (check tại Service layer trước khi tạo Membership).</li>
 * </ul>
 *
 * <p><b>Unique constraint:</b> {@code code} phải unique toàn hệ thống —
 * đảm bảo URL /invite/{code} không ambiguous.
 *
 * <p><b>Expiry strategy:</b> {@code expiresAt} được check tại Service layer.
 * Expired codes sẽ được cleanup bởi scheduled job (SRS §1.4.3 Feature 5).
 *
 * <p><b>Soft-delete:</b> Không dùng — expired/used codes chỉ cần cleanup cứng
 * để không bloat index trên column {@code code}.
 */
@Entity
@Table(
        name = "invite_codes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_invite_codes_code", columnNames = "code")
        },
        indexes = {
                @Index(name = "idx_invite_codes_server_id",  columnList = "server_id"),
                @Index(name = "idx_invite_codes_code",       columnList = "code"),
                @Index(name = "idx_invite_codes_expires_at", columnList = "expires_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteCode extends BaseEntity {

    // ─────────────────────────────────────────────────────────────────────────
    // Foreign Keys
    // ─────────────────────────────────────────────────────────────────────────

    /** Server mà code này dẫn đến. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "server_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_invite_codes_server_id")
    )
    private Server server;

    /**
     * Owner đã tạo code này (G05).
     * Lưu để audit — biết ai tạo link khi cần revoke thủ công.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "created_by_user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_invite_codes_created_by")
    )
    private User createdByUser;

    // ─────────────────────────────────────────────────────────────────────────
    // Code Data
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Chuỗi code ngẫu nhiên, duy nhất — phần động của URL /invite/{code}.
     * Độ dài 8–12 ký tự alphanumeric (generate tại Service layer).
     */
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    /**
     * Thời điểm code hết hạn (UTC).
     * {@code expiresAt = createdAt + 7 days} (C06, AppConstants.INVITE_LINK_TTL_DAYS).
     * Service layer check: {@code expiresAt.isBefore(Instant.now())} → trả MSG08.
     */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
