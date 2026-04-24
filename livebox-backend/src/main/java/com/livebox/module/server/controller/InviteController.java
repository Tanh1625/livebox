package com.livebox.module.server.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.server.dto.InvitePreviewResponse;
import com.livebox.module.server.dto.ServerResponse;
import com.livebox.module.server.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * InviteController — LB-202: Invite link flow.
 *
 * <p>2-step flow:
 * <ol>
 *   <li>GET  /api/v1/invites/{code}       → xem preview server (không bắt buộc auth)</li>
 *   <li>POST /api/v1/invites/{code}/join  → thực sự join (bắt buộc auth)</li>
 * </ol>
 */
@RestController
@RequestMapping("/api/v1/invites")
@RequiredArgsConstructor
public class InviteController {

    private final InviteService inviteService;

    /**
     * Bước 1: Xem preview thông tin server trước khi tham gia.
     * Không yêu cầu auth → cho phép user chưa đăng nhập xem và được redirect tới login.
     * Nếu đã đăng nhập → trả về thêm alreadyMember flag để FE ẩn nút "Tham gia".
     */
    @GetMapping("/{code}")
    public ApiResponse<InvitePreviewResponse> previewInvite(@PathVariable String code) {
        return ApiResponse.success(inviteService.previewInvite(code));
    }

    /**
     * Bước 2: User ấn "Tham gia" → join server.
     * Bắt buộc phải đã đăng nhập (JWT token hợp lệ).
     */
    @PostMapping("/{code}/join")
    public ApiResponse<ServerResponse> joinServer(@PathVariable String code) {
        return ApiResponse.success(inviteService.joinByInvite(code));
    }
}

