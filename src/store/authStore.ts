import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
      },

      login: async (email: string, password: string) => {
        // This will be implemented when we connect to backend
        console.log('Login:', email, password);
        // Placeholder for now
        throw new Error('Backend not connected yet');
      },

      register: async (username: string, email: string, password: string) => {
        // This will be implemented when we connect to backend
        console.log('Register:', username, email, password);
        throw new Error('Backend not connected yet');
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);