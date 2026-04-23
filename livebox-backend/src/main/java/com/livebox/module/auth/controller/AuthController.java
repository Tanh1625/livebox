package com.livebox.module.auth.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.auth.dto.LoginRequest;
import com.livebox.module.auth.dto.LogoutRequest;
import com.livebox.module.auth.dto.RefreshTokenRequest;
import com.livebox.module.auth.dto.RegisterRequest;
import com.livebox.module.auth.dto.TokenResponse;
import com.livebox.module.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // LB-101: Đăng ký tài khoản mới
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        TokenResponse response = authService.register(request);
        return ApiResponse.created(response);
    }

    // LB-102: Đăng nhập, nhận Access Token + Refresh Token
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return ApiResponse.success(response);
    }

    // LB-102: Làm mới Access Token bằng Refresh Token hợp lệ
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refreshToken(request);
        return ApiResponse.success(response);
    }

    // LB-103: Đăng xuất an toàn – Revoke Refresh Token trong DB
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
    }
}
