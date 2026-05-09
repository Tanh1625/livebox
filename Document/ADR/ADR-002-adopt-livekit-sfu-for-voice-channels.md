# ADR-002: Adopt LiveKit SFU for Voice Channels (Replace Native WebRTC P2P)

| Field                | Value                             |
| -------------------- | --------------------------------- |
| **Date**       | 2026-05-09                        |
| **Status**     | Accepted                          |
| **Author(s)**  | Solution Architect (Tech Lead AI) |
| **Applies to** | LiveBox Real-time Chat Platform – Voice Module (LB-401) |
| **Supersedes** | WebRTC P2P approach documented in ADR-001 (Section 3.2, Signaling) |

---

## 1. Context (Bối cảnh)

### 1.1 Vấn đề với WebRTC P2P thuần (Mesh Topology)

Trong ADR-001, Voice Channel được thiết kế dựa trên native WebRTC APIs theo mô hình **P2P Mesh**:
mỗi participant kết nối trực tiếp với tất cả participant còn lại. Điều này dẫn đến các vấn đề thực tế:

| Vấn đề | Chi tiết |
|--------|----------|
| **CPU overload phía client** | N người → N×(N-1)/2 kết nối. 20 người = 190 kết nối đồng thời trên mỗi browser tab. |
| **Signaling phức tạp** | Backend phải tự quản lý ICE candidates, SDP offer/answer, reconnect logic. |
| **TURN server cần self-managed** | Cloudflare TURN free-tier có giới hạn bandwidth và không có SLA. |
| **Không có speaking indicator sẵn** | Phải tự implement Web Audio API + VAD (Voice Activity Detection). |
| **Khó debug trong production** | Không có dashboard theo dõi room state, participant, bitrate. |

### 1.2 Sprint 4 – Thực tế triển khai

Trong quá trình triển khai Sprint 4, team đã tích hợp thử nghiệm LiveKit Cloud và xác nhận:
- **Backend**: LiveKit Server SDK (Java) generate JWT Room Token trong < 5ms.
- **Frontend**: `@livekit/components-react` cung cấp `<LiveKitRoom>`, `<AudioConference>`, speaking indicator sẵn có.
- **Infrastructure**: LiveKit Cloud free-tier xử lý TURN/STUN nội bộ, không cần cấu hình thêm.

---

## 2. Options Considered (Các Phương án Đánh giá)

### Option A: Tiếp tục WebRTC P2P Mesh (Giữ nguyên)

| Criterion | Assessment |
|-----------|------------|
| CPU Client | O(N²) connections. Không thể chịu được 20 users mà không bị lag. |
| Self-managed TURN | Phải deploy Coturn hoặc dùng Cloudflare TURN (không có SLA). |
| Development effort | Phải tự implement signaling, ICE, reconnect, VAD từ đầu. |
| **Verdict** | **REJECTED** — Quá tốn công triển khai với chất lượng thấp hơn LiveKit. |

### Option B: Self-hosted LiveKit Server

| Criterion | Assessment |
|-----------|------------|
| Cost | Cần VPS riêng để chạy LiveKit Server. Không phù hợp budget $0. |
| Ops Complexity | Docker, TURN config, SSL, port forwarding. Vượt quá khả năng team nhỏ. |
| **Verdict** | **REJECTED** — Vượt constraint C08 (zero budget) và C07 (1 month timeline). |

### Option C: LiveKit Cloud (Free Tier) — Recommended

| Criterion | Assessment |
|-----------|------------|
| Cost | Free tier: 50 CCUs, đủ cho Phase 1 (max 20/room, constraint C02). |
| CPU Client | SFU architecture: mỗi client chỉ gửi 1 stream lên server, nhận N streams xuống. |
| Dev Effort | SDK official cho Java backend + React frontend. Speaking indicator built-in. |
| TURN/STUN | Managed by LiveKit Cloud. Không cần tự cấu hình. |
| Observability | LiveKit Cloud dashboard: rooms, participants, bitrate realtime. |
| **Verdict** | **APPROVED** — Zero budget, giảm development effort, chất lượng voice cao hơn P2P. |

---

## 3. Decision (Quyết định)

**Chúng ta sẽ sử dụng LiveKit Cloud (Free Tier) làm SFU infrastructure cho toàn bộ Voice Channel trong Phase 1.**

### 3.1 Kiến trúc Voice Channel mới

```
  CLIENT A                  LIVEKIT CLOUD (SFU)              CLIENT B
┌──────────┐   publish audio  ┌─────────────────┐  subscribe  ┌──────────┐
│ Browser  │ ────────────────▶│   LiveKit Room   │────────────▶│ Browser  │
│LiveKitRoom│                 │  (managed TURN)  │             │LiveKitRoom│
└────┬─────┘                 └────────┬─────────┘             └────┬─────┘
     │  GET /api/livekit/token        │                            │
     │ ◀─────────────────────────────│                            │
     │          SPRING BOOT BACKEND  │                            │
     │  LiveKitController             │                            │
     │  └─ LiveKitTokenService        │                            │
     │     └─ AccessToken (JWT)       │                            │
```

### 3.2 Luồng kết nối Voice Channel

