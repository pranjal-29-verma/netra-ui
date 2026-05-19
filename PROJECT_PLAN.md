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

## 📋 Completed Features (Iteration 1-5)

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
- 401 auto-logout

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
- Mock data integration

**Key Files:**
- `src/components/chat/*` - All chat components
- `src/store/chatStore.ts` - Chat state management
- `src/pages/Dashboard.tsx` - Main chat page

---

## 🔜 Upcoming Features

### Iteration 6-7: Chat Backend Integration
- Connect to real chat API
- Load conversations from backend
- Persist messages
- Create/delete conversations

### Iteration 8-9: Token Management
- Token usage display
- Daily quota tracking
- Warning notifications
- Usage per message

### Iteration 10-11: Incognito Mode
- Toggle incognito mode
- Visual indicators
- Session-based chats
- No persistence

### Iteration 12-13: Document Upload
- File upload UI
- URL input
- Document list
- Progress indicators

### Iteration 14-15: LLM Integration
- Streaming responses
- Source citations
- Context from documents
- Real-time updates

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

**Current Iteration:** 5/16 (31% complete)

| Feature | Status | Iteration |
|---------|--------|-----------|
| Project Setup | ✅ Done | 1 |
| Auth UI | ✅ Done | 1 |
| Auth Backend | ✅ Done | 2 |
| Auth Integration | ✅ Done | 3 |
| Google OAuth | ✅ Done | 4 |
| Chat UI | ✅ Done | 5 |
| Chat Backend | 🔜 Next | 6 |
| Chat Integration | ⏳ Pending | 7 |
| Token UI | ⏳ Pending | 8 |
| Token Backend | ⏳ Pending | 9 |
| Incognito UI | ⏳ Pending | 10 |
| Incognito Backend | ⏳ Pending | 11 |
| Document Upload | ⏳ Pending | 12-13 |
| LLM Integration | ⏳ Pending | 14-15 |
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

**Last Updated:** Iteration 5 Completed  
**Next Update:** After Iteration 6 (Chat Backend Integration)
