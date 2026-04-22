package com.livebox.module.server.repository;

import com.livebox.module.server.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    List<Membership> findByUserId(UUID userId);
    List<Membership> findByServerId(UUID serverId);
    Optional<Membership> findByUserIdAndServerId(UUID userId, UUID serverId);
}
