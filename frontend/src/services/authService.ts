import api from './api';
import { LoginResponse, UserProfile } from '../types/auth';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/equipment/auth/login', { username, password });
    if (response.data?.token) {
      localStorage.setItem('farmverse_token', response.data.token);
      localStorage.setItem('farmverse_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await api.get('/api/equipment/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('farmverse_token');
    localStorage.removeItem('farmverse_user');
  },
};

