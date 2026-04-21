package com.livebox.module.server.entity;

import com.livebox.common.entity.BaseEntity;
import com.livebox.module.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "ban_lists", uniqueConstraints = {
    @UniqueConstraint(name = "uq_banlist_server_user", columnNames = {"server_id", "banned_user_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class BanList extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banned_user_id", nullable = false)
    private User bannedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banned_by", nullable = true)
    private User bannedBy;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "banned_at", nullable = false)
    private Instant bannedAt;

}
