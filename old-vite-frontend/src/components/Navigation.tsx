import React from 'react';
import { useApp } from '../context/AppContext';

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
  openFocusMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, openFocusMode }) => {
  const { streak, activeSession, books } = useApp();

  const activeBook = activeSession
    ? books.find(b => b.id === activeSession.bookId)
    : null;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    },
    {
      id: 'library',
      label: 'Library',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10M6 10h10M6 14h6" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    },
    {
      id: 'ai-space',
      label: 'Vault AI',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.2" />
          <path d="M12 8a4 4 0 0 1 4 4" strokeDasharray="2 2" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" fill="url(#brand-grad)" />
              <defs>
                <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>BookVault</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {activeSession && activeBook && (
          <div className="active-session-widget glass-panel pulse-glow" onClick={openFocusMode}>
            <div className="session-dot"></div>
            <div className="session-info">
              <span className="session-lbl">Session Active</span>
              <span className="session-title">{activeBook.title}</span>
            </div>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="streak-badge glass-panel">
            <span className="streak-icon">🔥</span>
            <div className="streak-details">
              <span className="streak-count">{streak.currentStreak} Days</span>
              <span className="streak-lbl">Current Streak</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Tab Bar */}
      <div className="mobile-nav glass-panel">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`mobile-nav-link ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setView(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        {activeSession && (
          <button className="mobile-nav-link pulse-active" onClick={openFocusMode}>
            <div className="session-dot"></div>
            <span>Focus</span>
          </button>
        )}
      </div>

      <style>{`
        /* Navigation Component Specific Styles */
        .sidebar {
          width: 260px;
          background: var(--bg-glass);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid var(--border-neutral);
          position: fixed;
          top: 24px;
          bottom: 24px;
          left: 24px;
          height: calc(100vh - 48px);
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          z-index: 100;
          border-radius: var(--radius-lg);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          padding-left: 8px;
        }

        .brand-logo {
          background: var(--color-primary-light);
          border: 1px solid var(--border-neutral);
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
        }

        .sidebar-brand h1 {
          font-size: 1.35rem;
          font-weight: 800;
          font-family: var(--font-heading);
          background: linear-gradient(to right, #ffffff, #9ca3af);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          font-weight: 550;
          font-family: var(--font-body);
          text-align: left;
          transition: var(--transition-smooth);
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-link.active {
          color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .nav-link.active svg {
          stroke: var(--color-primary);
        }

        .active-session-widget {
          margin-top: auto;
          margin-bottom: 16px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          border-radius: var(--radius-md);
        }

        .session-dot {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }

        .session-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .session-lbl {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-success);
          font-weight: 700;
        }

        .session-title {
          font-size: 0.8rem;
          color: var(--text-primary);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-footer {
          margin-top: 12px;
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-md);
        }

        .streak-icon {
          font-size: 1.5rem;
        }

        .streak-details {
          display: flex;
          flex-direction: column;
        }

        .streak-count {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .streak-lbl {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        /* Mobile Bottom Nav */
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 16px;
          left: 16px;
          right: 16px;
          height: 64px;
          border-radius: var(--radius-lg);
          z-index: 1000;
          padding: 0 16px;
          justify-content: space-around;
          align-items: center;
          background: var(--bg-glass);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid var(--border-neutral);
          box-shadow: var(--shadow-md);
        }

        .mobile-nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.65rem;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
          height: 100%;
          transition: var(--transition-smooth);
        }

        .mobile-nav-link svg {
          opacity: 0.8;
        }

        .mobile-nav-link.active {
          color: var(--color-primary);
        }

        .mobile-nav-link.active svg {
          stroke: var(--color-primary);
          opacity: 1;
        }

        .pulse-active {
          position: relative;
          color: var(--color-success) !important;
        }

        .pulse-active .session-dot {
          position: absolute;
          top: 8px;
          right: 32%;
        }

        @media (max-width: 1024px) {
          .sidebar {
            display: none;
          }
          .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  );
};
