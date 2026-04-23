package com.livebox.module.server.repository;

import com.livebox.module.server.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    /** Fetch user eagerly để tránh LazyInitializationException khi dùng ngoài @Transactional. */
    @Query("SELECT m FROM Membership m JOIN FETCH m.user WHERE m.server.id = :serverId")
    List<Membership> findByServerId(@Param("serverId") UUID serverId);

    /** Fetch server eagerly để dùng trong PresenceService.broadcastPresence. */
    @Query("SELECT m FROM Membership m JOIN FETCH m.server WHERE m.user.id = :userId")
    List<Membership> findByUserId(@Param("userId") UUID userId);
    Optional<Membership> findByUserIdAndServerId(UUID userId, UUID serverId);
    boolean existsByUserIdAndServerId(UUID userId, UUID serverId);
    void deleteByUserIdAndServerId(UUID userId, UUID serverId);
    long countByServerId(UUID serverId);
}

