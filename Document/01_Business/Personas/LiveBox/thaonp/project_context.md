<user_personas>
## 1. User Personas
Derived from the `ATP_User_Personas_v1.html` analysis, the LiveBox ecosystem targets 3 primary user groups. This serves as the foundation for UI/UX design and Agile backlog prioritization:

**Alex - "The Organizer" (Key User | Community Admin / Server Owner)**
- **Behavior & Traits:** System administrator mindset. Requires efficient workflows, granular Role-Based Access Control (RBAC), and immediate UI feedback during state mutations.
- **Pain Points:** Tedious form submissions for Server/Channel provisioning. Disjointed UI experiencing state desynchronization (requires F5 hard refreshes). Unclear mapping of domain entities.
- **System Objectives:** Enable seamless Server/Channel provisioning without page reloads (Single Page Application - SPA). Ensure the Sidebar automatically synchronizes (UI Reactivity) with backend state mutations.

**Jamie - "The Socializer" (End User | Authenticated User / Member)**
- **Behavior & Traits:** High-frequency interaction. Expects ultra-low latency (< 200ms). Highly sensitive to network lags, frozen UI frames, or unacknowledged socket payloads.
- **Pain Points:** High latency and battery draining due to legacy HTTP polling. Ambiguous message states (pending vs. sent). Losing contextual flow during connection drops.
- **System Objectives:** Implement real-time message broadcasting via the WebSocket protocol. Utilize Optimistic UI patterns to instantly render messages upon pressing "Enter" while awaiting server Acknowledgment (ACK).

**Sam - "The Explorer" (External User | Anonymous Visitor / Guest)**
- **Behavior & Traits:** First-time visitor evaluating the platform. Values smooth onboarding flows. Expects industry-standard security practices for credentials handling.
- **Pain Points:** Obscure backend validation errors. Clunky registration flows. Generic error pages (e.g., getting abruptly dropped into a raw 401 Unauthorized page).
- **System Objectives:** Secure password hashing (BCrypt) and JWT session management encapsulated in HttpOnly cookies. Gracefully intercept 401 errors to seamlessly redirect guests to the Login route.
</user_personas>

<vision_and_scope>
## 2. Vision and Scope
Synthesized from `ATP_ProjectCharter.html` and `ATP_Business_Goals_v1.html` to align technical architecture with business goals.

### Project Vision
LiveBox is a highly scalable Client-Server ecosystem designed to deliver an uninterrupted, real-time community experience parallel to Discord. The goal is to replace legacy polling mechanisms with persistent WebSockets, guaranteeing sub-200ms latency and zero data loss. The architecture is engineered to seamlessly support 10,000+ concurrent active subscribers.

### Project Scope
**In-Scope (Phase 1 Deliverables):**
- Provisioning infrastructure for structural entities (Server Workspaces, Text Channels, Voice Channels) with zero page reloads (SPA).
- Sub-200ms real-time messaging engine driven by WebSocket protocols and a Spring Boot Message Broker.
- Robust authentication workflows utilizing stateless JWTs secured within HttpOnly cookies via Spring Security.
- Advanced UI optimizations leveraging React component re-rendering and Optimistic UI.
- Centralized data persistence ensuring ACID compliance via PostgreSQL.

**Out-of-Scope (Phase 1 Exclusions):**
- Complex automated Bot integrations and 3rd-party webhooks.
- Advanced WebRTC multiparty video conferencing routing.
- Custom animated Emoji processing pipelines.
</vision_and_scope>

<glossary>
## 3. Glossary
Standardized terminology to ensure strict alignment across BA, Dev, and QA teams:

- **Optimistic UI:** A frontend pattern where the client immediately renders an anticipated state (e.g., a sent message) to the user before receiving the network confirmation (ACK) from the server, hiding perceived latency.
- **WebSocket:** A communication protocol providing full-duplex, persistent channels over a single TCP connection. Replaces HTTP polling for low-latency real-time messaging.
- **SPA (Single Page Application):** A frontend implementation pattern (via ReactJS) that interacts with the user by dynamically rewriting the current DOM rather than loading entire new pages, eliminating F5 browser reloads.
- **JWT (JSON Web Token) / HttpOnly Cookie:** A secure standard for transmitting session claims. In LiveBox, JWTs are stored in HttpOnly cookies to mitigate Cross-Site Scripting (XSS) vulnerabilities.
- **ACID Compliance:** A set of database properties (Atomicity, Consistency, Isolation, Durability) ensuring reliable transaction processing and data integrity in PostgreSQL.
- **ACK (Acknowledgment):** A network signal confirming that a payload (like a chat message) was successfully received and persisted by the system.
- **DTO (Data Transfer Object):** An object that carries data between processes (e.g., from the Spring Boot Backend to the React Frontend) ensuring a strict API contract.
</glossary>

<output_rules>
## 4. Output Rules
Mandatory technical and architectural constraints that Development and QA teams must comply with during implementation:

1. **Backend Integration (Spring Boot / Java):** Strictly separate RESTful APIs from WebSocket streaming routes. All exceptions, especially 401 Unauthorized, must be gracefully intercepted and mapped to standardized error payloads rather than throwing server stack traces.
2. **Frontend Architecture (ReactJS / TypeScript):** The system must be written in TypeScript with strict typing. Forms or events that trigger full page reloads are strictly forbidden. Components must leverage SPA and Optimistic UI patterns to constrain observed latency under 200ms.
3. **Database Definition (PostgreSQL):** PostgreSQL acts as the Single Source of Truth. Strict referential integrity (foreign keys) and ACID compliance are mandatory for all core domain entities (Servers, Channels, Messages) to prevent data corruption.
4. **Security Enforcement:** JWT tokens must NEVER be stored in LocalStorage; they must be encapsulated securely in HttpOnly cookies. Backend user persistence requires BCrypt password hashing.
5. **Real-Time Standard:** Structural state mutations (like channel creation) must instantly broadcast to active subscribers without requiring an F5 refresh. The client application must feature robust auto-reconnect fallback logic to recover smoothly from network degradation.
</output_rules>
