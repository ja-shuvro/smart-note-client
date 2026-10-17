import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../Navbar';
import * as AuthContextModule from '../../../context/auth-context';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('Navbar Component', () => {
  it('should render public navigation when unauthenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('SecureNotes')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^login$/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /^register$/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /docs & roadmap/i })).toBeInTheDocument();

    // Private links should not be present
    expect(screen.queryByRole('link', { name: /^notes$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^interests$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^posts$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^admin$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('should render standard authenticated user navigation without admin link', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        _id: 'u1',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        interests: ['books'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      token: 'mock-jwt-token',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^notes$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^interests$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^posts$/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^admin$/i })).not.toBeInTheDocument();

    expect(screen.getByText('Regular User')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should render admin link when authenticated user has admin role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        _id: 'a1',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: 'admin',
        interests: ['security'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      token: 'mock-jwt-admin',
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^admin$/i })).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should call logout and navigate to /login when clicking logout button', () => {
    const mockLogout = vi.fn();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        _id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'user',
        interests: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      token: 'valid-token',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });
});
