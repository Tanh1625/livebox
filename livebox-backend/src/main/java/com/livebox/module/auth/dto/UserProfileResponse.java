package com.livebox.module.auth.dto;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;
@Data
@Builder
public class UserProfileResponse {
    private UUID id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String bio;
}
