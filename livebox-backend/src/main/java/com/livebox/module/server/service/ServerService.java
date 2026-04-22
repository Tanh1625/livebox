package com.livebox.module.server.service;

import com.livebox.common.exception.ResourceNotFoundException;
import com.livebox.common.util.SecurityUtils;
import com.livebox.module.server.dto.ServerCreateRequest;
import com.livebox.module.server.dto.ServerUpdateRequest;
import com.livebox.module.server.dto.ServerResponse;
import com.livebox.module.server.entity.Role;
import com.livebox.module.server.entity.Server;
import com.livebox.module.auth.repository.UserRepository;
import com.livebox.module.server.entity.Membership;
import com.livebox.module.server.repository.MembershipRepository;
import com.livebox.module.server.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServerService {

    private final ServerRepository serverRepository;
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public ServerResponse createServer(ServerCreateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Server server = Server.builder()
                .name(request.getName())
                .avatarUrl(request.getAvatarUrl())
                .ownerId(currentUserId)
                .build();
        server = serverRepository.save(server);

        Membership membership = new Membership();
        membership.setServer(server);
        membership.setUser(userRepository.getReferenceById(currentUserId));
        membership.setRole(Role.OWNER.name());
        membership.setStatus("ACTIVE");
        membership.setJoinedAt(Instant.now());
        membershipRepository.save(membership);

        return ServerResponse.fromEntity(server);
    }

    @Transactional(readOnly = true)
    public List<ServerResponse> getAllServers() {
        return serverRepository.findAll().stream()
                .map(ServerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServerResponse getServerById(UUID id) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + id));
        return ServerResponse.fromEntity(server);
    }

    @Transactional
    public ServerResponse updateServer(UUID id, ServerUpdateRequest request) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + id));

        if (request.getName() != null) {
            server.setName(request.getName());
        }
        if (request.getAvatarUrl() != null) {
            server.setAvatarUrl(request.getAvatarUrl());
        }

        server = serverRepository.save(server);
        return ServerResponse.fromEntity(server);
    }

    @Transactional
    public void deleteServer(UUID id) {
        if (!serverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Server not found with id: " + id);
        }
        // Basic deletion - cascading would typically handle channels and memberships
        serverRepository.deleteById(id);
    }
}
