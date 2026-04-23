package com.livebox.module.server.repository;

import com.livebox.module.server.entity.BanList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BanListRepository extends JpaRepository<BanList, UUID> {
    boolean existsByServerIdAndBannedUserId(UUID serverId, UUID bannedUserId);
}
