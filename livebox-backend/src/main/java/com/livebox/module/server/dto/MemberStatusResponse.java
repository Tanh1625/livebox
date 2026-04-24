package com.livebox.module.server.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/** SCRUM-59: Trạng thái online/offline của một thành viên trong server. */
@Getter
@Builder
public class MemberStatusResponse {
    private UUID userId;
    private String displayName;
    private String avatarUrl;
    private String role;
    private boolean online;
}
