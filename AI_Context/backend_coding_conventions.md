# LiveBox Coding Conventions (Backend - Spring Boot)

Tài liệu này định nghĩa các tiêu chuẩn lập trình dành riêng cho tầng Backend (Spring Boot) của dự án LiveBox, tuân thủ nguyên tắc Clean Architecture và Separation of Concerns.

## 1. Package Structure (Cấu trúc Thư mục)
Dự án áp dụng kiến trúc **Modular Monolith** kết hợp mô hình **MVC (Model-View-Controller)** trong mỗi module, tuân thủ đúng định hướng kỹ thuật tại `ADR-001`.

```text
livebox-backend/
├── src/main/java/com/livebox/
│   ├── config/          # Configurations: WebSocket, Security, JWT, WebRTC
│   ├── common/          # Shared kernel: DTOs, Exceptions, Enums, Utils
│   ├── module/          # Bounded Contexts (Các module nghiệp vụ độc lập)
│   │   ├── auth/        # Auth Module: login, register, token refresh
│   │   ├── server/      # Management: create server, members, kick/ban
│   │   ├── channel/     # Create/delete text and voice channels
│   │   └── message/     # WebSocket chat streams, unread badges, signaling
│   │       ├── controller/ # MVC: Tiếp nhận HTTP/STOMP request, trả Data
│   │       ├── service/    # MVC: Xử lý Business Logic
│   │       ├── repository/ # MVC: Tương tác Database
│   │       └── entity/     # MVC (Model): Các Database Entities
│   └── LiveBoxApplication.java
```
*Quy tắc bắt buộc:* Tuân thủ Modular Monolith (Package by Module). Các thành phần dùng chung (như DTOs, Exceptions) bắt buộc dời vào phân vùng `common/` (Shared Kernel) để giao tiếp, trong khi logic lõi MVC được phân tách rõ ràng bên trong từng thư mục thuộc `module/`.

## 2. Naming Conventions (Quy tắc Đặt tên)
- **Classes / Interfaces:** `PascalCase`. (VD: `ServerController`, `AuthService`, `UserRepository`).
- **Methods / Variables:** `camelCase`. (VD: `getUserById`, `accessToken`, `channelName`).
- **Constants:** `UPPER_SNAKE_CASE`. (VD: `MAX_VOICE_MEMBERS = 20`, `DEFAULT_PAGE_SIZE = 10`).
- **Entity:** Danh từ số ít, trùng tên với bảng trong Database, không có hậu tố Entity. (VD: `Server`, `Channel`).
- **DTO (Data Transfer Object):** Phải có hậu tố chỉ rõ luồng dữ liệu hoặc mục đích. (VD: `ServerCreateRequest`, `UserProfileResponse`).

**Quy chuẩn RESTful API Endpoints:**
- Dùng danh từ số nhiều, chữ thường (lowercase), phân cách bằng dấu gạch ngang (kebab-case).
- Các thao tác (CRUD) được xác định bằng HTTP Method (GET, POST, PUT, DELETE), không đưa động từ (create, update) vào URL.
- **Đúng:** `POST /api/v1/servers`, `GET /api/v1/servers/{id}/channels`
- **Sai / Anti-pattern:** `POST /api/v1/createServer`, `GET /api/v1/ServerList`

## 3. Layer Dependency Rules (Luồng Phụ thuộc Layer)
Áp dụng **Clean Architecture** nghiêm ngặt. Hướng phụ thuộc chỉ di chuyển theo một chiều duy nhất, từ ngoài vào trong:
**Controller ➔ Service ➔ Repository**

- **Controller Layer:** Chỉ tiếp nhận HTTP Request (DTO in), thực hiện Validation và format HTTP Response (DTO out). **Tuyệt đối KHÔNG** chứa logic nghiệp vụ và KHÔNG gọi Repository.
- **Service Layer:** Chứa toàn bộ "Core Business Logic". Là nơi thực hiện Validate nghiệp vụ, thao tác với Entity và điều phối Repository.
- **Repository Layer:** Chỉ chịu trách nhiệm giao dịch trực tiếp với Database Entities (PostgreSQL).
- **Quy tắc Circular Dependency:** Cấm thiết kế các Service gọi chéo nhau tạo thành vòng lặp vô tận (Ex: `AuthService` gọi `UserService`, rồi `UserService` lại gọi `AuthService`). Khi xảy ra vòng lặp, cần tách Shared Logic đó ra một Service trung gian thứ 3.

