package com.livebox.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @Schema(example = "Secret123!", description = "Mật khẩu hiện tại")
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @Schema(example = "NewSecret456!", description = "Mật khẩu mới")
    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 50, message = "New password must be between 6 and 50 characters")
    private String newPassword;
}