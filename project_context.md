<?xml version="1.0" encoding="UTF-8"?>
<!--
  ╔══════════════════════════════════════════════════════════════════╗
  ║              LiveBox – project_context.md                       ║
  ║  Version : v0.1  |  Date : 2026-04-16  |  Author : BA Lead     ║
  ║  Purpose : Single Source of Truth cho AI assistant và toàn bộ  ║
  ║            thành viên nhóm. Mọi output phải tuân thủ file này. ║
  ╚══════════════════════════════════════════════════════════════════╝

  ⚠️  MANDATORY RULE FOR AI ASSISTANT:
  Trước khi trả lời BẤT KỲ yêu cầu nào, bắt buộc phải:
    1. Đọc lại thẻ <glossary> – dùng đúng thuật ngữ đã định nghĩa.
    2. Đọc lại thẻ <output_rules> – tuân thủ format và ngôn ngữ.
    3. Không tự sáng tạo tính năng hoặc thuật ngữ nằm ngoài <vision_and_scope>.
-->

<!-- ================================================================
     PILLAR 1 – PERSONAS
     Mô tả chi tiết 3 nhóm người dùng mục tiêu của LiveBox.
     Dùng làm "North Star" khi đưa ra quyết định UX / Backlog.
================================================================ -->
<personas>

  <persona id="P01" role="Server Owner" priority="Primary">
    <name>Anh Đạt – "Người Kiến Tạo"</name>
    <quote>Tôi muốn một nơi để cả team vừa chat công việc, vừa hop call nhanh mà không cần cài thêm 3 app khác nhau.</quote>
    <demographics>
      <age>28</age>
      <occupation>Team Lead / Fullstack Developer tại startup</occupation>
      <device>Desktop (chính), Laptop khi WFH</device>
      <frequency>Hàng ngày, 4–8 giờ online</frequency>
      <scale>Quản lý 2–3 server, mỗi server 5–20 thành viên</scale>
      <tech_savvy>90%</tech_savvy>
    </demographics>
    <pain_points>
      <pain>Quản lý thành viên rải rác, khó phân quyền kênh</pain>
      <pain>Phải mở nhiều app: Zalo chat + Google Meet + Notion trong cùng 1 buổi làm việc</pain>
      <pain>Mất lịch sử chat và file khi thành viên rời nhóm</pain>
      <pain>Không có cách kick/ban nhanh thành viên vi phạm quy tắc</pain>
    </pain_points>
    <goals>
      <goal story="LB-201">Tạo server và phân kênh text/voice theo chủ đề</goal>
      <goal story="LB-202 LB-203">Mời thành viên qua invite link; kick/ban thành viên vi phạm</goal>
      <goal story="LB-302">Tạo, đổi tên, xóa kênh – cập nhật realtime</goal>
      <goal story="LB-401">Voice call ngay trong server, không cần app ngoài</goal>
    </goals>
    <linked_business_goals>BG-03 BG-05</linked_business_goals>
  </persona>

  <persona id="P02" role="Active Member" priority="Core">
    <name>Minh Khoa – "Người Kết Nối"</name>
    <quote>Chat thì phải nhanh, voice phải ổn định – tôi ghét nhất là đang nói giữa chừng mà bị lag hoặc bị đứt kết nối.</quote>
    <demographics>
      <age>22</age>
      <occupation>Sinh viên CNTT năm cuối / Junior Developer</occupation>
      <device>Laptop (chính), điện thoại khi di chuyển</device>
      <frequency>Hàng ngày, 6–10 giờ online</frequency>
      <scale>Tham gia 3–5 server cùng lúc</scale>
      <tech_savvy>75%</tech_savvy>
    </demographics>
    <pain_points>
      <pain>Đang ở kênh A không biết kênh B có tin mới vì không có badge unread</pain>
      <pain>Voice call bị delay, tiếng vọng khi nhiều người nói cùng lúc</pain>
      <pain>Khó tìm lại file/link đã chia sẻ trong kênh dài</pain>
      <pain>Không thể tự rời server không còn muốn tham gia</pain>
    </pain_points>
    <goals>
      <goal story="LB-301">Tin nhắn hiển thị tức thì, không reload (WebSocket)</goal>
      <goal story="LB-501">Badge số tin nhắn chưa đọc theo kênh, tự xóa khi vào</goal>
      <goal story="LB-401">Tham gia voice 1-click, thấy speaking indicator</goal>
      <goal story="LB-601">Cập nhật avatar và display name cá nhân</goal>
      <goal story="LB-204">Tự rời server không muốn tham gia</goal>
    </goals>
    <linked_business_goals>BG-02 BG-04</linked_business_goals>
  </persona>

  <persona id="P03" role="New User" priority="Casual">
    <name>Lan Anh – "Người Mới Đến"</name>
    <quote>Tôi chỉ muốn vào xem thử cộng đồng – đừng bắt tôi đăng ký cả chục bước mới vào được.</quote>
    <demographics>
      <age>20</age>
      <occupation>Sinh viên năm 2 / Nhân viên mới đi làm</occupation>
      <device>Điện thoại (chính), laptop khi học/làm</device>
      <frequency>1–2 lần/tuần, khi được mời</frequency>
      <experience>Chưa dùng Discord/Slack, quen Zalo/Messenger</experience>
      <tech_savvy>40%</tech_savvy>
    </demographics>
    <pain_points>
      <pain>Màn hình quá nhiều panel, không biết phải click đâu để bắt đầu</pain>
      <pain>Đăng ký yêu cầu quá nhiều thông tin – dễ nản và bỏ cuộc</pain>
      <pain>Sau khi vào server không biết kênh nào active, ai đang online</pain>
    </pain_points>
    <goals>
      <goal story="LB-101">Đăng ký chỉ cần email + password, hoàn thành trong ≤ 30 giây</goal>
      <goal story="LB-202">Click invite link → tự động join server + redirect kênh #general</goal>
      <goal story="LB-303">Danh sách kênh và thành viên online rõ ràng ngay khi vào server</goal>
    </goals>
    <linked_business_goals>BG-01</linked_business_goals>
  </persona>

