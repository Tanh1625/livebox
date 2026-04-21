package com.livebox.module.server.entity;

import com.livebox.common.entity.BaseEntity;
import com.livebox.common.enums.MemberRole;
import com.livebox.common.enums.MembershipStatus;
import com.livebox.module.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * Membership — associative entity giải quyết quan hệ N:M giữa User và Server.
 *
 * <p>Đây là bảng trung tâm thực thi Server-level RBAC (Role-Based Access Control):
 * <ul>
 *   <li>{@code role}   — OWNER hoặc MEMBER (MemberRole enum).</li>
 *   <li>{@code status} — ACTIVE, KICKED, BANNED, LEFT (MembershipStatus enum).</li>
 * </ul>
 *
 * <p><b>ERD ref:</b> {@code memberships} table (ERD v2) — join table User ↔ Server.
 * <p><b>Glossary:</b> G05 (Owner), G06 (Member), G08 (Kick), G09 (Ban).
 * <p><b>UC ref:</b> UC-201 (auto-create OWNER membership), UC-202 (join via invite),
 *                   UC-203 (kick/ban), UC-204 (leave).
 * <p><b>Business Rules:</b>
 * <ul>
 *   <li>BR-04 — đúng 1 OWNER per Server tại mọi thời điểm.</li>
 *   <li>BR-06 — BANNED user không thể rejoin dù có invite link hợp lệ.</li>
 * </ul>
 *
 * <p><b>Unique constraint:</b> {@code (user_id, server_id)} — 1 user chỉ có
 * 1 membership record per Server. Lịch sử kick/ban được giữ lại qua {@code status}
 * thay vì tạo nhiều record (3NF compliant).
 *
 * <p><b>Soft-delete:</b> Không dùng soft-delete ở đây. Status enum thay thế:
 * KICKED/BANNED/LEFT đủ để phân biệt trạng thái mà không xóa record.
 */
@Entity
@Table(
        name = "memberships",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_memberships_user_server",
                        columnNames = {"user_id", "server_id"}
                )
        },
        indexes = {
                @Index(name = "idx_memberships_server_id", columnList = "server_id"),
                @Index(name = "idx_memberships_user_id",   columnList = "user_id"),
                @Index(name = "idx_memberships_status",    columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membership extends BaseEntity {

    // ─────────────────────────────────────────────────────────────────────────
    // Foreign Keys
    // ─────────────────────────────────────────────────────────────────────────

    /** Thành viên (G06) hoặc Owner (G05). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_memberships_user_id")
    )
    private User user;

    /** Server mà user tham gia. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "server_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_memberships_server_id")
    )
    private Server server;

    // ─────────────────────────────────────────────────────────────────────────
    // Role & Status
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Vai trò của user trong Server: OWNER hoặc MEMBER.
     * Stored as String để migration không bị breaking khi thêm role mới.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private MemberRole role;

    /**
     * Trạng thái membership hiện tại.
     * ACTIVE = đang hoạt động, KICKED/BANNED/LEFT = đã rời (các lý do khác nhau).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private MembershipStatus status = MembershipStatus.ACTIVE;

    /**
     * Thời điểm user join Server (UTC). Set khi record được tạo, không thay đổi.
     */
    @Column(name = "joined_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();
}
