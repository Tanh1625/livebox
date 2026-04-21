package com.livebox.module.auth.entity;

import com.livebox.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * User — core entity đại diện cho tài khoản đã đăng ký trong LiveBox.
 *
 * <p><b>ERD ref:</b> {@code users} table (ERD v2).
 * <p><b>UC ref:</b> UC-101 (Register), UC-102 (Login), UC-103 (Logout), UC-601 (Update Profile).
 * <p><b>Business Rules:</b> BR-08 (password hashed), BR-09 (avatar ≤ 2MB PNG/JPG).
 *
 * <p><b>Lombok note (coding_conventions.md §4):</b>
 * {@code @Data} bị cấm trên Entity. Dùng {@code @Getter}, {@code @Setter},
 * {@code @Builder}, {@code @NoArgsConstructor}, {@code @AllArgsConstructor} riêng lẻ.
 *
 * <p><b>Soft-delete:</b> Kế thừa {@code isDeleted} + {@code deletedAt} từ {@link BaseEntity}.
 * Khi xóa User, chỉ soft-delete — giữ lại lịch sử Message.
 */
@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    // ─────────────────────────────────────────────────────────────────────────
    // Identity & Authentication
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Email — business key, dùng để đăng nhập.
     * Unique constraint đảm bảo không duplicate (UC-101 AF 5.2, MSG04).
     * Max 255 per RFC 5321.
     */
    @Column(name = "email", nullable = false, length = 255)
    private String email;

    /**
     * Mật khẩu đã hash (BCrypt). KHÔNG bao giờ lưu plain-text (BR-08).
     * Min 8 ký tự được enforce ở tầng Service.
     */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tên hiển thị trong Server, tin nhắn, member list (G12).
     * Giới hạn 1–50 ký tự (UC-601, AppConstants.DISPLAY_NAME_MAX_LENGTH).
     */
    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    /**
     * URL avatar người dùng sau khi upload (UC-601).
     * File gốc giới hạn PNG/JPG ≤ 2MB (BR-09, C05).
     * Nullable — user có thể chưa upload avatar.
     */
    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;
}
