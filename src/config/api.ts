export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  GOOGLE_AUTH: '/api/auth/google',
  ME: '/api/auth/me',

  // Conversation endpoints
  CONVERSATIONS: '/api/conversations',
  CONVERSATION: (id: number) => `/api/conversations/${id}`,
  MESSAGES: (id: number) => `/api/conversations/${id}/messages`,
  MESSAGES_STREAM: (id: number) => `/api/conversations/${id}/messages/stream`,
  CHAT_STREAM: '/api/chat/stream',

  // Token endpoints
  TOKEN_USAGE: '/api/tokens/usage',

  // User endpoints
  USER_ME: '/api/users/me',
  USER_PASSWORD: '/api/users/me/password',

  // Admin endpoints
  ADMIN_ME: '/api/admin/me',

  // Document endpoints
  DOCUMENTS: '/api/documents',
  DOCUMENT_UPLOAD: '/api/documents/upload',
  DOCUMENT_URL: '/api/documents/url',
  DOCUMENT: (id: number) => `/api/documents/${id}`,
};