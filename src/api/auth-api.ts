import { apiFetch } from './client';
import type { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string) => {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string, interests: string[]) => {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, interests }),
    });
  },

  getMe: async () => {
    return apiFetch<User>('/auth/me');
  },
};
