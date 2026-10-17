import React, { useState, useEffect, useCallback } from 'react';
import { notesApi } from '../api/notes-api';
import { usersApi } from '../api/users-api';
import type { Note, User, PaginationMeta, UserRole } from '../types';
import { Pagination } from '../components/common/Pagination';
import { Users, FileText, Trash2, Plus, X, UserCheck } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'users'>('notes');

  // Notes state
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [notesPagination, setNotesPagination] = useState<PaginationMeta | undefined>();
  const [notesPage, setNotesPage] = useState<number>(1);
  const [notesLoading, setNotesLoading] = useState<boolean>(true);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersPagination, setUsersPagination] = useState<PaginationMeta | undefined>();
  const [usersPage, setUsersPage] = useState<number>(1);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);

  // Add User modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [newUserInterests, setNewUserInterests] = useState('');
  const [addingUser, setAddingUser] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchAllNotes = useCallback(async (p = 1) => {
    setNotesLoading(true);
    setError(null);
    try {
      const res = await notesApi.getNotes(p, 8, true);
      setAllNotes(res.data);
      setNotesPagination(res.pagination);
      setNotesPage(p);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch global notes');
    } finally {
      setNotesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (p = 1) => {
    setUsersLoading(true);
    setError(null);
    try {
      const res = await usersApi.getUsers(p, 8);
      setUsers(res.data);
      setUsersPagination(res.pagination);
      setUsersPage(p);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'notes') {
      fetchAllNotes(notesPage);
    } else {
      fetchUsers(usersPage);
    }
  }, [activeTab, fetchAllNotes, fetchUsers, notesPage, usersPage]);

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Delete this user note permanently as Administrator?')) return;
    try {
      await notesApi.deleteNote(id);
      fetchAllNotes(notesPage);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user and ALL their notes/posts permanently?')) return;
    try {
      await usersApi.deleteUser(id);
      fetchUsers(usersPage);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleToggleRole = async (user: User) => {
    const nextRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of ${user.name} to ${nextRole.toUpperCase()}?`)) return;
    try {
      await usersApi.updateUser(user._id, { role: nextRole });
      fetchUsers(usersPage);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const interestsArray = newUserInterests
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      await usersApi.createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        interests: interestsArray,
      });

      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserInterests('');
      fetchUsers(usersPage);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="page-title">Admin Management Console</h1>
            <span className="badge badge-admin">Elevated Access</span>
          </div>
          <p className="page-subtitle">
            System-wide oversight of all users and documents supported by indexed queries
          </p>
        </div>

        {activeTab === 'users' && (
          <button className="btn btn-primary" onClick={() => setIsAddUserModalOpen(true)}>
            <Plus size={16} />
            <span>Add User</span>
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('notes')}
        >
          <FileText size={16} />
          <span>All System Notes</span>
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>User Directory</span>
        </button>
      </div>

      {/* Tab 1: All System Notes */}
      {activeTab === 'notes' && (
        <div>
          {notesLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading all platform notes...
            </div>
          ) : allNotes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              No notes exist across the system.
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Content Snippet</th>
                      <th>Owner / Author</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allNotes.map((note) => {
                      const owner = typeof note.user === 'object' ? note.user : null;
                      return (
                        <tr key={note._id}>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{note.title}</td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {note.content}
                          </td>
                          <td>
                            {owner ? (
                              <div>
                                <div style={{ fontWeight: 500 }}>{owner.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{owner.email}</div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>{String(note.user)}</span>
                            )}
                          </td>
                          <td>{new Date(note.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteNote(note._id)}
                              title="Delete note as admin"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination meta={notesPagination} onPageChange={(p) => setNotesPage(p)} />
            </>
          )}
        </div>
      )}

      {/* Tab 2: User Directory */}
      {activeTab === 'users' && (
        <div>
          {usersLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading user directory...
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Interests</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {u.interests && u.interests.length > 0 ? (
                              u.interests.map((tag) => (
                                <span key={tag} className="badge badge-tag">
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                            )}
                          </div>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleToggleRole(u)}
                              title="Toggle between user and admin"
                            >
                              <UserCheck size={13} />
                              <span>{u.role === 'admin' ? 'Demote' : 'Promote'}</span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUser(u._id)}
                              title="Delete user and cascade notes/posts"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={usersPagination} onPageChange={(p) => setUsersPage(p)} />
            </>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Provision New User</h2>
              <button className="modal-close" onClick={() => setIsAddUserModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Dana Scully"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. dana@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Temporary password (min 6 chars)"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                >
                  <option value="user">User (Standard)</option>
                  <option value="admin">Admin (Elevated)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Interests (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUserInterests}
                  onChange={(e) => setNewUserInterests(e.target.value)}
                  placeholder="e.g. forensics, science, chess"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addingUser}>
                  {addingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
