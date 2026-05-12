package com.livebox.module.auth.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.auth.dto.ChangePasswordRequest;
import com.livebox.module.auth.dto.UserProfileResponse;
import com.livebox.module.auth.dto.UserProfileUpdateRequest;
import com.livebox.module.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;

    // LB-601: Lấy thông tin cá nhân
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.success(userService.getMyProfile());
    }

    // LB-601: Cập nhật thông tin cá nhân (bao gồm avatar)
    @PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserProfileResponse> updateProfile(@Valid @ModelAttribute UserProfileUpdateRequest request) {
        return ApiResponse.success(userService.updateProfile(request));
    }

    // Luồng đổi mật khẩu
    @PatchMapping("/me/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ApiResponse.success(null);
    }
}