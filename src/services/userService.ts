import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { User } from '../types';

export interface UpdateProfilePayload {
  display_name?: string;
  gender?: string;
  avatar_seed?: string;
  save_conversations?: boolean;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

const userService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await api.patch<User>(API_ENDPOINTS.USER_ME, payload);
    return response.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.patch(API_ENDPOINTS.USER_PASSWORD, payload);
  },
};

export default userService;
