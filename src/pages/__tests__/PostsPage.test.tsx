import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostsPage } from '../PostsPage';
import { aggregationsApi } from '../../api/aggregations-api';
import { postsApi } from '../../api/posts-api';
import { usersApi } from '../../api/users-api';
import { aiApi } from '../../api/ai-api';
import * as AuthContextModule from '../../context/auth-context';
import type { UserWithPosts, User } from '../../types';

vi.mock('../../api/aggregations-api', () => ({
  aggregationsApi: {
    getUserPosts: vi.fn(),
  },
}));

vi.mock('../../api/posts-api', () => ({
  postsApi: {
    getPosts: vi.fn(),
    createPost: vi.fn(),
    updateStatus: vi.fn(),
    deletePost: vi.fn(),
  },
}));

vi.mock('../../api/users-api', () => ({
  usersApi: {
    getUsers: vi.fn(),
  },
}));

vi.mock('../../api/ai-api', () => ({
  aiApi: {
    suggestTags: vi.fn(),
  },
}));

const mockUser: User = {
  _id: 'u1',
  name: 'Alice Cooper',
  email: 'alice@example.com',
  role: 'user',
  interests: ['technology', 'art'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockUserWithPosts: UserWithPosts = {
  ...mockUser,
  totalPosts: 2,
  posts: [
    {
      _id: 'p1',
      title: 'Pending Architecture Note',
      content: 'Under review by platform moderators.',
      authorId: 'u1',
      status: 'pending',
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
    {
      _id: 'p2',
      title: 'Approved MongoDB Pipeline Post',
      content: 'This post is approved and publicly visible.',
      authorId: 'u1',
      status: 'approved',
      createdAt: '2026-03-02T12:00:00.000Z',
      updatedAt: '2026-03-02T12:00:00.000Z',
    },
  ],
};

describe('PostsPage Component - Business Approval Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersApi.getUsers).mockResolvedValue({
      success: true,
      message: 'Users retrieved',
      data: [mockUser],
    });
    vi.mocked(aggregationsApi.getUserPosts).mockResolvedValue({
      success: true,
      message: 'User posts aggregated',
      data: mockUserWithPosts,
    });
    vi.mocked(postsApi.getPosts).mockResolvedValue({
      success: true,
      message: 'Posts retrieved',
      data: mockUserWithPosts.posts,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  });

  it('should render posts with status badges for standard user without approval action buttons', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      token: 'jwt-user',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<PostsPage />);

    await waitFor(() => {
      expect(screen.getByText('Pending Architecture Note')).toBeInTheDocument();
      expect(screen.getByText('Pending Approval')).toBeInTheDocument();
      expect(screen.getByText('Approved MongoDB Pipeline Post')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    // Standard user should not see moderation buttons
    expect(screen.queryByRole('button', { name: /^approve$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^reject$/i })).not.toBeInTheDocument();
  });

  it('should display Approve button for admin and trigger status update on click', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { ...mockUser, role: 'admin' },
      token: 'jwt-admin',
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(postsApi.updateStatus).mockResolvedValueOnce({
      success: true,
      message: 'Post status updated to approved',
      data: { ...mockUserWithPosts.posts[0], status: 'approved' },
    });

    render(<PostsPage />);

    await waitFor(() => {
      expect(screen.getByText('Pending Architecture Note')).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole('button', { name: /^approve$/i });
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(postsApi.updateStatus).toHaveBeenCalledWith('p1', 'approved');
    });
  });

  it('should allow user to create post which triggers postsApi.createPost', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      token: 'jwt-user',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(postsApi.createPost).mockResolvedValueOnce({
      success: true,
      message: 'Post submitted successfully',
      data: {
        _id: 'p3',
        title: 'Fresh Post Submission',
        content: 'Content awaiting admin signoff',
        authorId: 'u1',
        status: 'pending',
        createdAt: '2026-03-03T10:00:00Z',
        updatedAt: '2026-03-03T10:00:00Z',
      },
    });

    render(<PostsPage />);

    await waitFor(() => {
      expect(screen.getByText('Pending Architecture Note')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /new post/i }));

    const titleInput = screen.getByPlaceholderText('e.g. Indexing vs Aggregation in MongoDB');
    const contentInput = screen.getByPlaceholderText('Write the public post content here...');
    const submitBtn = screen.getByRole('button', { name: 'Publish Post' });

    fireEvent.change(titleInput, { target: { value: 'Fresh Post Submission' } });
    fireEvent.change(contentInput, { target: { value: 'Content awaiting admin signoff' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(postsApi.createPost).toHaveBeenCalledWith(
        'Fresh Post Submission',
        'Content awaiting admin signoff'
      );
    });
  });

  it('should send tags when provided in new post modal and toggle tabs', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      token: 'jwt-user',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(postsApi.createPost).mockResolvedValueOnce({
      success: true,
      message: 'Post created with tags',
      data: {
        _id: 'p4',
        title: 'Tagged Post',
        content: 'Post with custom interest tags',
        tags: ['technology', 'art'],
        authorId: 'u1',
        status: 'pending',
        createdAt: '2026-03-04T10:00:00Z',
        updatedAt: '2026-03-04T10:00:00Z',
      },
    });

    render(<PostsPage />);

    // Check feed personalization banner is visible
    expect(screen.getByText(/feed personalization active/i)).toBeInTheDocument();

    // Switch to Scenario 2 lookup tab
    fireEvent.click(screen.getByRole('button', { name: /user lookup/i }));
    await waitFor(() => {
      expect(screen.getByText('Select User to Aggregate:')).toBeInTheDocument();
    });

    // Switch back to Feed
    fireEvent.click(screen.getByRole('button', { name: /personalized feed/i }));

    // Create post with tags
    fireEvent.click(screen.getByRole('button', { name: /new post/i }));
    fireEvent.change(screen.getByPlaceholderText('e.g. Indexing vs Aggregation in MongoDB'), {
      target: { value: 'Tagged Post' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('e.g. javascript, react, mongodb, architecture'),
      {
        target: { value: 'technology, art' },
      }
    );
    fireEvent.change(screen.getByPlaceholderText('Write the public post content here...'), {
      target: { value: 'Post with custom interest tags' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publish Post' }));

    await waitFor(() => {
      expect(postsApi.createPost).toHaveBeenCalledWith(
        'Tagged Post',
        'Post with custom interest tags',
        ['technology', 'art']
      );
    });
  });

  it('should auto-populate tags and show category when AI Auto-Tag button is clicked', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      token: 'jwt-user',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(aiApi.suggestTags).mockResolvedValueOnce({
      success: true,
      message: 'AI tags generated',
      data: {
        tags: ['mongodb', 'indexing', 'database'],
        category: 'Database',
        confidence: 0.94,
        engine: 'local-nlp',
      },
    });

    render(<PostsPage />);

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /new post/i }));

    const titleInput = screen.getByPlaceholderText('e.g. Indexing vs Aggregation in MongoDB');
    fireEvent.change(titleInput, { target: { value: 'MongoDB Indexing Deep Dive' } });

    // Click AI Auto-Tag
    const aiBtn = screen.getByRole('button', { name: /ai auto-tag/i });
    expect(aiBtn).toBeInTheDocument();
    fireEvent.click(aiBtn);

    await waitFor(() => {
      expect(aiApi.suggestTags).toHaveBeenCalledWith(
        'MongoDB Indexing Deep Dive',
        'MongoDB Indexing Deep Dive'
      );
      const tagsInput = screen.getByPlaceholderText(
        'e.g. javascript, react, mongodb, architecture'
      ) as HTMLInputElement;
      expect(tagsInput.value).toBe('mongodb, indexing, database');
      expect(screen.getByText(/AI: Database \(94% match\)/i)).toBeInTheDocument();
    });
  });
});
