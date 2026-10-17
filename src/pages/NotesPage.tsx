import React, { useState, useEffect, useCallback } from 'react';
import { notesApi } from '../api/notes-api';
import type { Note, PaginationMeta } from '../types';
import { Pagination } from '../components/common/Pagination';
import { Plus, Edit2, Trash2, Calendar, FileText, X } from 'lucide-react';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchNotes = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await notesApi.getNotes(targetPage, 6);
      setNotes(res.data);
      setPagination(res.pagination);
      setPage(targetPage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(page);
  }, [fetchNotes, page]);

  const openCreateModal = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingNote) {
        await notesApi.updateNote(editingNote._id, {
          title: formTitle,
          content: formContent,
        });
      } else {
        await notesApi.createNote(formTitle, formContent);
      }
      closeModal();
      fetchNotes(page);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await notesApi.deleteNote(noteId);
      fetchNotes(page);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting note');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Notes</h1>
          <p className="page-subtitle">
            Secure, encrypted and isolated note storage powered by MongoDB indexing
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading your notes...
        </div>
      ) : notes.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '3.5rem 1.5rem', marginTop: '1rem' }}
        >
          <FileText size={42} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Notes Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Start jotting down your private ideas, code snippets, or roadmaps.
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <>
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', wordBreak: 'break-word' }}>
                    {note.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 6px' }}
                      title="Edit note"
                      onClick={() => openEditModal(note)}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 6px' }}
                      title="Delete note"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    margin: '0.85rem 0',
                    flex: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {note.content}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.6rem',
                  }}
                >
                  <Calendar size={12} />
                  <span>{new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>

          <Pagination meta={pagination} onPageChange={(p) => setPage(p)} />
        </>
      )}

      {/* Note Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingNote ? 'Edit Note' : 'Create Note'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNote}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. System Design Checklist"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-textarea"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Type your note content here..."
                  rows={5}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
