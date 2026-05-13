# ADR-001: Adopt Modular Monolith with Spring Boot + React Tech Stack

| Field          | Value                             |
| -------------- | --------------------------------- |
| **Date**       | 2026-04-16                        |
| **Status**     | Accepted                          |
| **Author(s)**  | Solution Architect (Tech Lead AI) |
| **Applies to** | LiveBox Real-time Chat Platform   |

---

## 1. Context

### 1.1 Business Context (Bối cảnh Nghiệp vụ)

We are building the **LiveBox Real-time Chat Platform**, a centralized collaboration tool allowing small-to-medium teams to communicate via text messaging and voice channels.

| Project     | Domain                  | Scale         | Users                              | MVP Timeline      |
| ----------- | ----------------------- | ------------- | ---------------------------------- | ----------------- |
| **LiveBox** | Real-time Communication | 100 CCUs peak | Guest, Active Member, Server Owner | 4 weeks (1 month) |

### 1.2 Technical Constraints (Ràng buộc Kỹ thuật)

| Constraint      | Detail                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| **Team Size**   | Small team requiring high velocity.                                      |
| **Team Skill**  | Java/Spring Boot proficient. React (TypeScript). Limited heavy DevOps.   |
| **Budget**      | $0 (Zero Budget). Must rely on free-tier cloud platforms (Render, Neon). |
| **Timeline**    | 1 Month MVP. No room for complex infrastructure setup.                   |
| **Voice Rooms** | Max 20 concurrent participants per Voice Channel (LiveKit SFU).          |
| **Caching**     | No Redis cache allowed in Phase 1 (`C03` constraint). PostgreSQL only.   |

### 1.3 Problem Statement

> **We need a single, reusable architecture pattern and tech stack that enables rapid real-time capabilities (WebSocket + LiveKit SFU) with zero budget**, ensuring fast delivery, high developer productivity, and sufficient stability for 500 CCUs.

---

## 2. Options Considered (Các Phương án Đánh giá)

### Option A: Distributed Microservices (Spring Cloud + Kafka/Redis)

| Criterion      | Assessment                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Infra Cost     | High minimum cost. Cannot run multiple services + Kafka on free-tier.                               |
| Team Fit       | Distributed tracing and orchestration are too complex for a 1-month MVP.                            |
| Time-to-Market | Very slow infra setup before any business logic is written.                                         |
| Scalability    | Infinite horizontal scaling.                                                                        |
| **Verdict**    | **REJECTED** — Catastrophically over-engineered for 500 CCU limits. Kills both budget and timeline. |

### Option B: Serverless (AWS Lambda + API Gateway)

| Criterion      | Assessment                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Statefulness   | Serverless functions do not persist long-lived WebSocket connections reasonably without expensive external API Gateway WebSocket layers.        |
| Infra Cost     | Pay-per-invoke.                                                                                                                                 |
| Time-to-Market | Significant learning curve for purely serverless real-time streams.                                                                             |
| **Verdict**    | **REJECTED** — Stateful WebSocket connections and WebRTC signaling clash fundamentally with the ephemeral nature of basic Serverless functions. |

### Option C: Modular Monolith (Spring Boot Embedded STOMP) — Recommended

| Criterion      | Assessment                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Infra Cost     | $0 (Free tiers on Render/Railway).                                                                      |
| Team Fit       | Core competency. Ready from Day 1.                                                                      |
| Time-to-Market | 4 weeks to production-ready MVP.                                                                        |
| Real-time      | Spring Boot's internal SimpleBroker handles WebSocket STOMP perfectly out of the box.                   |
| **Verdict**    | **APPROVED** — Best ROI. Fastest time-to-market. Team-ready and satisfies 100% of Phase 1 requirements. |

---

## 3. Decision (Quyết định)

**We will adopt the Modular Monolith architecture pattern with an internal Message Broker for the LiveBox MVP.**

### 3.1 Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│                React 18 + Vite (SPA)                     │
│      TailwindCSS / Zustand / LiveKit Components React     │
└──────────────────────┬─────────────────┬────────────────┘
         HTTPS / REST API                WebSocket (STOMP)
