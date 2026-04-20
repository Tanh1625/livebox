# LiveBox - System Wireframe Specification

> **Document Target:** UI/UX Designers, Frontend Developers
> **Based on:** `project_context.md`, `LiveBox_Report3_Software_Requirement_Specification.docx`
> **Constraint:** Phase 1 MVP (Max 500 CCU, Max 20 voice users, No Mobile App, No File Sharing, Zero Budget Infra).

---

## 1. System Summary
**LiveBox** is a real-time web-based communication platform aiming to replace multiple disjointed tools (chat + voice) into a single, seamless interface. The MVP focuses on extremely fast onboarding (under 30s), low-latency text messaging (WebSocket), and instant P2P voice rooms (WebRTC).

## 2. Module List
- **[MOD-AUTH]** Authentication (Login, Register, Session)
- **[MOD-SVR]** Server Management (Create, Invite, Kick/Ban)
- **[MOD-CHN]** Channel Management (Text, Voice)
- **[MOD-MSG]** Real-time Messaging (Send/Receive, Unread Badges)
- **[MOD-USR]** User Profile (Avatar, Display Name, Presence)

## 3. User Roles
- **Server Owner (P01):** Full control. Can create servers, manage channels, kick/ban users.
- **Active Member (P02):** Core participant. Can send text, join voice, leave server, update profile.
- **Guest User (P03):** Newcomer. Needs fast registration via invite links to access the platform.

## 4. Use Case List
- **UC-101:** Đăng ký tài khoản (Guest)
- **UC-102:** Đăng nhập (All)
- **UC-103:** Đăng xuất an toàn (All)
- **UC-201:** Tạo server (Owner)
- **UC-202:** Mời thành viên qua invite link (Owner)
- **UC-203:** Kick/Ban thành viên (Owner)
- **UC-204:** Rời server (Member)
- **UC-301:** Gửi/nhận tin nhắn realtime (All)
- **UC-302:** Tạo/đổi tên/xóa kênh text (Owner)
- **UC-303:** Danh sách thành viên online/offline (All)
- **UC-401:** Tham gia/rời voice channel (All)
- **UC-501:** Badge unread tin nhắn (All)
- **UC-601:** Cập nhật profile (All)

## 5. Feature Mapping
| Feature | Module | Use Case |
|---------|--------|----------|
| JWT Login/Register | MOD-AUTH | UC-101, UC-102, UC-103 |
| Server Operations | MOD-SVR | UC-201, UC-202, UC-203, UC-204 |
| Text/Voice Channels | MOD-CHN | UC-302, UC-401 |
| Chat & Badges | MOD-MSG | UC-301, UC-501 |
| Presence & Profile | MOD-USR | UC-303, UC-601 |

## 6. Screen Mapping
| Feature Name | Screen Name | Screen ID | Module |
|--------------|-------------|-----------|--------|
| Authentication | Login/Register Screen | `SCR-AUTH-01` | MOD-AUTH |
| Core Chat | Main Application Layout | `SCR-APP-01` | All |
| Create Server | Create Server Modal | `MODAL-SVR-01`| MOD-SVR |
| User Settings | Profile Settings Modal | `MODAL-USR-01`| MOD-USR |

## 7. User Flow
1. **Onboarding Flow:** Guest → Click Invite Link → `SCR-AUTH-01` (Register) → Auto-join Server → `SCR-APP-01`.
2. **Daily Chat Flow:** User → `SCR-AUTH-01` (Login) → `SCR-APP-01` → View Badge Unread → Click Channel → Read/Send Message.
3. **Voice Flow:** User → `SCR-APP-01` → Click Voice Channel → Join WebRTC Room → Speaking Indicator Active.

---

## 8. Wireframe Screens

### 8.1 Screen Name: Login & Register Screen
**Screen ID:** `SCR-AUTH-01`
**Module:** MOD-AUTH
**User Role:** Guest User (P03)
**Purpose:** Extremely fast onboarding (≤ 30s) using simple Email/Password.

**Layout Structure:**
- **Main Content:** Centered Card Layout containing Auth Form. Split into two Tabs (Login / Register).

**Components:**
- `TAB-AUTH`: Tabs [Login | Register]
- `TXT-EMAIL`: Text Input (Type: Email)
- `TXT-PASS`: Text Input (Type: Password)
- `BTN-SUBMIT`: Primary Button

**Data Fields:**
- `Email`: Required, Valid Email Format.
- `Password`: Required, Min 6 chars.

**Interaction:**
- **User Action:** Click Login/Register
- **System Response:** Validate Form → API Call → Store JWT → Redirect to `SCR-APP-01`.

**States:**
- **Default:** Empty form fields.
- **Loading:** `BTN-SUBMIT` shows spinner, form disabled.
- **Error:** Inline red text under invalid fields. Toast notification for API errors (e.g., "Invalid Credentials").

**Access Control:** Unauthenticated users only.

---

### 8.2 Screen Name: Main Application Layout
**Screen ID:** `SCR-APP-01`
**Module:** MOD-SVR, MOD-CHN, MOD-MSG, MOD-USR
**User Role:** All Roles
**Purpose:** Single unified interface for Server switching, Channel navigation, Text Chat, and Voice.

