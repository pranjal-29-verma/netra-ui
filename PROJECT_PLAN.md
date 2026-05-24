# Netra Chatbot - Frontend Project Plan

## Project Overview

**Project Name:** Netra Chatbot Frontend  
**Description:** React-based chat interface for personal knowledge chatbot  
**Tech Stack:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS v3 (styling, darkMode: 'class')
- Zustand v5 (state management)
- Axios (HTTP client)
- React Router (routing)
- TanStack React Query v5 (server state management)
- react-markdown + remark-gfm (markdown rendering)
- react-hot-toast (notifications)

---

## Development Workflow (AI_CODE_CLI_RULES.md)

Before every task:
1. `git checkout main && git fetch origin && git pull origin main`
2. `git checkout -b <feature|bugfix|hotfix|refactor>/<name>`
3. Implement changes
4. Show modified files + summary → ask user before committing
5. Commit format:
```
<TicketNo> : One line summary

What is changed?
--------------
- list of changes

Testing
--------------
- testing performed
```
Never commit directly to main. Never push without explicit user approval.

---

## Project Structure

```
netra-ui/
├── src/
│   ├── components/
│   │   ├── auth/               # LoginForm, RegisterForm, AuthLayout
│   │   ├── chat/               # ChatLayout, ChatArea, ChatInput, Message,
│   │   │                       # ConversationList, DocumentPanel,
│   │   │                       # TokenUsageBar, SettingsModal
│   │   ├── admin/              # AdminLayout, AdminRoute
│   │   └── settings/           # AppearanceSettings, ProfileSettings, etc.
│   ├── pages/                  # Login, Register, Dashboard, Settings
│   │   └── admin/              # AdminDashboard, AdminUsers, AdminRoles,
│   │                           # AdminContent, AdminAnalytics, AdminModels
│   ├── services/               # api.ts, authService, userService,
│   │                           # adminService, llmConfigService
│   ├── store/                  # authStore, chatStore, themeStore
│   ├── hooks/                  # useAdminQueries, useDocuments, useTokenUsage
│   ├── types/index.ts
│   ├── config/api.ts           # API endpoint constants
│   ├── App.tsx
│   └── index.css
├── tailwind.config.js          # darkMode: 'class', primary palette
├── AI_CODE_CLI_RULES.md
└── PROJECT_PLAN.md
```

---

## Completed Iterations

### ✅ Iteration 1: Project Setup & Auth UI
- React + TypeScript + Vite + Tailwind CSS
- Login / Register pages with validation
- Protected routes, Zustand store structure

### ✅ Iteration 2: Authentication Backend Integration
- Backend only (no frontend changes)

### ✅ Iteration 3: Connect Auth to Backend
- Axios instance with interceptors
- Auth service layer, JWT token management
- Toast notifications, 401 auto-logout

### ✅ Iteration 4: Google OAuth
- Google OAuth provider, one-click login
- Auto account creation

### ✅ Iteration 5: Chat Interface UI
- Chat layout with sidebar, conversation list
- Message components, auto-resize textarea
- Markdown rendering, copy button, empty states

### ✅ Iteration 6–7: Chat Backend Integration
- Real conversation CRUD (create, list, delete)
- Message persistence and history loading
- Auto-focus textarea on send

### ✅ Iteration 8–9: Token Management
- `GET /api/tokens/usage` polled after each message
- `TokenUsageBar` in sidebar: used / quota / percentage
- Input disabled when daily quota exhausted

### ✅ Iteration 10–11: Incognito Mode
- Negative-ID local conversations (never sent to API)
- Real LLM via stateless `/api/chat/stream` endpoint (no DB writes)
- Message history sent with each request for multi-turn context
- Purple incognito banner; conversations lost on refresh

### ✅ Iteration 12–13: Document Upload
- Drag-and-drop file upload (PDF, TXT, DOCX, MD · 20 MB max)
- URL input for web links
- Document scope: Knowledge Base (global) vs This Chat (conversation-scoped)
- Status badges: Ready / Processing / Failed
- Delete on hover

### ✅ Iteration 14: Vector Database Integration
- pgvector on Supabase
- Voyage AI embeddings
- Similarity search integrated into RAG pipeline

### ✅ Iteration 15: LLM Integration (RAG + Streaming)
- SSE streaming via `StreamingResponse` (backend) + `ReadableStream` (frontend)
- Streaming cursor + WhatsApp-style typing indicator
- Stop streaming button (AbortController)
- Source citations below assistant messages (deduplicated by document_id)
- URL sources as clickable links with URL shown on hover
- Real token count in message metadata
- LiteLLM backend — switch provider via `LLM_MODEL` in `.env`
- Error SSE event handling (rate limit, quota exhaustion)

### ✅ Iteration 16: Dark Mode, Settings, Refresh Token Renewal
- Dark / Light / System theme toggle with persisted `themeStore`
- System mode follows OS preference via `matchMedia` listener
- Theme moved into `SettingsModal` (gear icon in sidebar footer)
- Refresh token interceptor with concurrent-request queue
- Daily token quota + access token expiry configurable from `.env`

---

## Enhancements & Bugs (E-Series)

