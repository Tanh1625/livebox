package com.livebox.module.auth.service;

import com.livebox.common.dto.ApiResponse;
import com.livebox.config.JwtProvider;
import com.livebox.module.auth.dto.LoginRequest;
import com.livebox.module.auth.dto.RefreshTokenRequest;
import com.livebox.module.auth.dto.RegisterRequest;
import com.livebox.module.auth.dto.TokenResponse;
import com.livebox.module.auth.entity.RefreshToken;
import com.livebox.module.auth.entity.User;
import com.livebox.module.auth.repository.RefreshTokenRepository;
import com.livebox.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;

    @Value("${livebox.jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getUsername())
                .build();

        userRepository.save(user);

        return generateTokenResponse(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        // Authenticate via Spring Security (checks password)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return generateTokenResponse(user);
    }

    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        
        // 1. Find token in DB
        RefreshToken refreshToken = refreshTokenRepository.findByTokenValue(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
                
        // 2. Check if expired
        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        
        // 3. Generate new tokens
        User user = refreshToken.getUser();
        
        // Optionally, we could reuse the refresh token or rotate it.
        // For higher security, rotate the refresh token:
        refreshTokenRepository.delete(refreshToken);
        
        return generateTokenResponse(user);
    }

    private TokenResponse generateTokenResponse(User user) {
        String accessToken = jwtProvider.generateAccessToken(user.getEmail(), user.getId().toString());
        String refreshTokenString = jwtProvider.generateRefreshToken(user.getEmail(), user.getId().toString());

        // Save refresh token to DB
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenValue(refreshTokenString)
                .expiresAt(Instant.now().plus(refreshExpirationMs, ChronoUnit.MILLIS))
                .build();
                
        refreshTokenRepository.save(refreshTokenEntity);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .tokenType("Bearer")
                .user(TokenResponse.UserDto.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .username(user.getDisplayName())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .build();
    }
}
