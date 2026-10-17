import React, { useState, useEffect } from 'react';
import { aggregationsApi } from '../api/aggregations-api';
import type { InterestGroup } from '../types';
import { Tag, Users, Code, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export const InterestsPage: React.FC = () => {
  const [groups, setGroups] = useState<InterestGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuery, setShowQuery] = useState<boolean>(false);

  const fetchInterests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aggregationsApi.getInterests();
      setGroups(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interest aggregation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="page-title">Users Grouped by Interests</h1>
            <span className="badge badge-user">Aggregation Scenario 1</span>
          </div>
          <p className="page-subtitle">
            Demonstrates <strong>single collection.aggregate() call</strong> with $unwind and $group
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowQuery(!showQuery)}>
            <Code size={16} />
            <span>{showQuery ? 'Hide MongoDB Pipeline' : 'Inspect Pipeline Code'}</span>
            {showQuery ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button className="btn btn-primary" onClick={fetchInterests}>
            <RefreshCw size={16} />
            <span>Refresh</span>
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
            {"// MongoDB Aggregation Pipeline executed on server (Supported by index: { interests: 1 })"}
          </div>
          <pre style={{ overflowX: 'auto', color: '#cbd5e1' }}>
{`User.aggregate([
  // 1. $match: Filter documents where interests is a non-empty array
  { $match: { interests: { $exists: true, $type: 'array', $ne: [] } } },

  // 2. $unwind: Deconstruct array to create document per interest
  { $unwind: '$interests' },

  // 3. $project: Normalize interest casing
  { $project: { interest: { $toLower: { $trim: { input: '$interests' } } }, user: { _id: '$_id', name: '$name', email: '$email', role: '$role' } } },

  // 4. $group: Group by interest and accumulate users
  { $group: { _id: '$interest', count: { $sum: 1 }, users: { $push: '$user' } } },

  // 5. $sort: Rank by count descending, then alphabetical
  { $sort: { count: -1, _id: 1 } },

  // 6. $project: Clean output structure
  { $project: { _id: 0, interest: '$_id', count: 1, users: 1 } }
])`}
          </pre>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Executing aggregation pipeline...
        </div>
      ) : groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          No interests found across user profiles. Register users with interests or run database seed.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {groups.map((group) => (
            <div key={group.interest} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={18} color="#6366f1" />
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, textTransform: 'capitalize', color: '#fff' }}>
                    {group.interest}
                  </span>
                </div>
                <span className="badge badge-user" style={{ fontSize: '0.8rem' }}>
                  <Users size={12} /> {group.count} {group.count === 1 ? 'user' : 'users'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                {group.users.map((u) => (
                  <div
                    key={u._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: '0.7rem' }}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
