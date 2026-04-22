package com.livebox.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("LiveBox API")
                        .version("1.0.0")
                        .description("LiveBox Real-time Chat Platform API documentation. \n\n" +
                                "### Hướng dẫn Authentication:\n" +
                                "1. Gọi endpoint `/api/v1/auth/login` để lấy `accessToken`.\n" +
                                "2. Click nút **Authorize** ở phía trên bên phải.\n" +
                                "3. Dán token vào ô value (Hệ thống sẽ tự lưu token này nhờ cấu hình `persistAuthorization`)."))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Nhập JWT Token của bạn để truy cập các API yêu cầu đăng nhập.")));
    }
}
