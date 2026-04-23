package com.livebox.module.server.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.server.dto.ServerResponse;
import com.livebox.module.server.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * InviteController — LB-202: Join server via invite link.
 * Endpoint: POST /api/v1/invites/{code}/join
 */
@RestController
@RequestMapping("/api/v1/invites")
@RequiredArgsConstructor
public class InviteController {

    private final InviteService inviteService;

    // LB-202: User join server bằng invite code
    @PostMapping("/{code}/join")
    public ApiResponse<ServerResponse> joinServer(@PathVariable String code) {
        return ApiResponse.success(inviteService.joinByInvite(code));
    }
}
