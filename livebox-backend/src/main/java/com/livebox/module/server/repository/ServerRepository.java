package com.livebox.module.server.repository;

import com.livebox.module.server.entity.Server;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServerRepository extends JpaRepository<Server, UUID> {
    List<Server> findByOwnerId(UUID ownerId);
}