**Layout Structure:**
- **Sidebar 1 (Leftmost - 80px):** Server Navigation
- **Sidebar 2 (Inner Left - 240px):** Channel & Voice Navigation
- **Header (Top - 60px):** Server Name, Current Channel, Top-right Profile Dropdown.
- **Main Content (Center - Fluid):** Message History & Chat Input Area.
- **Sidebar 3 (Right - 240px):** Online/Offline Member List.

**Components:**
- **Sidebar 1:**
  - `BTN-SVR-ICON`: Circular Image Placeholder (List of joined servers).
  - `BTN-ADD-SVR`: Circular button with "+" icon.
- **Sidebar 2:**
  - `TXT-SVR-NAME`: H2 Text.
  - `BTN-INVITE`: Link generation button (Owner only).
  - `LIST-CHN-TEXT`: List of text channels. Includes `BADGE-UNREAD` (Red dot + number) if unread messages > 0.
  - `LIST-CHN-VOICE`: List of voice channels.
  - `PANEL-ACTIVE-VOICE`: Sticky bottom panel showing "Connected to Voice" + `BTN-DISCONNECT`.
- **Main Content:**
  - `LIST-MESSAGES`: Scrollable list. `COMP-MESSAGE-ITEM` (Avatar, Name, Time, Content).
  - `INPUT-CHAT`: Sticky bottom text area.
  - `BTN-SEND`: Icon button inside `INPUT-CHAT`.
- **Sidebar 3:**
  - `LIST-MEMBERS`: Grouped by "Online" (Green dot) and "Offline" (Gray dot).
  - `BTN-KICK/BAN`: Context menu on member right-click (Owner only).

**Interaction:**
- **User Action:** Click Text Channel
- **System Response:** Load messages, clear `BADGE-UNREAD`, update Header.
- **User Action:** Click Voice Channel
- **System Response:** Request Mic permission, connect WebRTC, show `PANEL-ACTIVE-VOICE`.

**States:**
- **Empty:** "No messages in this channel yet."
- **Loading:** Skeleton loaders for messages and member list on initial boot.

**Access Control:** Authenticated users. Owner sees "Add Channel" and "Kick/Ban" buttons.

---

### 8.3 Screen Name: Create Server Modal
**Screen ID:** `MODAL-SVR-01`
**Module:** MOD-SVR
**Purpose:** Allow users to create a new workspace.

**Layout Structure:**
- Modal overlay centered on screen.

**Components:**
- `INPUT-IMAGE`: Avatar upload box (Drag & Drop placeholder).
- `TXT-SVR-NAME`: Text Input.
- `BTN-CANCEL`: Secondary Button.
- `BTN-CREATE`: Primary Button.

**Data Fields:**
- `Server Avatar`: Optional. PNG/JPG ≤ 2MB.
- `Server Name`: Required. 1-50 chars.

**Interaction:**
- **User Action:** Submit Valid Form.
- **System Response:** API Call → Append new `BTN-SVR-ICON` to Sidebar 1 → Auto-switch context to new Server.

---

### 8.4 Screen Name: Profile Settings Modal
**Screen ID:** `MODAL-USR-01`
**Module:** MOD-USR
**Purpose:** Update personal details and Logout.

**Layout Structure:**
- Modal overlay.

**Components:**
- `INPUT-IMAGE`: User Avatar upload.
- `TXT-DISPLAY-NAME`: Text Input.
- `BTN-LOGOUT`: Danger Button (Red).
- `BTN-SAVE`: Primary Button.

**Interaction:**
- **User Action:** Click Logout.
- **System Response:** Call `/auth/logout` API → Revoke Refresh Token → Purge local storage → Redirect to `SCR-AUTH-01`.

---

## 9. Assumptions
- **ASSUMPTION 1:** "Forgot Password" is NOT in the Phase 1 MVP scope (No User Story LB-10x covers email recovery).
- **ASSUMPTION 2:** Right sidebar (Member List) is collapsible on smaller laptop screens to save space.
- **ASSUMPTION 3:** Incoming voice streams are visualized via a "Speaking Indicator" (Glow border around avatars in the voice list), not a massive screen-takeover.

## 10. Missing Information
- **UI Colors:** Specific HEX codes are deferred to UI Designers.
- **WebRTC Fallback:** If TURN server fails, the UI does not specify an error state beyond a generic toast notification.

## 11. UX Recommendations
- **Cold Start UX:** Because the free-tier backend (Render) might take 60s to wake up, the Login screen `BTN-SUBMIT` must have an explicit timeout handler and a friendly message: *"Server is waking up, please wait a moment..."* to prevent user frustration.
- **WebSocket Reconnection:** If the WebSocket drops, display a persistent yellow banner `COMP-OFFLINE-BANNER` at the top of `SCR-APP-01` until reconnected.

## 12. Validation Summary
- Email: Regex validation standard.
- Password: Length ≥ 6.
- Avatars: File size limit checking strictly applied on the Client-side BEFORE upload to save bandwidth.

## 13. Quality Checklist
- [x] All 13 Use Cases have designated screens/interactions.
- [x] No out-of-scope features (e.g., Direct Messaging, File Sharing) were included.
- [x] Navigation logic supports Invite Link flow.
- [x] Clear Access Control boundaries between Owner and Member.
- [x] Edge cases (Loading, Empty states) documented.
