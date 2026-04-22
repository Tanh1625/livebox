# LiveBox Coding Conventions (Frontend - React & TypeScript)

Tài liệu này định nghĩa các tiêu chuẩn lập trình dành riêng cho UI/Frontend (React + Vite + TailwindCSS) của dự án LiveBox, đảm bảo tính đồng bộ với kiến trúc Modular Monolith của Backend được quy định tại `ADR-001`.

## 1. Package Structure (Cấu trúc Thư mục)
Áp dụng mô hình **Feature-Sliced Design / Feature-based** để Frontend mirror (phản chiếu) chính xác các Bounded Contexts của Backend (auth, server, channel, message).

```text
livebox-frontend/
├── src/
│   ├── assets/          # Static files (images, icons, fonts)
│   ├── components/      # Shared UI Components (Button, Modal, Input - cấm chứa logic API)
│   ├── config/          # Configurations (Axios instances, STOMP setup, routes map)
│   ├── hooks/           # Global Custom Hooks (useAuth, useLocalStorage)
│   ├── store/           # Global State (Zustand root config, shared slices)
│   ├── utils/           # Shared pure functions (date formatting, valiation helpers)
│   ├── features/        # Các Bounded Contexts (Module nghiệp vụ lõi)
│   │   ├── auth/        # Login/Register forms, auth api, auth store
│   │   ├── server/      # Server list, creation logic, member management
│   │   ├── channel/     # Text/Voice channel management logic
│   │   └── message/     # WebSocket chat logic, WebRTC voice handling
│   │       ├── api/         # Các API calls liên quan đến message
│   │       ├── components/  # Component giới hạn trong feature này (ChatBox)
│   │       ├── hooks/       # Custom hooks (VD: useWebSocket, useReadReceipt)
│   │       └── store/       # Zustand slice cho tính năng message
│   ├── pages/           # Nơi ghép nối các Features/Components thành 1 View (Routing)
│   ├── App.tsx
│   └── main.tsx
```
*Quy tắc bắt buộc:* Mọi tính năng nghiệp vụ cụ thể phải nằm trong thư mục `features/`. Thư mục `components/` chỉ chứa các UI Kit "ngu" (Dumb Components) có thể tái sử dụng ở bất kỳ đâu.

## 2. Naming Conventions (Quy tắc Đặt tên)
- **React Components (*.tsx):** `PascalCase`. (VD: `ServerSidebar.tsx`, `ChatInterface.tsx`).
- **Custom Hooks (*.ts):** `camelCase` với tiền tố `use`. (VD: `useWebSocket.ts`, `useServerData.ts`).
- **Types / Interfaces:** `PascalCase`. Không bắt buộc tiền tố `I`. Phải khớp với các định dạng DTO từ Backend. (VD: `type UserProfile = {...}`).6
- **Files thông thường (utils, API, store):** `camelCase`. (VD: `dateUtils.ts`, `authApi.ts`, `serverStore.ts`).
- **CSS Classes:** Ưu tiên dùng utility-classes của TailwindCSS. Nếu cần custom class, dùng dạng `kebab-case`.

## 3. Quản lý State & Dependency (Zustand & Context)
- **Global / Shared State:** Sử dụng thư viện **Zustand** được chốt ở ADR. 
  - KHÔNG sử dụng Redux (quá nhiều boilerplate).
  - Khuyến khích chẻ nhỏ Zustand Store theo Feature thay vì nhét chung 1 store khổng lồ (VD: `useAuthStore`, `useMessageStore`, `useServerStore`).
- **Server State (API Data):** Tách biệt logic lấy dữ liệu (Fetch/Axios) ra khỏi UI. Không gọi thẳng `axios.get()` bên trong `useEffect` của Component UI. Hãy gói chúng vào các Custom Hooks phục vụ việc fetch và cache data, hoặc lưu vào Zustand nếu dữ liệu trải rộng.
- **WebSocket & STOMP State:** Giữ connection object STOMP ở Global Context hoặc Store, không khởi tạo trực tiếp trong Component tránh việc re-render liên tục gây đứt kết nối.

## 4. Framework-Specific Patterns (React)
- **Functional Components:** Bắt buộc sử dụng 100% React Hooks & Functional Components. Cấm hoàn toàn Class Components truyền thống.
- **TypeScript Strict Mode:** 
  - Tuyệt đối cấm sử dụng type `any`. Hãy dùng `unknown` nếu chưa biết rõ cấu trúc, hoặc tự define `interface/type`.
  - Props của Component phải được định nghĩa tường minh.
- **Tailwind Anti-Pattern:** Không nối chuỗi className thủ công dễ sinh lỗi (`className={"p-4 " + isActive ? "bg-blue" : "bg-red"}`). Cần cấu hình và xài thư viện `clsx` hoặc `tailwind-merge` để bind class động.

## 5. Code Organization Rules (Tách biệt Concerns)
- **Presentation vs Container:** Tuân thủ phân tách giữa Component rỗng chỉ nhận `props` (Dumb/Presentational Component) và Component chứa logic/gọi Hooks (Smart/Container Component).
- **WebRTC & STOMP Handling:** Logic mở STOMP Connection, báo `speaking_indicator` qua WebRTC là các Side-effects cực phức tạp. Bắt buộc cô lập thành các custom hooks riêng biệt (`useVoiceSignaling.ts`, `useStompMessaging.ts`).
- **Exception & Error Boundaries:** Sử dụng React Error Boundary để Catch UI crash, không để màn hình trắng khi 1 Component lỗi dữ liệu. Với API, cấu hình Axios Interceptors để túm chung các response trả về mã lỗi 401 (RefreshToken hết hạn) hoặc 403 (Kích/Ban) để đá văng User ra Login.
