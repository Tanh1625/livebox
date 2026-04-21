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
 * BanList — lưu trữ danh sách User bị ban vĩnh viễn khỏi một Server.
 *
 * <p><b>ERD ref:</b> {@code ban_list} table (ERD v2).
 * <p><b>Glossary:</b> G09 (Ban — chặn vĩnh viễn).
 * <p><b>UC ref:</b> UC-203 AF 2.1 (Ban Member — Owner selects "Ban Member").
 * <p><b>Business Rules:</b>
 * <ul>
 *   <li>BR-06 — BANNED user bị prohibit tuyệt đối, kể cả khi có invite link hợp lệ.</li>
 * </ul>
 *
 * <p><b>Tách biệt với Membership:</b> BanList tồn tại độc lập để:
 * <ol>
 *   <li>Vẫn block join kể cả khi Membership record bị xóa (e.g., cleanup job).</li>
 *   <li>Cho phép Owner "lift ban" (Phase 2) mà không ảnh hưởng Membership history.</li>
 * </ol>
 *
 * <p><b>Unique constraint:</b> {@code (server_id, banned_user_id)} — 1 user chỉ có
 * 1 ban record per Server tại mọi thời điểm.
 *
 * <p><b>Soft-delete:</b> Kế thừa từ BaseEntity. Soft-delete ban record = "lift ban" (Phase 2).
 */
@Entity
@Table(
        name = "ban_list",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ban_list_server_user",
                        columnNames = {"server_id", "banned_user_id"}
                )
        },
        indexes = {
                @Index(name = "idx_ban_list_server_id",      columnList = "server_id"),
                @Index(name = "idx_ban_list_banned_user_id", columnList = "banned_user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BanList extends BaseEntity {

    // ─────────────────────────────────────────────────────────────────────────
    // Foreign Keys
    // ─────────────────────────────────────────────────────────────────────────

    /** Server mà user bị ban khỏi. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "server_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_ban_list_server_id")
    )
    private Server server;

    /** User bị ban (G09). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "banned_user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_ban_list_banned_user_id")
    )
    private User bannedUser;

    /** Owner đã thực hiện ban action — audit trail. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "banned_by_user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_ban_list_banned_by")
    )
    private User bannedBy;

    // ─────────────────────────────────────────────────────────────────────────
    // Ban Metadata
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lý do ban (tùy chọn) — giúp Owner ghi nhớ context khi lift ban.
     * Nullable vì UC-203 không bắt buộc nhập reason.
     */
    @Column(name = "reason", length = 500)
    private String reason;

    /**
     * Thời điểm ban được thực hiện (UTC).
     * {@code updatable = false} — ban timestamp không thay đổi.
     */
    @Column(name = "banned_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant bannedAt = Instant.now();
}