</personas>


<!-- ================================================================
     PILLAR 2 – VISION & SCOPE
     Định nghĩa mục tiêu kinh doanh, phạm vi Phase 1,
     ràng buộc kỹ thuật và tech stack.
================================================================ -->
<vision_and_scope>

  <vision>
    LiveBox là nền tảng chat thời gian thực đơn giản hóa giao tiếp nhóm – thay thế ít nhất 2 công cụ
    rời rạc (chat text + voice call) bằng một interface duy nhất. Dự án nhắm đến nhóm nhỏ người Việt
    (5–50 thành viên/server) với triết lý: "đơn giản đến mức không cần hướng dẫn, nhanh đến mức
    không cần chờ đợi."
  </vision>

  <business_goals>
    <goal id="BG-01" kpi="Đăng ký + vào server trong ≤ 30 giây" priority="Must Have" stories="LB-101 LB-202">
      Onboarding không rào cản – người dùng mới hoàn thành luồng đăng ký và join server trong ≤ 30 giây.
    </goal>
    <goal id="BG-02" kpi="Độ trễ tin nhắn ≤ 500ms" priority="Must Have" stories="LB-301">
      Messaging realtime – tin nhắn được broadcast tới tất cả thành viên online trong ≤ 500ms via WebSocket.
    </goal>
    <goal id="BG-03" kpi="Thay thế ≥ 2 công cụ hiện tại" priority="Must Have" stories="LB-201 LB-302 LB-303 LB-401 LB-601">
      Tập trung hóa công cụ – nhóm có thể chat text, voice call, xem member list trong duy nhất LiveBox.
    </goal>
    <goal id="BG-04" kpi="100% tin nhắn deliver realtime + badge unread chính xác" priority="Should Have" stories="LB-501 LB-303">
      Không bỏ lỡ tin nhắn – badge unread cập nhật realtime theo kênh, tự xóa khi người dùng vào kênh.
    </goal>
    <goal id="BG-05" kpi="Zero unauthorized access" priority="Must Have" stories="LB-102 LB-103 LB-202 LB-203">
      Bảo mật truy cập – JWT stateless, Refresh Token revocable, invite link có TTL, kick/ban thành viên.
    </goal>
  </business_goals>

  <in_scope phase="1">
    <!-- Epic 1: Authentication -->
    <feature story="LB-101">Đăng ký tài khoản (email + password, 1 màn hình)</feature>
    <feature story="LB-102">Đăng nhập + JWT Access Token (1h) / Refresh Token (7 ngày)</feature>
    <feature story="LB-103">Đăng xuất an toàn – revoke Refresh Token, đóng WebSocket</feature>
    <!-- Epic 2: Server Management -->
    <feature story="LB-201">Tạo server với tên và ảnh đại diện</feature>
    <feature story="LB-202">Invite link có TTL 7 ngày → auto join server</feature>
    <feature story="LB-203">Kick / Ban thành viên (Owner only)</feature>
    <feature story="LB-204">Rời server (Member tự rời; Owner phải chuyển quyền trước)</feature>
    <!-- Epic 3: Channel & Messaging -->
    <feature story="LB-301">Gửi/nhận tin nhắn realtime via WebSocket/STOMP</feature>
    <feature story="LB-302">Tạo, đổi tên, xóa kênh text (Owner only)</feature>
    <feature story="LB-303">Danh sách thành viên online/offline (auto-update realtime)</feature>
    <!-- Epic 4: Voice -->
    <feature story="LB-401">Voice channel 1-click via WebRTC, tối đa 20 người/phòng, speaking indicator</feature>
    <!-- Epic 5: Notification -->
    <feature story="LB-501">Badge unread tin nhắn theo kênh – tự xóa khi vào kênh</feature>
    <!-- Epic 6: Profile -->
    <feature story="LB-601">Cập nhật display name và avatar (PNG/JPG ≤ 2MB)</feature>
  </in_scope>

  <out_of_scope phase="1">
    <excluded>Ứng dụng mobile native (iOS / Android)</excluded>
    <excluded>Chia sẻ file / hình ảnh trong kênh chat</excluded>
    <excluded>Emoji reaction và thread / reply tin nhắn</excluded>
    <excluded>Hệ thống moderation tự động (AI spam filter)</excluded>
    <excluded>Persistent voice recording / screen sharing</excluded>
    <excluded>Redis cache layer (Phase 1 dùng PostgreSQL trực tiếp)</excluded>
    <excluded>Direct Message (DM) giữa 2 người dùng</excluded>
  </out_of_scope>

  <constraints>
    <constraint id="C01">Concurrent users tối đa Phase 1: 500 users trên 1 instance Spring Boot</constraint>
    <constraint id="C02">Voice room tối đa: 20 người/phòng (WebRTC P2P / SFU free-tier)</constraint>
    <constraint id="C03">Database: PostgreSQL duy nhất; không dùng Redis cache ở Phase 1</constraint>
    <constraint id="C04">JWT stateless; Refresh Token lưu DB để hỗ trợ revoke khi logout</constraint>
    <constraint id="C05">File upload giới hạn ≤ 2MB (ảnh đại diện server và user avatar)</constraint>
    <constraint id="C06">Invite link TTL: 7 ngày kể từ ngày tạo</constraint>
    <constraint id="C07">Timeline: 1 tháng (4 Sprints × 1 tuần), 16/04/2026 → 16/05/2026</constraint>
    <constraint id="C08">Budget: Không có ngân sách – dùng free-tier cloud (Render/Railway/Neon)</constraint>
  </constraints>

  <tech_stack>
    <layer name="Frontend">ReactJS (TypeScript) + TailwindCSS / CSS Modules</layer>
    <layer name="Backend">Spring Boot + Spring Security + JWT</layer>
    <layer name="Realtime">WebSocket / STOMP (messaging) + WebRTC (voice)</layer>
    <layer name="Database">PostgreSQL (users, servers, channels, messages, memberships, invite_codes)</layer>
    <layer name="Infrastructure">Render / Railway (backend) · Neon.tech (PostgreSQL) · Cloudflare TURN (WebRTC)</layer>
    <layer name="Dev Approach">Vibe Coding (AI-assisted) + Agile 1-week Sprints</layer>
  </tech_stack>

