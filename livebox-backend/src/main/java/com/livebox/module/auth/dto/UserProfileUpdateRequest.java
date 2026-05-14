package com.livebox.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UserProfileUpdateRequest {
    @Schema(example = "John Doe", description = "Tên hiển thị mới")
    @Size(min = 1, max = 50, message = "Display name must be between 1 and 50 characters")
    private String displayName;

    @Schema(description = "Ảnh đại diện mới")
    private MultipartFile avatar;

    @Schema(example = "I am a developer", description = "Tiểu sử mới")
    @Size(max = 255, message = "Bio must be at most 255 characters")
    private String bio;
}