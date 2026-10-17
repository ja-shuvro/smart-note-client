import { apiFetch } from './client';
import type { InterestGroup, UserWithPosts, Post } from '../types';

export const aggregationsApi = {
  // Scenario 1: Group by Interests
  getInterests: async () => {
    return apiFetch<InterestGroup[]>('/aggregations/interests');
  },

  // Scenario 2: User Posts ($lookup)
  getUserPosts: async (userId: string) => {
    return apiFetch<UserWithPosts>(`/aggregations/users/${userId}/posts`);
  },

  // Supporting posts
  createPost: async (title: string, content: string) => {
    return apiFetch<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  },

  getPosts: async (page = 1, limit = 10) => {
    return apiFetch<Post[]>('/posts', {
      params: { page, limit },
    });
  },
};
