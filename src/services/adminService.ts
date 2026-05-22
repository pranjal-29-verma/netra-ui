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

const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_STATS);
    return data;
  },

  getActivity: async (): Promise<AdminActivity> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_ACTIVITY);
    return data;
  },
};

export default adminService;
