import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface AdminStats {
  users: { total: number; active: number; new_today: number };
  conversations: { total: number; today: number };
  messages: { total: number };
  documents: { total: number };
  tokens: { used_today: number; total_ever: number };
}

export interface RecentUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface RecentConversation {
  id: number;
  title: string;
  username: string;
  created_at: string;
}

export interface AdminActivity {
  recent_users: RecentUser[];
  recent_conversations: RecentConversation[];
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  gender?: string;
  avatar_seed?: string;
  is_active: boolean;
  created_at: string;
  roles: string[];
  conversations: number;
  tokens_used_today: number;
  total_tokens_used: number;
  documents?: number;
  messages?: number;
}

export interface UsersPage {
  total: number;
  page: number;
  limit: number;
  pages: number;
  users: AdminUser[];
}

const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_STATS);
    return data;
  },

  getActivity: async (): Promise<AdminActivity> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_ACTIVITY);
    return data;
  },

  getUsers: async (page = 1, limit = 20, search = ''): Promise<UsersPage> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_USERS, {
      params: { page, limit, search },
    });
    return data;
  },

  getUser: async (id: number): Promise<AdminUser> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_USER(id));
    return data;
  },

  toggleBan: async (id: number): Promise<{ id: number; is_active: boolean }> => {
    const { data } = await api.patch(API_ENDPOINTS.ADMIN_USER_BAN(id));
    return data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_USER(id));
  },
};

export default adminService;
