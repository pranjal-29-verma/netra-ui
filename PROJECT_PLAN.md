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
│   │   └── common/             # Button, Input
│   ├── pages/                  # Login, Register, Dashboard
│   ├── services/               # api.ts (axios + refresh interceptor), authService, documentService
│   ├── store/                  # authStore, chatStore, tokenStore, documentStore, themeStore
│   ├── types/index.ts
│   ├── config/api.ts           # API endpoint constants
│   ├── App.tsx                 # Theme wiring
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
- Refresh token interceptor with concurrent-request queue (breaks circular dep via dynamic import)
- Chat input footer dark background fix
- Daily token quota + access token expiry configurable from `.env`
- Gen-Z IST quota exhaustion message

---

## Pending Enhancements & Bugs

| # | Item | Type | Status |
|---|------|------|--------|
| E1 | User message bubble + avatar CSS mismatch vs AI side | Bug | Pending |
| E2 | Search conversations / messages | Enhancement | Pending |
| E3 | Profile settings in Settings modal | Enhancement | Flow TBD |
| E4 | Payment gateway integration | Enhancement | Flow TBD |
| E5 | Mobile responsive collapsible sidebar | Enhancement | Pending |
| E6a | Skeleton loader — conversation list | Enhancement | Pending |
| E6b | Skeleton loader — messages (no flash of empty state) | Bug fix | Pending |
| E6c | Skeleton loader — token usage bar | Enhancement | Pending |
| E7 | Claude-style settings page per user (verify with user first) | Enhancement | Flow TBD |

---

## Phase 5: Admin Panel (Upcoming)

Deliberately deferred — requires encrypted key storage, admin auth, and 6–8 new components:

- Admin role + protected admin routes
- Model & API key config from UI (stored encrypted in DB)
- Per-user token quota management by admin
- All users share the admin-configured model
- Admin dashboard: user list, usage stats

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
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
DEFAULT_DAILY_TOKEN_QUOTA=100000
```

---

## Progress

**Current Status:** All 16 iterations complete. Working on enhancements before Phase 5.

| Feature | Status |
|---------|--------|
| Project Setup + Auth UI | ✅ Done |
| Auth Backend Integration | ✅ Done |
| Auth Integration | ✅ Done |
| Google OAuth | ✅ Done |
| Chat UI | ✅ Done |
| Chat Backend Integration | ✅ Done |
| Token Management | ✅ Done |
| Incognito Mode (real LLM) | ✅ Done |
| Document Upload | ✅ Done |
| Vector DB (pgvector + Voyage AI) | ✅ Done |
| LLM Integration / RAG / Streaming | ✅ Done |
| Dark Mode + Settings + Refresh Token | ✅ Done |
| Enhancements E1–E7 | 🔜 In Progress |
| Phase 5: Admin Panel | ⏳ Pending |

---

**Last Updated:** Iteration 16 complete — starting enhancements E1–E7