| # | Item | Type | Status |
|---|------|------|--------|
| E1 | User message bubble + avatar CSS mismatch vs AI side | Bug | ✅ Done |
| E2 | Search conversations / messages | Enhancement | ✅ Done |
| E3 | Profile settings — covered by E7 | Enhancement | ✅ Done (via E7) |
| E4 | Payment gateway integration | Enhancement | ⏳ Phase 7 |
| E5 | Mobile responsive collapsible sidebar | Enhancement | ✅ Done |
| E6a | Skeleton loader — conversation list | Enhancement | ✅ Done |
| E6b | Skeleton loader — messages (no flash of empty state) | Bug fix | ✅ Done |
| E6c | Skeleton loader — token usage bar | Enhancement | ✅ Done |
| E7 | Dedicated settings page: profile, avatar, appearance, privacy | Enhancement | ✅ Done |

---

## Phase 5: Admin Panel ✅ Complete

Full RBAC (Role-Based Access Control) foundation + admin UI.

### RBAC Data Model
```
roles              → id, name, description
permissions        → id, name (e.g. "users:delete", "analytics:view")
role_permissions   → role_id, permission_id
user_roles         → user_id, role_id
```

| # | Item | Status |
|---|------|--------|
| P5.1 | RBAC foundation — tables, migration, backend permission guard, seed data | ✅ Done |
| P5.2 | Admin layout & auth — `/admin` route, sidebar nav, permission-aware menu | ✅ Done |
| P5.3 | Overview dashboard — stats cards, recent activity | ✅ Done |
| P5.4 | User management — list, search, ban/unban, delete | ✅ Done |
| P5.5 | Role assignment UI — assign/revoke roles to users, view role permissions | ✅ Done |
| P5.6 | Content oversight — conversation metadata (no message content, privacy), documents | ✅ Done |
| P5.7 | Analytics — token usage charts, active users, top consumers (Recharts) | ✅ Done |
| P5.8 | Theme persistence — sync theme with DB on login and settings change | ✅ Done |

---

## Phase 6: Admin Panel Completion ⬅️ Current

Complete the admin panel story with accountability, per-user control, and communication tools.

| # | Item | Priority | Status |
|---|------|----------|--------|
| P6.1 | LLM model config — encrypted storage, in-memory cache, admin Models page | High | ✅ Done |
| P6.2 | Audit logs — track admin actions (ban, delete, model change, role assign) | High | 🔲 Todo |
| P6.3 | Token quota per user — admin overrides individual user daily quota | High | 🔲 Todo |
| P6.4 | System announcements — admin broadcasts banner message to all users | Low | 🔲 Todo |

---

## Phase 7: Production Readiness

Harden the platform before monetization and wider rollout.

| # | Item | Priority | Status |
|---|------|----------|--------|
| P7.1 | Notifications — admin alerts (model key expired, quota breach) + user-facing | Medium | 🔲 Todo |
| P7.2 | Email verification — confirm email before allowing login | Medium | 🔲 Todo |
| P7.3 | Payment gateway (E4) — Stripe integration, plan tiers, model gating | Medium | 🔲 Todo |
| P7.4 | Rate limiting — per-user request throttling at API level | Medium | 🔲 Todo |

---

## Phase 8: User Experience Polish

Quality-of-life improvements based on real usage.

| # | Item | Priority | Status |
|---|------|----------|--------|
| P8.1 | Conversation export — download as PDF or Markdown | Medium | 🔲 Todo |
| P8.2 | Chat history search — full-text search inside message content | Medium | 🔲 Todo |
| P8.3 | Model usage analytics — usage per model, cost estimation per provider | Low | 🔲 Todo |
| P8.4 | Message feedback — thumbs up/down on AI responses | Low | 🔲 Todo |
| P8.5 | Conversation sharing — public read-only link | Low | 🔲 Todo |
| P8.6 | Document summarization — auto-summary on upload | Low | 🔲 Todo |
| P8.7 | Two-factor authentication (2FA) — TOTP-based | Low | 🔲 Todo |
| P8.8 | Code optimization — profile and optimize based on real usage data | Low | 🔲 Todo (last) |

---

## Environment Variables

**netra-ui `.env`:**
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**netra-app `.env`:**
```env
LLM_MODEL=gemini/gemini-2.0-flash
GEMINI_API_KEY=...
VOYAGE_API_KEY=...
DATABASE_URL=...
SECRET_KEY=...
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
DEFAULT_DAILY_TOKEN_QUOTA=100000
LLM_ENCRYPTION_KEY=...
```

---

## Progress Summary

| Phase | Description | Status |
|-------|-------------|--------|
| Iterations 1–16 | Core chat, auth, documents, tokens, streaming | ✅ Done |
| Enhancements E1–E7 | UI/UX bug fixes and improvements | ✅ Done |
| Phase 5 | Admin panel — RBAC, users, roles, content, analytics, theme | ✅ Done |
| Phase 6 | Admin panel completion — LLM config, audit logs, quotas, announcements | 🔄 In Progress |
| Phase 7 | Production readiness — notifications, email, payments, rate limiting | 🔲 Todo |
| Phase 8 | UX polish — export, search, feedback, sharing, 2FA, optimization | 🔲 Todo |

---

**Last Updated:** Phase 6 in progress — P6.1 (LLM model config) complete. Next: P6.2 Audit Logs.
