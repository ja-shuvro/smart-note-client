import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotesPage } from '../NotesPage';
import { notesApi } from '../../api/notes-api';
import type { Note, PaginationMeta } from '../../types';

vi.mock('../../api/notes-api', () => ({
  notesApi: {
    getNotes: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  },
}));

const mockNotes: Note[] = [
  {
    _id: 'n1',
    title: 'First Architecture Note',
    content: 'Detailing system design and security measures.',
    user: 'u1',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    _id: 'n2',
    title: 'Database Sharding Plan',
    content: 'Horizontal scaling and secondary indexes on tags.',
    user: 'u1',
    createdAt: '2026-03-02T12:00:00.000Z',
    updatedAt: '2026-03-02T12:00:00.000Z',
  },
];

const mockPagination: PaginationMeta = {
  page: 1,
  limit: 6,
  total: 2,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

describe('NotesPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display empty state when user has no notes', async () => {
    vi.mocked(notesApi.getNotes).mockResolvedValueOnce({
      success: true,
      message: 'Notes retrieved',
      data: [],
      pagination: {
        page: 1,
        limit: 6,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    });

    render(<NotesPage />);

    expect(screen.getByText(/loading your notes/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No Notes Yet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create first note/i })).toBeInTheDocument();
    });
  });

  it('should display notes grid and pagination when notes are returned', async () => {
    vi.mocked(notesApi.getNotes).mockResolvedValueOnce({
      success: true,
      message: 'Notes retrieved',
      data: mockNotes,
      pagination: mockPagination,
    });

    render(<NotesPage />);

    await waitFor(() => {
      expect(screen.getByText('First Architecture Note')).toBeInTheDocument();
      expect(screen.getByText('Detailing system design and security measures.')).toBeInTheDocument();
      expect(screen.getByText('Database Sharding Plan')).toBeInTheDocument();
      expect(screen.getByText('Horizontal scaling and secondary indexes on tags.')).toBeInTheDocument();
    });
  });

  it('should open create modal, fill form, and create a new note', async () => {
    vi.mocked(notesApi.getNotes).mockResolvedValue({
      success: true,
      message: 'Notes retrieved',
      data: mockNotes,
      pagination: mockPagination,
    });
    vi.mocked(notesApi.createNote).mockResolvedValueOnce({
      success: true,
      message: 'Note created',
      data: {
        _id: 'n3',
        title: 'New Note Title',
        content: 'New Note Content',
        user: 'u1',
        createdAt: '2026-03-03T10:00:00Z',
        updatedAt: '2026-03-03T10:00:00Z',
      },
    });

    render(<NotesPage />);

    await waitFor(() => {
      expect(screen.getByText('First Architecture Note')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /new note/i }));

    expect(screen.getByRole('heading', { name: 'Create Note' })).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('e.g. System Design Checklist');
    const contentInput = screen.getByPlaceholderText('Type your note content here...');
    const submitBtn = screen.getByRole('button', { name: 'Save Note' });

    fireEvent.change(titleInput, { target: { value: 'New Note Title' } });
    fireEvent.change(contentInput, { target: { value: 'New Note Content' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(notesApi.createNote).toHaveBeenCalledWith('New Note Title', 'New Note Content');
    });
  });

  it('should open edit modal with pre-filled fields and update note', async () => {
    vi.mocked(notesApi.getNotes).mockResolvedValue({
      success: true,
      message: 'Notes retrieved',
      data: mockNotes,
      pagination: mockPagination,
    });
    vi.mocked(notesApi.updateNote).mockResolvedValueOnce({
      success: true,
      message: 'Note updated',
      data: {
        ...mockNotes[0],
        title: 'Updated Note Title',
      },
    });

    render(<NotesPage />);

    await waitFor(() => {
      expect(screen.getByText('First Architecture Note')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit note');
    fireEvent.click(editButtons[0]);

    expect(screen.getByRole('heading', { name: 'Edit Note' })).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('e.g. System Design Checklist') as HTMLInputElement;
    expect(titleInput.value).toBe('First Architecture Note');

    fireEvent.change(titleInput, { target: { value: 'Updated Note Title' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Note' }));

    await waitFor(() => {
      expect(notesApi.updateNote).toHaveBeenCalledWith('n1', {
        title: 'Updated Note Title',
        content: 'Detailing system design and security measures.',
      });
    });
  });

  it('should prompt confirm dialog and delete note', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(notesApi.getNotes).mockResolvedValue({
      success: true,
      message: 'Notes retrieved',
      data: mockNotes,
      pagination: mockPagination,
    });
    vi.mocked(notesApi.deleteNote).mockResolvedValueOnce({
      success: true,
      message: 'Note deleted successfully',
      data: { message: 'Note deleted' },
    });

    render(<NotesPage />);

    await waitFor(() => {
      expect(screen.getByText('First Architecture Note')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete note');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this note?');
    await waitFor(() => {
      expect(notesApi.deleteNote).toHaveBeenCalledWith('n1');
    });
  });

  it('should show error alert if fetching notes fails', async () => {
    vi.mocked(notesApi.getNotes).mockRejectedValueOnce(new Error('Network error: server unreachable'));

    render(<NotesPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error: server unreachable')).toBeInTheDocument();
    });
  });
});