┌──────────────────────▼─────────────────▼────────────────┐
│                   API & GATEWAY LAYER                     │
│              Spring Boot 3.x (Tomcat)                     │
│            JWT Auth Filter ← Spring Security              │
│        In-Memory STOMP Broker (SimpleBroker)              │
├─────────────────────────────────────────────────────────┤
│                   MODULE LAYER (Bounded Contexts)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Auth     │ │ Server   │ │ Channel  │ │ Messaging   │ │
│  │ Module   │ │ Module   │ │ Module   │ │ & Signaling │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬──────┘ │
│       │            │            │              │        │
│  ┌────▼────────────▼────────────▼──────────────▼──────┐ │
│  │           SHARED KERNEL (Exceptions, Utils,        │ │
│  │                   Base Entities)                   │ │
│  └────────────────────┬───────────────────────────────┘ │
├───────────────────────┼─────────────────────────────────┤
│                      DATA LAYER                          │
│            Spring Data JPA + Hibernate ORM               │
│               PostgreSQL (Neon.tech)                     │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Full Tech Stack

#### Backend

| Layer         | Technology                                  | Version | Justification                                               |
| ------------- | ------------------------------------------- | ------- | ----------------------------------------------------------- |
| **Runtime**   | Java                                        | 21 LTS  | Performance improvements (Virtual Threads).                 |
| **Framework** | Spring Boot                                 | 3.5.13  | Industry standard, massive ecosystem.                       |
| **Security**  | Spring Security + JWT + OAuth 2 With Google | —       | Stateless API auth, with stateful Refresh token for revoke. |
| **Real-time** | Spring STOMP over WebSocket                 | —       | Standardized pub/sub messaging inside the JVM.              |
| **Voice**     | LiveKit Server SDK (Java)                   | 0.6.x   | JWT token generation for LiveKit SFU rooms.                 |
| **ORM**       | Spring Data JPA (Hibernate)                 | —       | Type-safe queries, fast schema generation.                  |
| **Database**  | PostgreSQL                                  | 17      | Phase 1 Single Source of Truth `C03`.                       |
| **Storage**   | Cloudinary Java SDK                         | —       | Object storage for user avatars and server icons.           |

#### Frontend

| Layer          | Technology               | Version | Justification                                                |
| -------------- | ------------------------ | ------- | ------------------------------------------------------------ |
| **Framework**  | React                    | 19      | Component-based, large ecosystem.                            |
| **Language**   | TypeScript               | 5+      | Type safety for reliable UI components.                      |
| **Router**     | React Router             | 7       | Enables client-side routing and navigation between pages.    |
| **Styling**    | TailwindCSS              | 3+      | Fast, utility-first styling for chat UIs.                    |
| **State Mgmt** | Zustand                  | —       | Zero-boilerplate state management for active rooms/messages. |
| **Voice**      | LiveKit Components React | 2.x     | Pre-built hooks & components for LiveKit SFU voice channels. |

#### DevOps & Infrastructure

| Layer              | Technology                 | Justification                                                                                  |
| ------------------ | -------------------------- | ---------------------------------------------------------------------------------------------- |
| **Hosting (BE)**   | Render / Railway (Free)    | Minimal config deployment. Connects to persistent DB.                                          |
| **Hosting (FE)**   | Vercel / Netlify (Free)    | Zero-config React deployment. Auto CDN.                                                        |
| **DB Hosting**     | Neon.tech/ Supabase (Free) | Serverless Postgres, scales to zero.                                                           |
| **Voice Infra**    | LiveKit Cloud (Free Tier)  | Managed SFU with built-in TURN/STUN. No self-hosted server.                                    |
| **Object Storage** | Cloudinary (Free Tier)     | Persistent image storage, bypasses free PaaS ephemeral disk limits. CDNs images automatically. |

### 3.3 Project Structure (Chuẩn thư mục)

#### Backend (Modular Monolith)

```
livebox-backend/
├── src/main/java/com/livebox/
│   ├── config/          ← WebSocket, Security, JWT config
│   ├── common/          ← Shared kernel: DTOs, Exceptions, Enums
│   ├── module/
│   │   ├── auth/        ← Auth Module: login, register, token refresh
│   │   ├── server/      ← Management: create server, members, kick/ban
│   │   ├── channel/     ← Create/delete text and voice channels
│   │   └── message/     ← WebSocket chat streams, unread badges, signaling
│   └── LiveBoxApplication.java
└── pom.xml
```

#### Frontend (Feature-based)

