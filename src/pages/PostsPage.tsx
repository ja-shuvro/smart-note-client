import React, { useState, useEffect, useCallback } from 'react';
import { aggregationsApi } from '../api/aggregations-api';
import { usersApi } from '../api/users-api';
import { useAuth } from '../context/auth-context';
import type { User, UserWithPosts } from '../types';
import { Share2, Plus, Code, ChevronDown, ChevronUp, Calendar, User as UserIcon, X } from 'lucide-react';

export const PostsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userWithPosts, setUserWithPosts] = useState<UserWithPosts | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuery, setShowQuery] = useState<boolean>(false);

  // Modal to create post
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Load available users for the dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await usersApi.getUsers(1, 50);
        setUsersList(res.data);
        if (res.data.length > 0) {
          // Default to current logged-in user or first user
          const initialId = currentUser ? currentUser._id : res.data[0]._id;
          setSelectedUserId(initialId);
        }
      } catch {
        // If regular user cannot access admin /users endpoint, fallback to current user
        if (currentUser) {
          setUsersList([currentUser]);
          setSelectedUserId(currentUser._id);
        }
      }
    };
    loadUsers();
  }, [currentUser]);

  // Fetch $lookup aggregation for selected user
  const fetchUserPosts = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aggregationsApi.getUserPosts(userId);
      setUserWithPosts(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user posts via $lookup');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserPosts(selectedUserId);
    }
  }, [selectedUserId, fetchUserPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      await aggregationsApi.createPost(postTitle, postContent);
      setIsModalOpen(false);
      setPostTitle('');
      setPostContent('');
      if (selectedUserId === currentUser?._id) {
        fetchUserPosts(selectedUserId);
      } else if (currentUser) {
        setSelectedUserId(currentUser._id);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error publishing post');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="page-title">User Posts ($lookup Join)</h1>
            <span className="badge badge-user">Aggregation Scenario 2</span>
          </div>
          <p className="page-subtitle">
            Demonstrates <strong>single aggregation pipeline with a $lookup stage</strong> joining Users and Posts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowQuery(!showQuery)}>
            <Code size={16} />
            <span>{showQuery ? 'Hide MongoDB Pipeline' : 'Inspect Pipeline Code'}</span>
            {showQuery ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Query Inspection Box for Interview Reviewer */}
      {showQuery && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            backgroundColor: '#050914',
            borderColor: '#3b82f6',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ color: '#60a5fa', fontWeight: 600, marginBottom: '0.5rem' }}>
            {"// MongoDB Aggregation Pipeline executed on server (Supported by index: { authorId: 1, createdAt: -1 })"}
          </div>
          <pre style={{ overflowX: 'auto', color: '#cbd5e1' }}>
{`User.aggregate([
  // 1. $match: Target user by primary _id
  { $match: { _id: new ObjectId(targetUserId) } },

  // 2. $lookup: Single stage joining 'posts' collection using authorId foreign key
  {
    $lookup: {
      from: 'posts',
      let: { currentUserId: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$authorId', '$$currentUserId'] } } },
        { $sort: { createdAt: -1 } }
      ],
      as: 'posts'
    }
  },

  // 3. $project: Project user document and embedded posts array
  {
    $project: {
      _id: 1, name: 1, email: 1, role: 1, interests: 1, createdAt: 1,
      totalPosts: { $size: '$posts' },
      posts: 1
    }
  }
])`}
          </pre>
        </div>
      )}

      {/* User Selector Dropdown */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <UserIcon size={18} color="#6366f1" />
          <span>Select User to Aggregate:</span>
        </div>
        <select
          className="form-select"
          style={{ maxWidth: '320px' }}
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          {usersList.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email}) [{u.role}]
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Executing $lookup aggregation pipeline...
        </div>
      ) : userWithPosts ? (
        <div>
          {/* User Profile Header */}
          <div
            className="card"
            style={{
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
              borderLeft: '4px solid var(--color-primary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{userWithPosts.name}</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{userWithPosts.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className={`badge ${userWithPosts.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                  {userWithPosts.role}
                </span>
                <span className="badge badge-tag" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Joined Posts: {userWithPosts.totalPosts}
                </span>
              </div>
            </div>

            {userWithPosts.interests && userWithPosts.interests.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {userWithPosts.interests.map((t) => (
                  <span key={t} className="badge badge-tag">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Posts Feed joined via $lookup */}
          {userWithPosts.posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Share2 size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Posts Found for this User</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Click "New Post" above to write a post under your account and verify real-time aggregation!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {userWithPosts.posts.map((post) => (
                <div key={post._id} className="card">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                    {post.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', whiteSpace: 'pre-wrap', marginBottom: '0.85rem' }}>
                    {post.content}
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
                    <span>Published on {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Publish New Post</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">Post Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Indexing vs Aggregation in MongoDB"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Post Content</label>
                <textarea
                  className="form-textarea"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write the public post content here..."
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={publishing}>
                  {publishing ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
