import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Library } from './views/Library';
import { Analytics } from './views/Analytics';
import { AISpace } from './views/AISpace';
import { FocusMode } from './views/FocusMode';
import { PullToRefresh } from './components/PullToRefresh';

const MainAppContent: React.FC = () => {
  const [currentView, setView] = useState<string>('dashboard');
  const [showFocusScreen, setShowFocusScreen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { startActiveSession, activeSession, resetAllData } = useApp();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleStartSession = (bookId: string) => {
    startActiveSession(bookId);
    setShowFocusScreen(true);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onStartSession={handleStartSession} setView={setView} />;
      case 'library':
        return <Library onStartSession={handleStartSession} />;
      case 'analytics':
        return <Analytics />;
      case 'ai-space':
        return <AISpace />;
      default:
        return <Dashboard onStartSession={handleStartSession} setView={setView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Offline banner */}
      {!isOnline && (
        <div className="offline-banner">
          <span className="offline-dot"></span>
          Offline Mode — Local data is preserved
        </div>
      )}

      {/* Background decorations for high-end SaaS feel */}
      <div className="app-background-aurora">
        <div className="aurora-light light-1"></div>
        <div className="aurora-light light-2"></div>
      </div>

      <Navigation
        currentView={currentView}
        setView={setView}
        openFocusMode={() => setShowFocusScreen(true)}
      />

      <main className="main-content">
        <PullToRefresh onRefresh={async () => {
          // Simulate brief background synchronization delay
          await new Promise(resolve => setTimeout(resolve, 800));
        }}>
          <div className="main-content-header-actions">
            {/* Diagnostic utilities to reset mock data */}
            <button 
              className="btn btn-ghost btn-reset-data" 
              onClick={() => {
                if (confirm('Reset application state to initial mock data? This is helpful for testing.')) {
                  resetAllData();
                  window.location.reload();
                }
              }}
              title="Restore default mock books and analytics data"
            >
              ↻ Reset Sample Data
            </button>
          </div>
          
          {renderActiveView()}
        </PullToRefresh>
      </main>

      {/* Fullscreen Zen Focus Mode Overlay */}
      {showFocusScreen && activeSession && (
        <FocusMode onClose={() => setShowFocusScreen(false)} />
      )}

      <style>{`
        /* Global Aurora Background highlights */
        .app-background-aurora {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -10;
          overflow: hidden;
          background: #070a13;
          pointer-events: none;
        }

        .aurora-light {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.45;
        }

        .light-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
          top: -200px;
          right: -100px;
        }

        .light-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(0, 0, 0, 0) 75%);
          bottom: -150px;
          left: -100px;
        }

        .main-content-header-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: -16px;
        }

        .btn-reset-data {
          font-size: 0.75rem;
          padding: 6px 12px;
          color: var(--text-tertiary);
        }

        .btn-reset-data:hover {
          color: var(--color-danger);
          background: rgba(239, 68, 68, 0.06);
        }

        .offline-banner {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 36px;
          background: var(--color-warning-light);
          border-bottom: 1px solid var(--color-warning);
          color: var(--color-warning);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 9999;
          gap: 6px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .offline-dot {
          width: 6px;
          height: 6px;
          background: var(--color-warning);
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
