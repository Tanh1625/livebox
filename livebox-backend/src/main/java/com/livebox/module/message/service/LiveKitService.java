package com.livebox.module.message.service;

import com.livebox.config.LiveKitProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service to generate LiveKit Access Tokens using existing JJWT library.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LiveKitService {

    private final LiveKitProperties liveKitProperties;

    /**
     * Creates a LiveKit JWT token.
     * @param userId The ID of the user.
     * @param displayName The user's display name.
     * @param channelId The channel ID (used as the LiveKit room name).
     * @return The JWT token string.
     */
    public String generateToken(UUID userId, String displayName, UUID channelId) {
        Map<String, Object> videoGrant = new HashMap<>();
        videoGrant.put("room", channelId.toString());
        videoGrant.put("roomJoin", true);
        videoGrant.put("canPublish", true);
        videoGrant.put("canSubscribe", true);

        // API Secret needs to be at least 32 bytes for HS256 to be secure.
        // In dev, if API secret is short, JJWT might throw WeakKeyException. 
        // We should pad it if necessary, but assume the secret is configured correctly.
        byte[] secretBytes = liveKitProperties.getApiSecret().getBytes(StandardCharsets.UTF_8);
        SecretKey key = Keys.hmacShaKeyFor(secretBytes);
        
        long nowMillis = System.currentTimeMillis();
        // Expiration: 4 hours
        Date expiration = new Date(nowMillis + (4 * 3600 * 1000));

        return Jwts.builder()
                .header().add("typ", "JWT").and()
                .issuer(liveKitProperties.getApiKey())
                .subject(userId.toString())
                .claim("name", displayName)
                .claim("video", videoGrant)
                .issuedAt(new Date(nowMillis))
                .notBefore(new Date(nowMillis))
                .expiration(expiration)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }
}
