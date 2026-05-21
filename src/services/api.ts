import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Refresh token queue — prevents multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth-storage');
  window.location.href = '/login';
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401) {
      // Never retry the refresh endpoint itself
      if (original.url?.includes('/auth/refresh')) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      if (!original._retry) {
        if (isRefreshing) {
          // Queue this request until the ongoing refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          });
        }

        original._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          clearAuthAndRedirect();
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });

          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);

          // Update Zustand store token without triggering a re-render loop
          const { useAuthStore } = await import('../store/authStore');
          useAuthStore.getState().setToken(data.access_token);

          api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
          processQueue(null, data.access_token);

          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearAuthAndRedirect();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (error.response?.status === 403) console.error('Forbidden:', error.response.data?.detail);
    if (error.response?.status === 500) console.error('Server error:', error.response.data?.detail);
    if (!error.response) console.error('Network error: Unable to reach server');

    return Promise.reject(error);
  },
);

export default api;
