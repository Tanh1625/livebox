package com.livebox.module.server.entity;

import com.livebox.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "servers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Server extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;
}