1. **User click Join** Voice Channel trên Frontend.
2. Frontend gọi `GET /api/livekit/token?channelId={id}` với Bearer JWT.
3. `LiveKitController` xác thực JWT → gọi `LiveKitTokenService`.
4. `LiveKitTokenService` dùng **LiveKit Server SDK (Java)** generate `AccessToken` với `roomName = channelId`.
5. Frontend nhận token → khởi tạo `<LiveKitRoom serverUrl={WS_URL} token={token}>`.
6. LiveKit Cloud xử lý TURN/STUN, media routing, và cung cấp speaking indicators natively.

### 3.3 Tech Stack thay đổi

#### Backend – Thêm mới

| Dependency | Artifact ID | Version | Mục đích |
|------------|------------|---------|----------|
| LiveKit Server SDK | `io.livekit:livekit-server` | `0.6.x` | Generate Room AccessToken (JWT) |

#### Frontend – Thay thế

| Cũ (bỏ) | Mới (dùng) | Lý do |
|---------|-----------|-------|
| Native `RTCPeerConnection` APIs | `@livekit/components-react` `2.x` | Pre-built `<LiveKitRoom>`, `<AudioConference>`, speaking indicator |
| Cloudflare TURN config | *(không cần)* | LiveKit Cloud tích hợp TURN nội bộ |

#### Environment Variables – Thêm mới

| Variable | Scope | Mô tả |
|----------|-------|-------|
| `LIVEKIT_API_KEY` | Backend | API Key từ LiveKit Cloud dashboard |
| `LIVEKIT_API_SECRET` | Backend | API Secret để sign AccessToken |
| `LIVEKIT_URL` | Frontend | `wss://your-project.livekit.cloud` |

---

## 4. Consequences (Hệ quả)

### Positive (Tích cực)

| # | Impact | Detail |
|---|--------|--------|
| 1 | **Loại bỏ WebRTC Mesh CPU Load** | SFU architecture: O(N) thay vì O(N²) connections phía client. |
| 2 | **Không cần self-managed TURN** | LiveKit Cloud tích hợp sẵn. Giảm infra complexity. |
| 3 | **Speaking indicator built-in** | `useIsSpeaking()` hook từ LiveKit SDK. Không cần tự implement VAD. |
| 4 | **Giảm signaling code trên backend** | Chỉ cần endpoint generate token. LiveKit Cloud xử lý toàn bộ signaling. |
| 5 | **Observability** | LiveKit Cloud dashboard theo dõi room state realtime. |

### Negative / Trade-offs (Tiêu cực / Nợ kỹ thuật)

| # | Risk | Mitigation |
|---|------|------------|
| 1 | **External dependency** | Voice channels phụ thuộc uptime của LiveKit Cloud. **Mitigation:** Free-tier SLA đủ cho Phase 1; Phase 2 có thể self-host. |
| 2 | **Free-tier limits** | LiveKit Cloud free-tier: 50 CCUs. **Mitigation:** Phase 1 giới hạn 20 users/room (constraint C02), đủ dưới ngưỡng. |
| 3 | **Vendor lock-in** | SDK proprietary. **Mitigation:** Abstraction layer `LiveKitTokenService` dễ thay thế nếu cần. |

---

## 5. Compliance & Verification (Kiểm chứng)

| # | Verification Action | Owner | Deadline |
|---|---------------------|-------|----------|
| 1 | Backend: `GET /api/livekit/token` trả về valid JWT, room connect thành công. | Backend | Sprint 4 |
| 2 | Frontend: `<LiveKitRoom>` kết nối, audio stream hoạt động, speaking indicator hiển thị. | Frontend | Sprint 4 |
| 3 | Stress test: 20 participants cùng lúc trong 1 Voice Channel. Audio không bị drop. | QA / Team | Sprint 4 |
| 4 | Verify LiveKit free-tier CCU limit không bị vượt trong normal Phase 1 usage. | Backend | Sprint 4 |

---

## 6. Related Documents (Tài liệu Liên quan)

| Document | Path | Relationship |
|----------|------|--------------|
| ADR-001 | `Document/ADR/ADR-001-adopt-modular-monolith-springboot-react.md` | Parent ADR. Section 3.2 đã được amended để reflect quyết định này. |
| Project Context | `project_context.md` | `<tech_stack>`, `<constraints> C02`, `<glossary> G04/G15` đã được cập nhật. |
| User Story LB-401 | SRS Document | Voice Channel 1-click, tối đa 20 người/phòng, speaking indicator. |

---

## 7. Decision Log (Nhật ký Quyết định)

| Date | Action | By |
|------|--------|----|
| 2026-05-09 | ADR-002 created. LiveKit SFU adopted for Voice Channels. Status: **Accepted**. | Tech Lead AI |

---

> **Architect's Note:** LiveKit Cloud free-tier là lựa chọn tối ưu nhất cho Phase 1 zero-budget constraint. Việc delegate toàn bộ media routing, NAT traversal, và SFU logic cho LiveKit Cloud giúp team tập trung vào business logic (token generation, channel management) thay vì WebRTC internals. Nếu Phase 2 yêu cầu SLA cao hơn hoặc on-premise deployment, self-hosted LiveKit Server (Docker) là con đường migration tự nhiên với zero code change trên client.
