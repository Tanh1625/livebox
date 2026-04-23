package com.livebox.module.server.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.server.dto.InviteResponse;
import com.livebox.module.server.dto.ServerCreateRequest;
import com.livebox.module.server.dto.ServerResponse;
import com.livebox.module.server.dto.ServerUpdateRequest;
import com.livebox.module.server.service.InviteService;
import com.livebox.module.server.service.ServerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/servers")
@RequiredArgsConstructor
public class ServerController {

    private final ServerService serverService;
    private final InviteService inviteService;

    // LB-201: Tạo server
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ServerResponse> createServer(@Valid @RequestBody ServerCreateRequest request) {
        return ApiResponse.created(serverService.createServer(request));
    }

    // Lấy danh sách server mà mình đang tham gia
    @GetMapping("/me")
    public ApiResponse<List<ServerResponse>> getMyServers() {
        return ApiResponse.success(serverService.getMyServers());
    }

    // Xem chi tiết server (Member only)
    @GetMapping("/{id}")
    public ApiResponse<ServerResponse> getServer(@PathVariable UUID id) {
        return ApiResponse.success(serverService.getServerById(id));
    }

    // Cập nhật server (Owner only)
    @PatchMapping("/{id}")
    public ApiResponse<ServerResponse> updateServer(
            @PathVariable UUID id,
            @Valid @RequestBody ServerUpdateRequest request) {
        return ApiResponse.success(serverService.updateServer(id, request));
    }

    // Xóa server (Owner only)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteServer(@PathVariable UUID id) {
        serverService.deleteServer(id);
    }

    // LB-202: Tạo invite link (Owner only)
    @PostMapping("/{serverId}/invites")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InviteResponse> generateInvite(@PathVariable UUID serverId) {
        return ApiResponse.created(inviteService.generateInvite(serverId));
    }

    // LB-203: Kick member (Owner only)
    @DeleteMapping("/{serverId}/members/{targetUserId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void kickMember(@PathVariable UUID serverId, @PathVariable UUID targetUserId) {
        serverService.kickMember(serverId, targetUserId);
    }

    // LB-203: Ban member (Owner only)
    @PostMapping("/{serverId}/bans/{targetUserId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void banMember(
            @PathVariable UUID serverId,
            @PathVariable UUID targetUserId,
            @RequestParam(required = false) String reason) {
        serverService.banMember(serverId, targetUserId, reason);
    }

    // LB-204: Tự rời server
    @DeleteMapping("/{serverId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveServer(@PathVariable UUID serverId) {
        serverService.leaveServer(serverId);
    }
}