## 4. Framework-Specific Patterns (Spring Boot)
- **Dependency Injection (DI):** 
  - **Cấm:** Sử dụng `@Autowired` trên các properties/fields. (Anti-pattern khét tiếng của Spring gây khó test unit).
  - **Bắt buộc:** Dùng **Constructor Injection** thông qua annotation `@RequiredArgsConstructor` của thư viện Lombok kết hợp với biến `private final`.
- **Lombok Anti-Patterns:**
  - **Cấm:** Dùng `@Data` cho các class Entity (được mark `@Entity`). Vì `@Data` tự sinh các hàm `toString()`, `hashCode()`, `equals()` bao gồm mọi field. Khi các Entity có quan hệ lồng nhau (VD OneToMany/ManyToOne), việc này sẽ gây lỗi `StackOverflowError` đệ quy vô hạn khi load dữ liệu.
  - **Khuyến nghị:** Dùng `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder` thay thế.
- **Transaction Management:** Mọi method thay đổi dữ liệu (Insert, Update, Delete) tại tầng Service đều phải gắn `@Transactional`. Những thao tác chỉ đọc cần tối ưu bằng `@Transactional(readOnly = true)`.

## 5. Code Organization Rules
- **Tách biệt DTO và Entity:** Tuyệt đối KHÔNG sử dụng Entity Domain làm dữ liệu trả ra cho API Endpoint. Yêu cầu bắt buộc map đổi từ `Entity ➔ DTO` trước khi Controller trả về. (Có thể dùng thư viện MapStruct để tạo Mapper tự động hoặc mapping bằng method tĩnh).
- **Validation:** Bắt buộc validate Input DTO tại rìa hệ thống (Tầng Controller). Sử dụng gói `spring-boot-starter-validation`, đánh dấu Input bằng `@NotBlank`, `@Size`, `@Email`... Kết hợp `@Valid` ở tham số truyền vào hàm Controller.
- **Exception Handling:** Sử dụng quy trình gom lỗi tập trung (`@RestControllerAdvice`). Tất cả Exception khi bắn ra (throw CustomException) đều phải được format lại theo định dạng JSON chuẩn (gồm `timestamp`, `status`, `error`, `path`).

---

## 6. Đánh Giá Codebase Hiện Tại & Đề Xuất Cải Tiến Cụ Thể

**Tình trạng hiện tại:** 
Sau khi scan và rà soát toàn bộ thư mục gốc của kiến trúc dự án LiveBox hiện tại, hệ thống mới chỉ dừng lại ở **giai đoạn hoạch định tài liệu kỹ thuật (Phase 0 - Design)**. Chưa xuất hiện cấu trúc code Spring Boot, ReactJS hay bất cứ file chứa mã nguồn thực thi nào (không phát hiện file `.java` tại thời điểm rà soát). 

**Đánh giá:** Vì source code chưa được bắt đầu, dự án không tồn tại bất cứ vi phạm ngầm (Anti-patterns), sự không đồng nhất Naming nào. Đây là yếu tố rất lý tưởng.

**Đề xuất Action (Ngay trong Sprint 0 / Setup Phase):**
1. **Thiết lập Boilerplate:** Yêu cầu Backend Team khởi tạo dự án Spring Boot lập tức thiết lập sẵn sơ đồ cây folder như Mục 1 quy định (tách package theo Feature thay vì theo Layer).
2. **Template Exception & Response:** Code sẵn 2 file dùng chung ngay từ ngày đầu: `GlobalExceptionHandler.java` (để bắt lỗi) và `ApiResponse.java` (định dạng Wrapper bọc lại mọi response của API).
3. **Cấu hình SonarLint / Checkstyle:** Khuyên dùng các rules engine tĩnh trên IDE của các Members để báo lỗi đỏ ngay khi ai đó gõ sai định dạng kebab-case trên URI hoặc xài `@Autowired` thay vì `@RequiredArgsConstructor` như đã thống nhất ở trên.
