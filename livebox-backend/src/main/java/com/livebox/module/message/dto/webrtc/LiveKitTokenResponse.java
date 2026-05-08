package com.livebox.module.message.dto.webrtc;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LiveKitTokenResponse {
    private String token;
    private String url;
}
