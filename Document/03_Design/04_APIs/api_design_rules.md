# API Design Rules

Trong vai trò Senior Developer/Detail Design, tài liệu này quy chuẩn các nguyên tắc thiết kế API (API Design Rules) bắt buộc áp dụng trong toàn hệ thống. Mọi API phải tuân thủ nghiêm ngặt để đảm bảo tính đồng nhất, bảo mật và dễ dàng bảo trì.

<api_design_guidelines>

<global_route_prefix>
### 1. Global Route Prefix
- **Prefix áp dụng:** `/api/v1`
- Tất cả các API routes đều phải được định tuyến bắt đầu bằng prefix này (ví dụ: `/api/v1/resources`).
</global_route_prefix>

<path_url_convention>
### 2. Path URL Naming Convention
- **Quy tắc:** Sử dụng `kebab-case`
- Các phần tử trong URL phải ở định dạng chữ viết thường (lowercase) và được phân tách bằng dấu gạch ngang (`-`).
- Tránh sử dụng camelCase, PascalCase hay snake_case trên URL.
- **Ví dụ hợp lệ:** `/api/v1/user-profiles`
- **Ví dụ không hợp lệ:** `/api/v1/userProfiles`, `/api/v1/User_Profiles`
</path_url_convention>

<response_format>
### 3. Response Format
- Mọi phản hồi (response) từ API phải được bọc trong một đối tượng chuẩn hóa duy nhất.
- **Cấu trúc JSON bắt buộc:**
```json
{
  "code": 200,      // Interger: Mã lỗi hệ thống hoặc HTTP status code
  "message": "",    // String: Thông báo kết quả (Success/Error Message)
  "data": {}        // Object/Array: Dữ liệu (payload) thực tế của response, có thể là null
}
```
</response_format>

<security_requirements>
### 4. Authentication cho Mutable Endpoints
- **Quy định bắt buộc:** Tất cả các endpoint có khả năng thay đổi trạng thái dữ liệu (Mutable endpoints bao gồm `POST`, `PUT`, `PATCH`, `DELETE`) đều phải áp dụng **JWT Bearer Authentication**.
</security_requirements>

<openapi_example>
### 5. OpenAPI/Swagger Configuration Example
Dưới đây là một ví dụ mẫu (template) trong Swagger mô tả endpoint xử lý đăng nhập, minh họa cho các quy tắc thiết kế trên:

```yaml
  /api/v1/auth/login:
    post:
      summary: "User Login"
      security:
        - bearerAuth: [] # AI will learn to append this to all locked routes
      responses:
        '200':
          content:
            application/json:
              schema:
                properties:
                  code: { type: integer, example: 200 }
                  message: { type: string }
                  data:
                    $ref: '#/components/schemas/AuthToken'
```
</openapi_example>

</api_design_guidelines>
