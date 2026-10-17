export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  user: string | { _id: string; name: string; email: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  authorId: string | { _id: string; name: string; email: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface InterestGroup {
  interest: string;
  count: number;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

export interface UserWithPosts extends User {
  totalPosts: number;
  posts: Post[];
}
