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
@Table(name = "memberships", uniqueConstraints = {
    @UniqueConstraint(name = "uq_membership_user_server", columnNames = {"user_id", "server_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class Membership extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @Column(name = "role", nullable = false, length = 50)
    private String role;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

}
