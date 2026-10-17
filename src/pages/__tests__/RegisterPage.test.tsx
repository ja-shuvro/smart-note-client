import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from '../RegisterPage';
import * as AuthContextModule from '../../context/auth-context';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('RegisterPage Component', () => {
  it('should render registration form with initial interest tags and link to login', () => {
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
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. chess, hiking, AI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText('#reading')).toBeInTheDocument();
    expect(screen.getByText('#coding')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  it('should allow adding new interest tags via button and enter key, and removing tags', () => {
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
        <RegisterPage />
      </MemoryRouter>
    );

    const tagInput = screen.getByPlaceholderText('e.g. chess, hiking, AI');
    const addBtn = screen.getByRole('button', { name: /add/i });

    // Add via button click
    fireEvent.change(tagInput, { target: { value: 'gaming' } });
    fireEvent.click(addBtn);
    expect(screen.getByText('#gaming')).toBeInTheDocument();

    // Add via enter key
    fireEvent.change(tagInput, { target: { value: 'robotics' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('#robotics')).toBeInTheDocument();

    // Remove an existing tag
    const readingTag = screen.getByText('#reading');
    const removeBtn = readingTag.querySelector('button');
    if (removeBtn) {
      fireEvent.click(removeBtn);
    }
    expect(screen.queryByText('#reading')).not.toBeInTheDocument();
  });

  it('should invoke register with form data and redirect to / on success', async () => {
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Alice Smith' } });
    fireEvent.change(screen.getByPlaceholderText('john@example.com'), { target: { value: 'alice@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'Alice Smith',
        'alice@test.com',
        'secret123',
        ['reading', 'coding']
      );
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should display error alert when registration fails', async () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error('Email is already registered'));
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Alice Smith' } });
    fireEvent.change(screen.getByPlaceholderText('john@example.com'), { target: { value: 'alice@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is already registered')).toBeInTheDocument();
    });
  });
});
