package com.livebox.module.server.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ServerUpdateRequest {

    @Schema(example = "LiveBox Updated", description = "Tên mới của server")
    @Size(min = 1, max = 100, message = "Server name must be between 1 and 100 characters")
    private String name;

    @Schema(example = "https://avatar.iran.liara.run/public/2", description = "Ảnh đại diện mới")
    private String avatarUrl;
}