```
livebox-frontend/
├── src/
│   ├── assets/          ← Static assets: images, icons, fonts
│   ├── components/      ← Shared UI components (Atomic design)
│   ├── config/          ← App config: API endpoints, LiveKit, STOMP
│   ├── features/        ← Feature-based modules (Mirroring Backend)
│   │   ├── auth/        ← Login, Register, Profile
│   │   ├── server/      ← Server management, Member lists
│   │   ├── channel/     ← Channel creation, Voice room UI
│   │   └── message/     ← Chat window, WebSocket handling
│   ├── hooks/           ← Custom React hooks (logic reuse)
│   ├── pages/           ← Page components (Login, Dashboard, Room)
│   ├── store/           ← State management (Zustand stores)
│   ├── utils/           ← Utility functions and constants
│   └── main.tsx         ← Application entry point
├── package.json
└── vite.config.ts
```

---

## 4. Consequences (Hệ quả)

### Positive (Tích cực)

| #   | Impact                     | Detail                                                                                          |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | **Fastest time-to-market** | Zero infrastructure overhead means coding starts on Day 1.                                      |
| 2   | **No Budget Requirements** | Relies entirely on optimized free tiers, fulfilling constraints.                                |
| 3   | **Familiar Synergy**       | Spring Boot handles WebSockets incredibly efficiently, meshing easily with React STOMP clients. |

### Negative (Tiêu cực / Nợ kỹ thuật)

| #   | Risk                         | Mitigation                                                                                                                                     |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Cold Starts on Free-Tier** | Spring Boot deployed on Render Free takes ~1-2 mins to boot from sleep. **Mitigation:** Setup cron-job.org to ping the API every 14 minutes.   |
| 2   | **LiveKit Cloud Dependency** | Voice channels depend on LiveKit Cloud availability. **Mitigation:** Free tier provides sufficient uptime for Phase 1 scale (≤ 20 users/room). |
| 3   | **Vertical Scaling Ceiling** | SimpleBroker cannot broadcast messages between two backend servers. **Mitigation:** Post-MVP, swap SimpleBroker for a `RedisMessageBroker`.    |

---

## 5. Compliance & Verification (Kiểm chứng)

| #   | Verification Action                                                                   | Owner     | Deadline |
| --- | ------------------------------------------------------------------------------------- | --------- | -------- |
| 1   | Load test WebSocket STOMP for 500 CCUs using JMeter. Ensure latency < 500ms.          | QA / Team | Sprint 3 |
| 2   | LiveKit Room join flow: verify JWT token generation → room connection → audio stream. | Frontend  | Sprint 4 |
| 3   | Verify Refresh Token Revoke functionality (Security Logouts).                         | Backend   | Sprint 2 |

---

## 6. Related Documents (Tài liệu Liên quan)

| Document        | Path                                                      | Relationship                                              |
| --------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Project Context | `project_context.md`                                      | Primary rules, constraints, bounded context.              |
| SRS             | `LiveBox_Report3_Software_Requirement_Specification.docx` | Provides detailed system requirements and specifications. |

---

## 7. Decision Log (Nhật ký Quyết định)

| Date       | Action                                                                                                  | By           |
| ---------- | ------------------------------------------------------------------------------------------------------- | ------------ |
| 2026-04-16 | ADR-001 created for LiveBox. Status: **Accepted**.                                                      | Tech Lead AI |
| 2026-05-09 | Updated Voice layer: replaced native WebRTC P2P with LiveKit SFU. See **ADR-002** for full rationale.   | Tech Lead AI |
| 2026-05-11 | Updated Storage layer: Adopted Cloudinary for persistent image storage to handle PaaS ephemeral limits. | Tech Lead AI |
| 2026-05-13 | Added Frontend project structure mirroring Backend modules to ADR-001.                                   | Tech Lead AI |

---

> **Architect's Note:** For an MVP aiming to capture core chat functionality within 1 month, avoiding premature optimization is paramount. Redis and Kafka are powerful, but maintaining a stateless HTTP layer alongside a stateful JVM WebSocket broker attached to PostgreSQL is the absolute fastest path to victory. Limits are known and documented.
>
> **Amendment (2026-05-09):** Voice infrastructure has been upgraded from a native WebRTC P2P mesh to LiveKit SFU (see ADR-002). This eliminates the client-side CPU bottleneck of mesh topologies and removes the need for a self-managed TURN server, while remaining within the zero-budget constraint via LiveKit Cloud free tier.
>
> **Amendment (2026-05-11):** Cloudinary has been adopted as the persistent object storage for user avatars and attachments. Free-tier PaaS environments reset local storage on deployments; Cloudinary prevents data loss while fulfilling the zero-budget requirement.
