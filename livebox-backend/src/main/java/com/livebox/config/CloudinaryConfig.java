package com.livebox.config;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@RequiredArgsConstructor
public class CloudinaryConfig {

    private final CloudinaryProperties cloudinaryProperties;

    @Bean
    public Cloudinary cloudinary() {
        if (!StringUtils.hasText(cloudinaryProperties.getUrl())) {
            return new Cloudinary();
        }
        return new Cloudinary(cloudinaryProperties.getUrl());
    }
}
