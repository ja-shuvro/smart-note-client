import { apiFetch } from './client';
import type { Post, PostStatus } from '../types';

export const postsApi = {
  getPosts: async (page = 1, limit = 10, status?: string) => {
    return apiFetch<Post[]>('/posts', {
      params: {
        page,
        limit,
        ...(status && status !== 'all' ? { status } : {}),
      },
    });
  },

  createPost: async (title: string, content: string, tags: string[] = []) => {
    return apiFetch<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, tags }),
    });
  },

  updateStatus: async (id: string, status: PostStatus) => {
    return apiFetch<Post>(`/posts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deletePost: async (id: string) => {
    return apiFetch<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};