</vision_and_scope>


<!-- ================================================================
     PILLAR 3 – GLOSSARY
     Định nghĩa thuật ngữ chuẩn của dự án.
     ⚠️ AI assistant PHẢI đọc phần này trước khi trả lời.
     Không dùng thuật ngữ thay thế không có trong danh sách này.
================================================================ -->
<glossary>

  <!-- ── Domain Terms ── -->
  <term id="G01" en="Server" vi="Server">
    Không gian cộng đồng do một Owner tạo ra. Chứa nhiều Channel. Tương đương "Guild" trong Discord.
    Tránh gọi là "nhóm", "room", hay "workspace" – phải gọi là "Server".
  </term>

  <term id="G02" en="Channel" vi="Kênh">
    Kênh giao tiếp nằm trong một Server. Có 2 loại: Text Channel và Voice Channel.
    Tránh gọi là "phòng chat" hay "chat room".
  </term>

  <term id="G03" en="Text Channel" vi="Kênh text">
    Kênh dùng để nhắn tin văn bản realtime. Tên kênh lowercase, không dấu (e.g., #general, #dev-team).
  </term>

  <term id="G04" en="Voice Channel" vi="Voice channel">
    Kênh dùng để voice call qua WebRTC. Không phải "phòng họp" hay "meeting room".
  </term>

  <term id="G05" en="Server Owner" vi="Chủ server / Owner">
    Người tạo ra Server. Có toàn quyền: tạo/xóa kênh, invite, kick/ban thành viên.
    Persona đại diện: Anh Đạt (P01).
  </term>

  <term id="G06" en="Member" vi="Thành viên">
    Người dùng đã join Server. Có thể gửi tin nhắn, tham gia voice, nhưng không quản lý server.
    Persona đại diện: Minh Khoa (P02).
  </term>

  <term id="G07" en="Invite Link" vi="Link mời">
    URL dạng /invite/{code} với TTL 7 ngày. Người nhận click → auto join server.
    Không gọi là "invitation email" hay "referral link".
  </term>

  <term id="G08" en="Kick" vi="Kick">
    Hành động Owner xóa một Member khỏi Server. Member có thể re-join qua invite link mới.
    Phân biệt với Ban: kick không chặn vĩnh viễn.
  </term>

  <term id="G09" en="Ban" vi="Ban">
    Hành động Owner chặn vĩnh viễn một Member. Member không thể join lại dù có invite link.
  </term>

  <term id="G10" en="Unread Badge" vi="Badge tin nhắn chưa đọc">
    Số đếm tin nhắn chưa đọc hiển thị trên tên kênh trong sidebar.
    Tự biến mất khi người dùng click vào kênh đó.
  </term>

  <term id="G11" en="Speaking Indicator" vi="Speaking indicator">
    Hiệu ứng visual (viền xanh/glow) hiển thị quanh avatar của người đang nói trong voice channel.
  </term>

  <term id="G12" en="Display Name" vi="Tên hiển thị">
    Tên người dùng hiển thị trong server, tin nhắn, member list. Khác với email (dùng để đăng nhập).
    Giới hạn 1–50 ký tự.
  </term>

  <term id="G13" en="Online / Offline" vi="Online / Offline">
    Trạng thái hiển thị trong member list. Online = kết nối WebSocket active.
    Chỉ có 2 trạng thái ở Phase 1: Online (dot xanh) và Offline (dot xám).
    Không có "Away", "Do Not Disturb" hay trạng thái tùy chỉnh.
  </term>

  <!-- ── Technical Terms ── -->
  <term id="G14" en="WebSocket / STOMP" vi="WebSocket">
    Giao thức realtime cho messaging. Backend: Spring Boot + STOMP broker.
    Dùng cho: tin nhắn text, badge unread, member presence (online/offline).
  </term>

  <term id="G15" en="WebRTC" vi="WebRTC">
    Giao thức P2P cho voice channel. Cần STUN/TURN server cho NAT traversal.
    Phase 1: tối đa 20 người/phòng.
  </term>

  <term id="G16" en="JWT" vi="JWT (JSON Web Token)">
    Cơ chế xác thực stateless. Gồm:
    - Access Token: hết hạn sau 1 giờ, dùng cho API calls.
    - Refresh Token: hết hạn sau 7 ngày, lưu DB, dùng để cấp Access Token mới.
    Khi logout: Refresh Token bị revoke (xóa khỏi DB).
  </term>

  <term id="G17" en="User Story" vi="User Story">
    Mô tả yêu cầu theo định dạng: As a [persona], I want to [action], So that [benefit].
    Kèm Acceptance Criteria theo BDD (Given / When / Then).
    Mã hóa theo dạng LB-XXX (e.g., LB-101, LB-301).
  </term>

  <term id="G18" en="Business Goal" vi="Business Goal">
    Mục tiêu kinh doanh đo lường được, mã hóa BG-XX (e.g., BG-01, BG-02).
    Mỗi BG liên kết đến ít nhất 1 Persona và ít nhất 1 User Story.
  </term>

  <term id="G19" en="Vibe Coding" vi="Vibe Coding">
    Phương pháp phát triển sử dụng AI coding assistant (Cursor AI, GitHub Copilot) là driver chính.
    Developer review, chỉnh sửa và xác nhận output của AI.
  </term>

  <term id="G20" en="Phase 1 / MVP" vi="Phase 1 / MVP">
    Phiên bản phát hành đầu tiên của LiveBox, hoàn thành 13 User Stories trong 1 tháng.
    Là baseline trước khi phát triển Phase 2 (file sharing, mobile, emoji...).
  </term>

</glossary>


<!-- ================================================================
     PILLAR 4 – OUTPUT RULES
     Quy tắc bắt buộc cho AI assistant khi trả lời.
     ⚠️ Đọc kỹ và tuân thủ TUYỆT ĐỐI trước mỗi response.
================================================================ -->
<output_rules>

  <rule id="OR-01" category="Language">
    <title>Ngôn ngữ mặc định</title>
    <description>
      Trả lời bằng TIẾNG VIỆT trừ khi user yêu cầu cụ thể bằng tiếng Anh.
      Thuật ngữ kỹ thuật (WebSocket, JWT, STOMP, WebRTC...) giữ nguyên tiếng Anh, không dịch.
      Tên riêng của người dùng (Anh Đạt, Minh Khoa, Lan Anh) giữ nguyên, không thay thế.
    </description>
  </rule>

  <rule id="OR-02" category="Terminology">
    <title>Sử dụng đúng thuật ngữ Glossary</title>
    <description>
      Chỉ dùng các thuật ngữ được định nghĩa trong thẻ &lt;glossary&gt;.
      KHÔNG dùng: "phòng chat", "chat room", "nhóm", "workspace", "guild".
      PHẢI dùng: "Server", "Channel", "Kênh text", "Voice channel", "Invite Link", "Member".
      Tham chiếu User Story bằng mã LB-XXX, Business Goal bằng BG-XX.
    </description>
  </rule>

  <rule id="OR-03" category="Scope">
    <title>Không sáng tạo ngoài phạm vi Phase 1</title>
    <description>
      Khi đề xuất tính năng hoặc giải pháp, chỉ được giới hạn trong danh sách &lt;in_scope&gt;.
      Nếu yêu cầu liên quan đến tính năng &lt;out_of_scope&gt;, phải thông báo rõ:
      "Tính năng này nằm ngoài phạm vi Phase 1 và sẽ được xem xét ở Phase 2."
      KHÔNG tự thêm: emoji reaction, file sharing, DM, mobile app, screen share, Redis, AI moderation.
    </description>
  </rule>

  <rule id="OR-04" category="Format – User Stories">
    <title>Định dạng User Story chuẩn BDD</title>
    <description>
      Khi viết User Story mới hoặc chỉnh sửa, bắt buộc theo cấu trúc:
        As a [persona name + role]
        I want to [hành động cụ thể]
        So that [lợi ích đo lường được]
      Acceptance Criteria theo BDD:
        Given [điều kiện tiền đề]
        When  [hành động của user/system]
        Then  [kết quả kỳ vọng, có threshold cụ thể nếu là performance]
      Mã Story: LB-[Epic_number][Story_number] (e.g., LB-101, LB-203).
    </description>
  </rule>

  <rule id="OR-05" category="Format – Business Goals">
    <title>Định dạng Business Goal có KPI đo lường được</title>
    <description>
      Business Goal phải có:
        - Mã: BG-XX
        - KPI cụ thể, đo lường được (%, giây, ms, số lượng)
        - Liên kết Persona (P01/P02/P03)
        - Liên kết User Story (LB-XXX)
      KHÔNG viết goal mơ hồ như "cải thiện trải nghiệm" mà không có metric.
    </description>
  </rule>

  <rule id="OR-06" category="Format – Technical">
    <title>Giới hạn kỹ thuật Phase 1</title>
    <description>
      Khi đề xuất giải pháp kỹ thuật, phải tuân thủ constraints:
        - Database: PostgreSQL only (không Redis, không MongoDB)
        - Auth: JWT Access Token (1h) + Refresh Token (7 ngày)
        - Concurrent users: ≤ 500
        - Voice room: ≤ 20 người
        - File upload: ≤ 2MB
        - Invite TTL: 7 ngày
      Nếu giải pháp yêu cầu vượt constraint, phải ghi chú "Phase 2 consideration".
    </description>
  </rule>

  <rule id="OR-07" category="Traceability">
    <title>Traceability bắt buộc</title>
    <description>
      Khi đề xuất thay đổi bất kỳ (tính năng, flow, UI), phải chỉ rõ:
        - Persona nào được phục vụ (P01 / P02 / P03 + tên)
        - Business Goal liên quan (BG-XX)
        - User Story tương ứng (LB-XXX) hoặc đề xuất tạo Story mới
      Không được có tính năng "mồ côi" (không có persona hoặc BG đứng sau).
    </description>
  </rule>

  <rule id="OR-08" category="Document">
    <title>Cập nhật tài liệu đồng bộ</title>
    <description>
      Khi User Story, Business Goal hoặc Persona thay đổi, phải kiểm tra và cập nhật đồng bộ
      các file sau trong thư mục Document/01_Business/Personas/LiveBox/tanh/:
        - LiveBox_User_Personas_v0.1.html
        - LiveBox_User_Stories_v0.1.html
        - LiveBox_Business_Goals_v0.1.html
        - LiveBox_Stakeholder_Matrix_v0.1.html
        - LiveBox_Project_Charter_v0.1.html
      Cảnh báo user nếu thay đổi ảnh hưởng cross-document traceability.
    </description>
  </rule>

</output_rules>
