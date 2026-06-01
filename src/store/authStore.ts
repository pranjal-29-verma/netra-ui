import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';
import authService from '../services/authService';
import { useThemeStore, applyTheme } from './themeStore';

function syncTheme(user: User) {
  const theme = user.theme ?? 'system';
  useThemeStore.getState().syncFromUser(theme);
  applyTheme(theme);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token });
      },

      login: async (email: string, password: string) => {
        try {
          const response = await authService.login({ email, password });
          syncTheme(response.user);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.detail || 'Login failed');
        }
      },

      loginWithGoogle: async (credential: string) => {
        try {
          const response = await authService.googleLogin(credential);
          syncTheme(response.user);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.detail || 'Google login failed');
        }
      },

      register: async (username: string, email: string, password: string, gender?: string) => {
        try {
          await authService.register({ username, email, password, gender: gender || 'other' });
        } catch (error: any) {
          throw new Error(error.response?.data?.detail || 'Registration failed');
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      refreshUser: async () => {
        try {
          const user = await authService.getCurrentUser();
          set({ user });
        } catch {
          // silently ignore — stale data is better than logging the user out
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);