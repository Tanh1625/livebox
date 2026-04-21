package com.livebox.module.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * RefreshToken — lưu trữ Refresh Token để hỗ trợ session persistence và revocation.
 *
 * <p><b>ERD ref:</b> {@code refresh_tokens} table (ERD v2).
 * <p><b>UC ref:</b> UC-102 (Session Persistence), UC-103 (Secure Logout — revoke token).
 * <p><b>Business Rules:</b> C04 (Refresh Token lưu DB, revocable), BR-01, BG-05.
 *
 * <p><b>Thiết kế:</b>
 * <ul>
 *   <li>Không extend BaseEntity — entity này không cần {@code updatedAt}/audit fields đầy đủ.
 *       Chỉ cần {@code createdAt} và {@code expiresAt}.</li>
 *   <li>Khi logout: DELETE record khỏi DB thay vì soft-delete (UC-103).</li>
 *   <li>Khi token refresh: DELETE old token → INSERT new token (rotation pattern).</li>
 * </ul>
 *
 * <p><b>Index:</b> {@code token_value} được index UNIQUE để lookup nhanh O(log n).
 */
@Entity
@Table(
        name = "refresh_tokens",
        indexes = {
                @Index(name = "idx_refresh_tokens_token_value", columnList = "token_value", unique = true),
                @Index(name = "idx_refresh_tokens_user_id",    columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    // ─────────────────────────────────────────────────────────────────────────
    // Primary Key
    // ─────────────────────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "token_id", updatable = false, nullable = false)
    private UUID tokenId;

    // ─────────────────────────────────────────────────────────────────────────
    // Foreign Key
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Chủ sở hữu token. Cascade DELETE: khi User bị xóa → tất cả token bị xóa.
     * LAZY fetch: không cần load User khi chỉ validate token.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_refresh_tokens_user_id")
    )
    private User user;

    // ─────────────────────────────────────────────────────────────────────────
    // Token Data
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Giá trị Refresh Token (UUID chuỗi ngẫu nhiên, duy nhất toàn hệ thống).
     * Index UNIQUE đảm bảo không thể có 2 session trùng token.
     */
    @Column(name = "token_value", nullable = false, unique = true, length = 512)
    private String tokenValue;

    /**
     * Thời điểm token hết hạn (UTC). Refresh Token hết hạn sau 7 ngày (C04, G16).
     * Service layer so sánh {@code expiresAt.isBefore(Instant.now())} để validate.
     */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /**
     * Thời điểm token được tạo (UTC). Dùng để audit và debug.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
