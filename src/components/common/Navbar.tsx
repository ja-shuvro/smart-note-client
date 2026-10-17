import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { BookOpen, Users, Share2, Shield, LogOut, FileText, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <div className="brand-icon">
            <FileText size={18} />
          </div>
          <span>SecureNotes</span>
        </NavLink>

        {isAuthenticated && (
          <nav className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={14} />
              <span>Notes</span>
            </NavLink>

            <NavLink
              to="/interests"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={14} />
              <span>Interests</span>
            </NavLink>

            <NavLink
              to="/posts"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Share2 size={14} />
              <span>Posts</span>
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Shield size={14} />
                <span>Admin</span>
              </NavLink>
            )}

            <NavLink
              to="/security-updates"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <ShieldCheck size={14} />
              <span>Docs & Roadmap</span>
            </NavLink>
          </nav>
        )}

        <div className="nav-user">
          {isAuthenticated && user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {user.name}
                </span>
                <span
                  className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}
                  style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <NavLink
                to="/security-updates"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.825rem' }}
              >
                <ShieldCheck size={14} />
                <span>Docs & Roadmap</span>
              </NavLink>
              <NavLink to="/login" className="btn btn-secondary btn-sm">
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

