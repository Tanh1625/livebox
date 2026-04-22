# LiveBox Frontend - Hướng Dẫn Cài Đặt và Cấu Hình

Chào mừng đến với dự án giao diện người dùng của **LiveBox**. Hệ thống được xây dựng với kiến trúc **Modular Monolith** kết hợp **Feature-Sliced Design** nhằm mang lại khả năng mở rộng tối đa và một giao diện cao cấp.

## 🛠️ Công Nghệ Lõi (Tech Stack)

- **Framework:** React 18, Vite
- **Ngôn ngữ:** TypeScript
- **Styling:** TailwindCSS v3 (áp dụng Utility-First UI)
- **State Management:** Zustand
- **Routing:** React Router v6+
- **HTTP Client:** Axios
- **Khác:** `clsx`, `tailwind-merge`

---

## 🚀 Hướng Dẫn Khởi Chạy Môi Trường

### 1. Yêu Cầu Hệ Thống (Prerequisites)
Bạn cần đảm bảo máy tính đã cài đặt sẵn các phần mềm sau:
- **Node.js**: Phiên bản `v18.0.0` trở lên. Khuyến nghị `v20.x` LTS.
- **Package Manager**: Dự án sử dụng `npm` (mặc định đi theo Node.js).

### 2. Cài Đặt và Khởi Tạo Dự Án (Setup & Install Dependencies)

**Trường hợp 1: Clone dự án có sẵn (Đã có source code)**
Nếu bạn được giao source code, chỉ cần đứng tại thư mục (`livebox-frontend`) và chạy lệnh sau để cài toàn bộ thư viện:
```bash
npm install
```

**Trường hợp 2: Khởi tạo dự án hoàn toàn mới từ đầu (Scratch)**
Nếu bạn muốn tự tay thiết lập một dự án đáp ứng đầy đủ Tech Stack của LiveBox, hãy chạy tuần tự các lệnh sau:

**Bước 2.1: Khởi tạo Vite + React + TypeScript**
```bash
npm create vite@latest livebox-frontend -- --template react-ts
cd livebox-frontend
```

**Bước 2.2: Cài đặt các thư viện cốt lõi (Production Dependencies)**
Bao gồm định tuyến, quản lý state, gọi API và xử lý CSS.
```bash
npm install react-router-dom zustand axios clsx tailwind-merge
```

**Bước 2.3: Cài đặt thư viện hỗ trợ UI và khởi tạo cấu hình TailwindCSS**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Khởi Chạy Môi Trường Phát Triển (Run Development Server)
Sau khi thiết lập xong thư viện, bạn có thể chạy server local:

```bash
npm run dev
```

Server của Vite thường sẽ khởi chạy siêu tốc và cung cấp một đường dẫn local (mặc định là `http://localhost:5173`). Bạn có thể bấm vào link hoặc truy cập qua trình duyệt.

### 4. Build Bản Thử Nghiệm / Production
Để tạo bản build tĩnh cho UI (tối ưu hóa performance, minify css + js):

```bash
npm run build
```

Biên dịch hoàn tất, thư mục `dist/` sẽ xuất hiện chứa các file front-end đã sẵn sàng được deploy lên Nginx, Vercel, hoặc kết hợp cùng Spring Boot backend nếu cần.

---

## 📂 Quy Tắc Cấu Trúc Bắt Buộc (Feature-Sliced Design)
Để giúp dự án luôn ngăn nắp và phản chiếu chuẩn các "Bounded Context" từ Backend, vui lòng lưu ý cấu trúc lõi bên trong tính năng:

- Thư mục `src/features/*`: Đây là "**Trái Tim**" của ứng dụng. Bắt buộc mọi Use Case, API Gọi Tới, Hooks chuyên biệt, Types/Interfaces chỉ liên quan đến nghiệp vụ đó phải được nhét đúng vào folder của nó (`auth`, `server`, `channel`, `message`).
- Thư mục `src/components/*`: **Tuyệt Đối Không** nhét logic Fetch API hoặc gọi State phức tạp vào đây. Ở đây chỉ chứa các component UI cơ bản có thể tái sử dụng dễ dàng ở nhiều trang (VD: `<Button />`, `<Avatar />`, `<Modal />`).
- **Tailwind Anti-Pattern:** Đừng bao giờ ghép tay text string cho các class có điều kiện (ví dụ: `className={"p-4 " + isTrue ? 'bg-red' : ''}`). Thay vào đó, hãy sử dụng hàm chuyên dụng đã được định nghĩa là `cn()` tại `src/utils/cn.ts`. 

*(Để xem chi tiết hơn về các chuẩn mực code cụ thể, vui lòng tham khảo file `frontend_coding_conventions.md` ở thư mục `AI_Context`.)*
