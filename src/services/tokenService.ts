import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { TokenUsage } from '../types';

const tokenService = {
  async getUsage(): Promise<TokenUsage> {
    const response = await api.get<TokenUsage>(API_ENDPOINTS.TOKEN_USAGE);
    return response.data;
  },
};

export default tokenService;
