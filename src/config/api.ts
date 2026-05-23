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
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_ACTIVITY: '/api/admin/activity',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER: (id: number) => `/api/admin/users/${id}`,
  ADMIN_USER_BAN: (id: number) => `/api/admin/users/${id}/ban`,
  ADMIN_USER_ROLES: (id: number) => `/api/admin/users/${id}/roles`,
  ADMIN_ROLES: '/api/admin/roles',
  ADMIN_PERMISSIONS: '/api/admin/permissions',
  ADMIN_CONVERSATIONS: '/api/admin/conversations',
  ADMIN_CONVERSATION: (id: number) => `/api/admin/conversations/${id}`,
  ADMIN_DOCUMENTS: '/api/admin/documents',
  ADMIN_DOCUMENT: (id: number) => `/api/admin/documents/${id}`,
  ADMIN_ANALYTICS_REGISTRATIONS: '/api/admin/analytics/registrations',
  ADMIN_ANALYTICS_CONVERSATIONS: '/api/admin/analytics/conversations',
  ADMIN_ANALYTICS_TOP_USERS: '/api/admin/analytics/top-users',

  // Document endpoints
  DOCUMENTS: '/api/documents',
  DOCUMENT_UPLOAD: '/api/documents/upload',
  DOCUMENT_URL: '/api/documents/url',
  DOCUMENT: (id: number) => `/api/documents/${id}`,
};