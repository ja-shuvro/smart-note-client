import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { BookOpen, Users, Share2, Shield, LogOut, FileText, ShieldCheck, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">
            <FileText size={18} />
          </div>
          <span>SecureNotes</span>
        </NavLink>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="nav-links nav-desktop">
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

        {/* Desktop User Section */}
        <div className="nav-user nav-desktop">
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

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          title="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu-dropdown">
          {isAuthenticated && user && (
            <div className="mobile-user-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{user.name}</span>
                <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                  {user.role}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</span>
            </div>
          )}

          <nav className="mobile-nav-links">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <BookOpen size={16} />
                  <span>Notes</span>
                </NavLink>

                <NavLink
                  to="/interests"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Users size={16} />
                  <span>Interests</span>
                </NavLink>

                <NavLink
                  to="/posts"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Share2 size={16} />
                  <span>Posts</span>
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <Shield size={16} />
                    <span>Admin</span>
                  </NavLink>
                )}

                <NavLink
                  to="/security-updates"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <ShieldCheck size={16} />
                  <span>Docs & Roadmap</span>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm mobile-logout-btn"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/security-updates"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <ShieldCheck size={16} />
                  <span>Docs & Roadmap</span>
                </NavLink>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <NavLink to="/login" className="btn btn-secondary" onClick={closeMenu}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className="btn btn-primary" onClick={closeMenu}>
                    Register
                  </NavLink>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
