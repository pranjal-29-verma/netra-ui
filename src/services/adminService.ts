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
  daily_quota: number;
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

  updateQuota: async (userId: number, daily_quota: number): Promise<{ user_id: number; daily_quota: number }> => {
    const { data } = await api.patch(API_ENDPOINTS.ADMIN_USER_QUOTA(userId), { daily_quota });
    return data;
  },

  getRoles: async (): Promise<AdminRole[]> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_ROLES);
    return data;
  },

  getPermissions: async (): Promise<AdminPermission[]> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_PERMISSIONS);
    return data;
  },

  createRole: async (payload: { name: string; description: string; permission_ids: number[] }): Promise<AdminRole> => {
    const { data } = await api.post(API_ENDPOINTS.ADMIN_ROLES, payload);
    return data;
  },

  assignRoles: async (userId: number, roleIds: number[]): Promise<{ id: number; roles: string[] }> => {
    const { data } = await api.put(API_ENDPOINTS.ADMIN_USER_ROLES(userId), { role_ids: roleIds });
    return data;
  },

  getConversations: async (page = 1, limit = 20, search = ''): Promise<ConversationsPage> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_CONVERSATIONS, { params: { page, limit, search } });
    return data;
  },

  deleteConversation: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_CONVERSATION(id));
  },

  getDocuments: async (page = 1, limit = 20, search = ''): Promise<DocumentsPage> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_DOCUMENTS, { params: { page, limit, search } });
    return data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_DOCUMENT(id));
  },

  getRegistrationsTimeline: async (): Promise<DailyCount[]> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_ANALYTICS_REGISTRATIONS);
    return data;
  },

  getConversationsTimeline: async (): Promise<DailyCount[]> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_ANALYTICS_CONVERSATIONS);
    return data;
  },

  getTopUsers: async (): Promise<TopUser[]> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_ANALYTICS_TOP_USERS);
    return data;
  },
};

export interface AdminConversation {
  id: number;
  title: string;
  username: string;
  user_id: number;
  is_incognito: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationsPage {
  total: number;
  page: number;
  limit: number;
  pages: number;
  conversations: AdminConversation[];
}

export interface AdminDocument {
  id: number;
  filename: string;
  file_type: string;
  file_size?: number;
  status: string;
  scope: string;
  source_url?: string;
  username: string;
  user_id: number;
  created_at: string;
}

export interface DocumentsPage {
  total: number;
  page: number;
  limit: number;
  pages: number;
  documents: AdminDocument[];
}

export interface AdminPermission {
  id: number;
  name: string;
  description?: string;
}

export interface AdminRole {
  id: number;
  name: string;
  description?: string;
  permissions: AdminPermission[];
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface TopUser {
  username: string;
  total_tokens: number;
  today_tokens: number;
}

export default adminService;
