# Netra Chatbot - Frontend Project Plan

## 🎯 Project Overview

**Project Name:** Netra Chatbot Frontend  
**Description:** React-based chat interface for personal knowledge chatbot  
**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- Axios (HTTP client)
- React Router (routing)

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "zustand": "^4.x",
  "axios": "^1.x",
  "lucide-react": "^0.x"
}
```

### Auth & OAuth
```json
{
  "@react-oauth/google": "^0.x",
  "react-hot-toast": "^2.x"
}
```

### Styling
```json
{
  "tailwindcss": "^3.x",
  "autoprefixer": "^10.x",
  "postcss": "^8.x"
}
```

### Markdown & Rich Text
```json
{
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x",
  "rehype-highlight": "^7.x"
}
```

---

## 🗂️ Project Structure
netra-ui/
├── public/                        # Static assets
├── src/
│   ├── components/
│   │   ├── auth/                  # Authentication components
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── chat/                  # Chat interface components
│   │   │   ├── ChatLayout.tsx
│   │   │   ├── ChatArea.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── Message.tsx
│   │   │   └── ConversationList.tsx
│   │   └── common/                # Reusable components
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── api.ts                 # Axios instance
│   │   └── authService.ts         # Auth API calls
│   ├── store/
│   │   ├── authStore.ts           # Auth state
│   │   └── chatStore.ts           # Chat state
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── config/
│   │   └── api.ts                 # API configuration
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── .env                           # Environment variables
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json

---

## 🎨 Design System

### Colors
```css
Primary: #0284c7 (Sky Blue)
Primary Hover: #0369a1
Success: #10b981 (Green)
Error: #ef4444 (Red)
Warning: #f59e0b (Amber)
Background: #f9fafb (Gray 50)
```

### Component Classes
```css
.btn-primary         - Primary button style
.btn-secondary       - Secondary button style
.input-field         - Input field style
.card                - Card container
```

---

## 📋 Completed Features (Iteration 1-13)

### ✅ Iteration 1: Project Setup & Auth UI
- React + TypeScript + Vite setup
- Tailwind CSS configuration
- Login page with validation
- Registration page
- Protected routes
- Zustand store structure

### ✅ Iteration 2: Authentication Backend Integration
- (No frontend changes - backend only)

### ✅ Iteration 3: Connect Auth to Backend
- Axios instance with interceptors
- Auth service layer
- Real API integration
- JWT token management
- Toast notifications
- Error handling
- 401 auto-logout (clears Zustand persist key to prevent re-hydration loop)

**Key Files:**
- `src/services/api.ts` - Axios config
- `src/services/authService.ts` - Auth API
- `src/store/authStore.ts` - Updated with real API

### ✅ Iteration 4: Google OAuth
- Google OAuth provider setup
- Google login button
- One-click authentication
- Auto account creation

**Key Files:**
- `src/main.tsx` - Wrapped with GoogleOAuthProvider
- `src/components/auth/LoginForm.tsx` - Google button logic

### ✅ Iteration 5: Chat Interface UI
- Chat layout with sidebar
- Conversation list
- Message components
- Chat input with auto-resize
- Markdown rendering
- Copy message functionality
- Empty states

**Key Files:**
- `src/components/chat/*` - All chat components
- `src/store/chatStore.ts` - Chat state management
- `src/pages/Dashboard.tsx` - Main chat page

### ✅ Iteration 6-7: Chat Backend Integration
- Real conversation CRUD (create, list, delete)
- Message persistence and history loading
- `sendMessage` hits `POST /api/conversations/{id}/messages`
- Auto-focus on textarea on dashboard load and after every send
- Single JSX return branch in ChatArea to prevent ChatInput remount/focus loss

**Key Files:**
- `src/store/chatStore.ts` - Full API-connected store
- `src/components/chat/ChatArea.tsx` - Single-branch render
- `src/components/chat/ChatInput.tsx` - autoFocus + refocus after send

### ✅ Iteration 8-9: Token Management
- `GET /api/tokens/usage` polled after each message
- `TokenUsageBar` in sidebar showing used / quota / percentage
- Input disabled when daily quota exhausted

**Key Files:**
- `src/store/tokenStore.ts`
- `src/components/chat/ConversationList.tsx` - TokenUsageBar rendered here

### ✅ Iteration 10-11: Incognito Mode
- Frontend-only incognito (no backend involvement)
- Negative-ID local conversations (never sent to API)
- Subtle purple indicator strip instead of dark theme
- New Chat button hidden in incognito; users type to auto-create chat
- `toggleIncognito` in chatStore preserves real conversations in list

**Key Files:**
- `src/store/chatStore.ts` - `buildLocalConversation`, `isIncognito`, `toggleIncognito`
- `src/components/chat/ConversationList.tsx` - Purple indicator, hidden new-chat button
- `src/components/chat/ChatArea.tsx` - Incognito banner

### ✅ Iteration 12-13: Document Upload
- Drag-and-drop file upload (PDF, TXT, DOCX, MD · 20 MB max)
- URL input for web links
- Document scope: **Knowledge Base** (global) vs **This Chat** (conversation-scoped)
- Scope selector toggle in DocumentPanel
- Scope badge on each document (Global / Conversation)
- `GET /api/documents?conversation_id=` fetches global + scoped docs for current chat
- Documents panel opens via paperclip button in ChatInput
- Status badges: Ready / Processing / Failed
- Delete on hover (removes from Supabase Storage + DB)
- Warning shown when "This Chat" scope selected but no conversation open

**Key Files:**
- `src/components/chat/DocumentPanel.tsx` - Full document UI
- `src/services/documentService.ts` - API calls with scope params
- `src/store/documentStore.ts` - Document state
- `src/types/index.ts` - Document interface with scope & conversation_id

---

## 🔜 Upcoming Features

### Iteration 14: Vector Database Integration
- ChromaDB setup
- Document embedding generation
- Vector storage and similarity search

### Iteration 15: LLM Integration (RAG + Streaming)
- Claude API integration
- Retrieval-Augmented Generation from uploaded documents
- Streaming responses (WebSocket or SSE)
- Source citations in messages

### Iteration 16: Polish & Bug Fixes
- Error handling improvements
- UI/UX polish
- Performance optimization

---

## 🔐 Environment Variables

**`.env` file:**
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🐛 Technical Notes & Fixes

### Issue 1: TypeScript Import Error
**Problem:** Importing `InternalAxiosRequestConfig` as value causes runtime error  
**Solution:** Use `import type { InternalAxiosRequestConfig }`  
**Affected:** `src/services/api.ts`

```typescript
// ❌ Wrong
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ✅ Correct
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
```

### Issue 2: react-hot-toast API
**Problem:** `toast.info()` doesn't exist  
**Solution:** Use `toast()`, `toast.success()`, or `toast.error()`

```typescript
// ❌ Wrong
toast.info('Message');

// ✅ Correct
toast('Message');
toast.success('Success message');
toast.error('Error message');
```

### Issue 3: Tailwind v4 vs v3
**Problem:** Tailwind v4 has breaking changes  
**Solution:** Use Tailwind v3 for stability  
**Command:** `npm install -D tailwindcss@^3`

---

## 🎯 Component Guidelines

### Import Order
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// 3. Internal components
import { Button } from '../common/Button';

// 4. Stores & services
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/authService';

// 5. Types (with 'type' keyword)
import type { User } from '../../types';
```

### Type Imports
Always use `import type` for TypeScript types:
```typescript
import type { User, Message, Conversation } from '../types';
```

### Component Structure
```typescript
interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState();
  const navigate = useNavigate();
  
  // 2. Event handlers
  const handleClick = () => {};
  
  // 3. Effects
  useEffect(() => {}, []);
  
  // 4. Render
  return <div>...</div>;
};
```

---

## 🧪 Testing Strategy (To be implemented)

### Unit Tests
- Component rendering
- User interactions
- State management

### Integration Tests
- API calls
- Form submissions
- Navigation flows

### E2E Tests
- Complete user journeys
- Authentication flow
- Chat functionality

---

## 📊 Progress Tracking

**Current Iteration:** 13/16 (81% complete)

| Feature | Status | Iteration |
|---------|--------|-----------|
| Project Setup | ✅ Done | 1 |
| Auth UI | ✅ Done | 1 |
| Auth Backend | ✅ Done | 2 |
| Auth Integration | ✅ Done | 3 |
| Google OAuth | ✅ Done | 4 |
| Chat UI | ✅ Done | 5 |
| Chat Backend | ✅ Done | 6 |
| Chat Integration | ✅ Done | 7 |
| Token UI | ✅ Done | 8 |
| Token Backend | ✅ Done | 9 |
| Incognito Mode | ✅ Done | 10-11 |
| Document Upload | ✅ Done | 12-13 |
| Vector DB | 🔜 Next | 14 |
| LLM Integration (RAG) | ⏳ Pending | 15 |
| Polish | ⏳ Pending | 16 |

---

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run linter (when configured)
npm run lint

# Run tests (when configured)
npm test
```

---

## 🎨 UI/UX Guidelines

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile

### Accessibility
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader friendly

### Performance
- Code splitting with React.lazy()
- Image optimization
- Debounced search inputs
- Virtualized lists for long conversations

---

## 📚 Resources

- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Zustand:** https://github.com/pmndrs/zustand
- **React Router:** https://reactrouter.com/

---

**Last Updated:** Iteration 13 Completed  
**Next Update:** After Iteration 14 (Vector DB Integration)
