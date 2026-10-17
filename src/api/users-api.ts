import { apiFetch } from './client';
import type { User, UserRole } from '../types';

export const usersApi = {
  getUsers: async (page = 1, limit = 10) => {
    return apiFetch<User[]>('/users', {
      params: { page, limit },
    });
  },

  getUser: async (id: string) => {
    return apiFetch<User>(`/users/${id}`);
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    interests: string[];
  }) => {
    return apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (
    id: string,
    data: { name?: string; role?: UserRole; interests?: string[] }
  ) => {
    return apiFetch<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string) => {
    return apiFetch<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
