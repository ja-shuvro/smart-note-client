import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import * as AuthContextModule from '../../../context/auth-context';

// Helper mock wrapper
const renderWithRouter = (ui: React.ReactElement, initialRoute = '/protected') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Login Page Mock</div>} />
        <Route path="/" element={<div>Home Page Mock</div>} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  it('should show loading indicator while auth is loading', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/Loading session.../i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('should redirect unauthenticated user to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('should render protected children for authenticated user', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { _id: '1', name: 'Alice', email: 'alice@example.com', role: 'user' },
      token: 'jwt.token',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected User Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected User Content')).toBeInTheDocument();
  });

  it('should redirect non-admin user to root when requireAdmin is true', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { _id: '1', name: 'Alice', email: 'alice@example.com', role: 'user' },
      token: 'jwt.token',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute requireAdmin={true}>
        <div>Admin Exclusive Panel</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Home Page Mock')).toBeInTheDocument();
    expect(screen.queryByText('Admin Exclusive Panel')).not.toBeInTheDocument();
  });

  it('should render admin content when user has admin role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { _id: '2', name: 'Admin', email: 'admin@example.com', role: 'admin' },
      token: 'jwt.token',
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute requireAdmin={true}>
        <div>Admin Exclusive Panel</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Exclusive Panel')).toBeInTheDocument();
  });
});
