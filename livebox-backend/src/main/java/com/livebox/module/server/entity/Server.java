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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Server — root container cho mọi hoạt động giao tiếp trong LiveBox.
 *
 * <p><b>ERD ref:</b> {@code servers} table (ERD v2).
 * <p><b>Glossary:</b> G01 (Server), G05 (Server Owner).
 * <p><b>UC ref:</b> UC-201 (Create Server), UC-302 (Manage Channels).
 * <p><b>Business Rules:</b>
 * <ul>
 *   <li>BR-03 — chỉ Owner mới có thể xóa Server, quản lý settings, tạo/xóa Channel.</li>
 *   <li>BR-04 — Server luôn phải có đúng 1 Owner; Owner không thể rời Server
 *       nếu chưa chuyển quyền hoặc xóa Server (UC-204 AF 2.1).</li>
 *   <li>BR-09 — avatar file ≤ 2MB, PNG/JPG (UC-201 AF 5.1).</li>
 * </ul>
 *
 * <p><b>Soft-delete:</b> Khi Server bị xóa, soft-delete record. Cascade delete
 * Channels, Messages, Memberships sẽ được xử lý bằng scheduled cleanup job (Phase 2).
 */
@Entity
@Table(
        name = "servers",
        indexes = {
                @Index(name = "idx_servers_owner_id", columnList = "owner_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Server extends BaseEntity {

    // ─────────────────────────────────────────────────────────────────────────
    // Owner
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Người tạo và quản trị Server (G05).
     * LAZY fetch: không cần load User khi chỉ query Server list.
     * {@code updatable = true} — hỗ trợ ownership transfer (BR-04, Phase 2).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "owner_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_servers_owner_id")
    )
    private User owner;

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tên Server — hiển thị trong sidebar và header.
     * Max 100 ký tự (validate tại Controller layer).
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * URL ảnh đại diện Server sau khi upload (UC-201).
     * File gốc giới hạn PNG/JPG ≤ 2MB (BR-09, C05).
     * Nullable — Server có thể không có avatar.
     */
    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;
}
