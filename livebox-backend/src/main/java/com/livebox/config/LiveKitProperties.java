package com.livebox.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "livekit")
public class LiveKitProperties {
    private String url;
    private String apiKey;
    private String apiSecret;
}
