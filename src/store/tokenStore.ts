import { create } from 'zustand';
import type { TokenState } from '../types';
import tokenService from '../services/tokenService';

export const useTokenStore = create<TokenState>((set) => ({
  usage: null,

  fetchUsage: async () => {
    const usage = await tokenService.getUsage();
    set({ usage });
  },
}));
