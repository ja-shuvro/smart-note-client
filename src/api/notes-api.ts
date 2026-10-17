import { apiFetch } from './client';
import type { Note } from '../types';

export const notesApi = {
  getNotes: async (page = 1, limit = 10, all = false) => {
    return apiFetch<Note[]>('/notes', {
      params: {
        page,
        limit,
        ...(all ? { all: 'true' } : {}),
      },
    });
  },

  getNote: async (id: string) => {
    return apiFetch<Note>(`/notes/${id}`);
  },

  createNote: async (title: string, content: string) => {
    return apiFetch<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  },

  updateNote: async (id: string, data: { title?: string; content?: string }) => {
    return apiFetch<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteNote: async (id: string) => {
    return apiFetch<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};
