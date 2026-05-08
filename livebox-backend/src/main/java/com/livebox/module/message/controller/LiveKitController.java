package com.livebox.module.message.controller;

import com.livebox.config.LiveKitProperties;

import com.livebox.module.message.dto.webrtc.LiveKitTokenResponse;
import com.livebox.module.message.service.LiveKitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/channels")
@RequiredArgsConstructor
@Tag(name = "Voice / LiveKit", description = "Endpoints for LiveKit Voice Chat integration")
public class LiveKitController {

    private final LiveKitService liveKitService;
    private final LiveKitProperties liveKitProperties;

    @Operation(summary = "Get LiveKit Token", description = "Generates a JWT token to join a LiveKit voice room.")
    @GetMapping("/{channelId}/voice/token")
    public ResponseEntity<LiveKitTokenResponse> getToken(
            @PathVariable UUID channelId,
            Authentication authentication) {
        
        // Extract user details from Spring Security Authentication
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        // In JwtAuthenticationFilter, we stored the userId (String) in the credentials field
        UUID userId = UUID.fromString((String) authentication.getCredentials());
        String displayName = userDetails.getUsername(); // use email as display name for now
        
        String token = liveKitService.generateToken(userId, displayName, channelId);
        
        return ResponseEntity.ok(LiveKitTokenResponse.builder()
                .token(token)
                .url(liveKitProperties.getUrl())
                .build());
    }
}
