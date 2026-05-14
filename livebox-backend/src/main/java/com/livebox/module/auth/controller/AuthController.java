package com.livebox.module.auth.controller;

import com.livebox.common.dto.ApiResponse;
import com.livebox.module.auth.dto.LoginRequest;
import com.livebox.module.auth.dto.TokenResponse;
import com.livebox.module.auth.dto.RegisterRequest;
import com.livebox.module.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
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

    @Value("${livebox.jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    @Value("${livebox.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${livebox.cookie.same-site:Lax}")
    private String cookieSameSite;

    // LB-101: Đăng ký tài khoản mới
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenResponse>> register(@Valid @RequestBody RegisterRequest request) {
        TokenResponse response = authService.register(request);
        ResponseCookie cookie = createRefreshTokenCookie(response.getRefreshToken(), refreshExpirationMs / 1000);
        response.setRefreshToken(null); // Do not expose in body
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.created(response));
    }

    // LB-102: Đăng nhập, nhận Access Token + Refresh Token (via Cookie)
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        ResponseCookie cookie = createRefreshTokenCookie(response.getRefreshToken(), refreshExpirationMs / 1000);
        response.setRefreshToken(null); // Do not expose in body
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(response));
    }

    // LB-102: Làm mới Access Token bằng Refresh Token từ Cookie
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Missing refresh token cookie"));
        }
        TokenResponse response = authService.refreshToken(refreshToken);
        ResponseCookie cookie = createRefreshTokenCookie(response.getRefreshToken(), refreshExpirationMs / 1000);
        response.setRefreshToken(null);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(response));
    }

    // LB-103: Đăng xuất an toàn – Revoke Refresh Token trong DB và Clear Cookie
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }
        ResponseCookie cookie = createRefreshTokenCookie("", 0); // Clear cookie
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken, long maxAgeSecs) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/v1/auth")
                .maxAge(maxAgeSecs)
                .sameSite(cookieSameSite)
                .build();
    }
}
