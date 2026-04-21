package com.livebox.module.server.entity;

import com.livebox.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "invite_codes")
@Getter
@Setter
@NoArgsConstructor
public class InviteCode extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @Column(name = "code", nullable = false, unique = true, length = 100)
    private String code;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

}
