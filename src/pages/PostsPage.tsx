import React, { useState, useEffect, useCallback } from 'react';
import { aggregationsApi } from '../api/aggregations-api';
import { postsApi } from '../api/posts-api';
import { usersApi } from '../api/users-api';
import { aiApi } from '../api/ai-api';
import { useAuth } from '../context/auth-context';
import type { User, UserWithPosts, Post, PostStatus, PaginationMeta } from '../types';
import { Pagination } from '../components/common/Pagination';
import {
  Share2,
  Plus,
  Code,
  ChevronDown,
  ChevronUp,
  Calendar,
  User as UserIcon,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Check,
  Sparkles,
  Tag,
} from 'lucide-react';

export const PostsPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();

  // Tab State: 'feed' (Interest-ranked) vs 'lookup' ($lookup Aggregation Scenario 2)
  const [activeTab, setActiveTab] = useState<'feed' | 'lookup'>('feed');

  // Feed State
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState<boolean>(true);
  const [feedPagination, setFeedPagination] = useState<PaginationMeta | null>(null);
  const [feedPage, setFeedPage] = useState<number>(1);

  // Scenario 2 $lookup State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userWithPosts, setUserWithPosts] = useState<UserWithPosts | null>(null);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [showQuery, setShowQuery] = useState<boolean>(false);

  // Modal to create post
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postContent, setPostContent] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMeta, setAiMeta] = useState<{ category: string; confidence: number; engine: string } | null>(null);

  // Normalize user interests for UI badge highlighting
  const userInterests = (currentUser?.interests || []).map((i) => i.toLowerCase().trim());

  // 1. Fetch Personalized Feed
  const fetchFeed = useCallback(async (page = 1) => {
    setFeedLoading(true);
    setError(null);
    try {
      const res = await postsApi.getPosts(page, 10);
      setFeedPosts(res.data || []);
      if (res.pagination) {
        setFeedPagination(res.pagination);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts feed');
    } finally {
      setFeedLoading(false);
    }
  }, []);

  // 2. Fetch $lookup aggregation for selected user
  const fetchUserPosts = useCallback(async (userId: string) => {
    if (!userId) return;
    setLookupLoading(true);
    setError(null);
    try {
      const res = await aggregationsApi.getUserPosts(userId);
      setUserWithPosts(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user posts via $lookup');
    } finally {
      setLookupLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFeed(feedPage);
  }, [fetchFeed, feedPage]);

  // Load available users for the $lookup dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await usersApi.getUsers(1, 50);
        setUsersList(res.data);
        if (res.data.length > 0) {
          const initialId = currentUser ? currentUser._id : res.data[0]._id;
          setSelectedUserId(initialId);
        }
      } catch {
        if (currentUser) {
          setUsersList([currentUser]);
          setSelectedUserId(currentUser._id);
        }
      }
    };
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    if (selectedUserId && activeTab === 'lookup') {
      fetchUserPosts(selectedUserId);
    }
  }, [selectedUserId, activeTab, fetchUserPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const tagsArray = postTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      if (tagsArray.length > 0) {
        await postsApi.createPost(postTitle, postContent, tagsArray);
      } else {
        await postsApi.createPost(postTitle, postContent);
      }

      setIsModalOpen(false);
      setPostTitle('');
      setPostTags('');
      setPostContent('');
      setAiMeta(null);

      // Refresh data
      fetchFeed(1);
      if (selectedUserId) {
        fetchUserPosts(selectedUserId);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error publishing post');
    } finally {
      setPublishing(false);
    }
  };

  const handleAiSuggestTags = async () => {
    if (!postTitle.trim() && !postContent.trim()) {
      alert('Please enter a Title or Content first so AI can classify topics!');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiApi.suggestTags(postTitle || 'Untitled Post', postContent || postTitle);
      if (res.data.tags && res.data.tags.length > 0) {
        setPostTags(res.data.tags.join(', '));
        setAiMeta({
          category: res.data.category,
          confidence: res.data.confidence,
          engine: res.data.engine,
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'AI classification failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdateStatus = async (postId: string, status: PostStatus) => {
    try {
      await postsApi.updateStatus(postId, status);
      fetchFeed(feedPage);
      if (selectedUserId) {
        fetchUserPosts(selectedUserId);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update post status');
    }
  };

  const renderStatusBadge = (status: PostStatus) => {
    if (status === 'approved') {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
          }}
        >
          <CheckCircle size={12} />
          <span>Approved</span>
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
          }}
        >
          <XCircle size={12} />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span
        className="badge"
        style={{
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          padding: '0.2rem 0.5rem',
        }}
      >
        <Clock size={12} />
        <span>Pending Approval</span>
      </span>
    );
  };

  const renderPostCard = (post: Post) => {
    const authorName =
      typeof post.authorId === 'object' && post.authorId !== null
        ? post.authorId.name
        : userWithPosts?.name || 'Community Member';
    const authorEmail =
      typeof post.authorId === 'object' && post.authorId !== null
        ? post.authorId.email
        : userWithPosts?.email || '';

    const hasInterestMatch = (post.matchScore && post.matchScore > 0) || (
      post.tags && post.tags.some((t) => userInterests.includes(t.toLowerCase()))
    );

    return (
      <div
        key={post._id}
        className="card"
        style={{
          borderLeft: hasInterestMatch ? '4px solid #6366f1' : undefined,
          background: hasInterestMatch
            ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(30, 41, 59, 1) 100%)'
            : undefined,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '0.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                {post.title}
              </h3>
              {hasInterestMatch && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    fontSize: '0.72rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={11} />
                  <span>Matches your interests</span>
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              By <strong>{authorName}</strong> {authorEmail && `(${authorEmail})`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {renderStatusBadge(post.status)}

            {isAdmin && post.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                  }}
                  title="Approve Post"
                  onClick={() => handleUpdateStatus(post._id, 'approved')}
                >
                  <Check size={12} />
                  <span>Approve</span>
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  title="Reject Post"
                  onClick={() => handleUpdateStatus(post._id, 'rejected')}
                >
                  <X size={12} />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
            {post.tags.map((tag) => {
              const isUserInterest = userInterests.includes(tag.toLowerCase());
              return (
                <span
                  key={tag}
                  className="badge badge-tag"
                  style={{
                    backgroundColor: isUserInterest ? 'rgba(99, 102, 241, 0.25)' : undefined,
                    borderColor: isUserInterest ? '#6366f1' : undefined,
                    color: isUserInterest ? '#c7d2fe' : undefined,
                    fontWeight: isUserInterest ? 600 : 400,
                  }}
                >
                  #{tag}
                </span>
              );
            })}
          </div>
        )}

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.925rem',
            whiteSpace: 'pre-wrap',
            margin: '0.5rem 0 0.85rem 0',
          }}
        >
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
          <span>
            Published on {new Date(post.createdAt).toLocaleDateString()} at{' '}
            {new Date(post.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="page-title">Community Posts & Feed</h1>
            <span className="badge badge-user">Personalized & $lookup</span>
          </div>
          <p className="page-subtitle">
            Approved posts prioritized by your interests + MongoDB single pipeline $lookup join
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'lookup' && (
            <button className="btn btn-secondary" onClick={() => setShowQuery(!showQuery)}>
              <Code size={16} />
              <span>{showQuery ? 'Hide MongoDB Pipeline' : 'Inspect Pipeline Code'}</span>
              {showQuery ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('feed')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Sparkles size={15} />
          <span>Personalized Feed (Interests)</span>
        </button>
        <button
          className={`btn ${activeTab === 'lookup' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('lookup');
            if (selectedUserId) fetchUserPosts(selectedUserId);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <UserIcon size={15} />
          <span>User Lookup (Scenario 2 Aggregation)</span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* TAB 1: PERSONALIZED FEED */}
      {activeTab === 'feed' && (
        <div>
          {/* User Interests Banner */}
          <div
            className="card"
            style={{
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
              borderLeft: '4px solid #6366f1',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#818cf8" />
                <strong style={{ color: '#fff' }}>Feed Personalization Active:</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Posts matching your profile interests appear at the top of your feed!
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {userInterests.length > 0 ? (
                  userInterests.map((interest) => (
                    <span key={interest} className="badge badge-tag" style={{ borderColor: '#6366f1', color: '#c7d2fe' }}>
                      #{interest}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No profile interests set</span>
                )}
              </div>
            </div>
          </div>

          {feedLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading personalized feed...
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Share2 size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Posts in Feed</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Click "New Post" above to write a post with tags and seed your feed!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {feedPosts.map((post) => renderPostCard(post))}
              {feedPagination && (
                <Pagination
                  meta={feedPagination}
                  onPageChange={(p) => setFeedPage(p)}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCENARIO 2 LOOKUP */}
      {activeTab === 'lookup' && (
        <div>
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

          {lookupLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Executing $lookup aggregation pipeline...
            </div>
          ) : userWithPosts ? (
            <div>
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
                  {userWithPosts.posts.map((post) => renderPostCard(post))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <Tag size={14} />
                    <span>Topic Tags (comma-separated interests)</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.75rem',
                      borderColor: '#6366f1',
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    disabled={aiLoading}
                    onClick={handleAiSuggestTags}
                    title="Auto-detect categories & tags using AI"
                  >
                    <Sparkles size={12} color="#818cf8" />
                    <span>{aiLoading ? 'Analyzing...' : 'AI Auto-Tag'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="e.g. javascript, react, mongodb, architecture"
                />
                {aiMeta && (
                  <div
                    style={{
                      marginTop: '0.35rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        color: '#c7d2fe',
                        padding: '0.15rem 0.4rem',
                        fontSize: '0.7rem',
                      }}
                    >
                      AI: {aiMeta.category} ({Math.round(aiMeta.confidence * 100)}% match)
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>via {aiMeta.engine}</span>
                  </div>
                )}
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                  Tip: Posts with tags matching users' interests will be prioritized in their feed.
                </small>
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

export default PostsPage;
