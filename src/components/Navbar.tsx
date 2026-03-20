import React from 'react';
import { Shield } from 'lucide-react';
import type { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  navigate: (page: Page) => void;
  authToken?: string | null;
  user?: any;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, navigate, authToken, user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <button className="nav-logo" onClick={() => navigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <div className="nav-logo-icon">
              <Shield size={20} color="white" />
            </div>
            <span className="nav-logo-text">ShieldPay</span>
          </button>

          <ul className="nav-links">
            <li>
              <button onClick={() => navigate('landing')} className={currentPage === 'landing' ? 'active' : ''}>
                Home
              </button>
            </li>
            <li>
              <button onClick={() => navigate('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>
                Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => navigate('claims')} className={currentPage === 'claims' ? 'active' : ''}>
                Claims
              </button>
            </li>
            <li>
              <button onClick={() => navigate('analytics')} className={currentPage === 'analytics' ? 'active' : ''}>
                Analytics
              </button>
            </li>
          </ul>

          {authToken ? (
            <div style={{ display: 'flex', gap: 12 }}>
              {user?.role === 'admin' && (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('admin')} style={{ background: 'rgba(255,209,102,0.1)', color: 'var(--brand-yellow)', border: '1px solid rgba(255,209,102,0.3)' }}>
                  <Shield size={14} style={{ marginRight: 6 }} /> Admin
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => onLogout && onLogout()}>
                Log Out
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('dashboard')}>
                Dashboard →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('login')} style={{ border: 'none' }}>
                Log In
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('login')}>
                Get Covered →
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
