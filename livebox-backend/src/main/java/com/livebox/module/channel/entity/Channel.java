package com.livebox.module.channel.entity;

import com.livebox.common.entity.BaseEntity;
import com.livebox.common.enums.ChannelType;
import com.livebox.module.auth.entity.User;
import com.livebox.module.server.entity.Server;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Channel — kênh giao tiếp nằm trong một Server. Có 2 loại: TEXT và VOICE.
 *
 * <p><b>ERD ref:</b> {@code channels} table (ERD v2).
 * <p><b>Glossary:</b> G02 (Channel), G03 (Text Channel), G04 (Voice Channel).
 * <p><b>UC ref:</b> UC-201 (auto-create #general TEXT channel),
 *                   UC-301 (Real-time Messaging), UC-302 (Create/Manage Text Channels),
 *                   UC-401 (Voice Channel).
 * <p><b>Business Rules:</b>
 * <ul>
 *   <li>BR-03 — chỉ Server Owner mới được tạo/xóa Channel (enforce tại Service).</li>
 *   <li>Tên Channel lowercase, không dấu (e.g., #general, #dev-team) — validate tại Controller.</li>
 *   <li>C02 — Voice Channel tối đa 20 người/phòng (enforce tại WebSocket Service).</li>
 * </ul>
 *
 * <p><b>Soft-delete:</b> Kế thừa từ BaseEntity. Khi Owner xóa Channel,
 * soft-delete thay vì hard-delete để giữ Message history (UC-302).
 */
@Entity
@Table(
        name = "channels",
        indexes = {
                @Index(name = "idx_channels_server_id", columnList = "server_id"),
                @Index(name = "idx_channels_type",      columnList = "type")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Channel extends BaseEntity {

    // ─────────────────────────────────────────────────────────────────────────
    // Foreign Keys
    // ─────────────────────────────────────────────────────────────────────────

    /** Server chứa Channel này. LAZY — không cần load Server khi query channel list. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "server_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_channels_server_id")
    )
    private Server server;

    /**
     * Owner đã tạo Channel — audit + permission check.
     * {@code updatable = false} — người tạo Channel không thay đổi.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "created_by_user_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_channels_created_by")
    )
    private User createdByUser;

    // ─────────────────────────────────────────────────────────────────────────
    // Channel Data
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tên Channel — hiển thị trong sidebar (e.g., "general", "dev-team").
     * Frontend render với prefix "#". Max 100 ký tự.
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Loại Channel: TEXT (WebSocket/STOMP) hoặc VOICE (WebRTC).
     * Stored as String để schema không cần migration khi thêm type mới.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private ChannelType type;
}
