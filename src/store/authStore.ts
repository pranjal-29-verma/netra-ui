import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';
import authService from '../services/authService';

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
          set({ 
            user: response.user, 
            token: response.access_token, 
            isAuthenticated: true 
          });
        } catch (error: any) {
          // Re-throw error to be handled by component
          throw new Error(error.response?.data?.detail || 'Login failed');
        }
      },

      loginWithGoogle: async (credential: string) => {
        try {
          const response = await authService.googleLogin(credential);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.detail || 'Google login failed');
        }
      },

      register: async (username: string, email: string, password: string) => {
        try {
          await authService.register({ username, email, password });
          // Don't auto-login after registration, redirect to login page
        } catch (error: any) {
          throw new Error(error.response?.data?.detail || 'Registration failed');
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