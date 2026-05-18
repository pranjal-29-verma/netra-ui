import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { User } from '../types';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>(API_ENDPOINTS.REGISTER, data);
    return response.data;
  }

  /**
   * Login user and get tokens
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.LOGIN, data);
    
    // Store tokens in localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.ME);
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export default new AuthService();