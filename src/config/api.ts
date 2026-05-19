export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  GOOGLE_AUTH: '/api/auth/google',
  ME: '/api/auth/me',
  
  // Will add more endpoints in future iterations
  // CONVERSATIONS: '/api/conversations',
  // MESSAGES: '/api/messages',
  // DOCUMENTS: '/api/documents',
};