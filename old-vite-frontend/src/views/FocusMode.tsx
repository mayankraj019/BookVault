import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

interface FocusModeProps {
  onClose: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onClose }) => {
  const { activeSession, books, logSession, cancelActiveSession } = useApp();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [ambientTheme, setAmbientTheme] = useState<'midnight' | 'aurora' | 'solitude'>('aurora');

  // Log Form State
  const [endPage, setEndPage] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [sessionHighlights, setSessionHighlights] = useState<string[]>([]);

  const timerRef = useRef<any>(null);
  const pauseTimeRef = useRef<number | null>(null);

  const book = activeSession ? books.find(b => b.id === activeSession.bookId) : null;

  // Initialize elapsed time
  useEffect(() => {
    if (activeSession && !isPaused) {
      const updateTimer = () => {
        const diffMs = Date.now() - activeSession.startTime;
        setElapsedSeconds(Math.floor(diffMs / 1000));
      };
      
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, isPaused]);

  // Sync Form pages when book is ready
  useEffect(() => {
    if (book) {
      setEndPage(book.currentPage);
    }
  }, [book]);

  if (!activeSession || !book) {
    return (
      <div className="focus-empty-state fade-in">
        <span className="zen-icon">🧘</span>
        <h2>No Focus Session Active</h2>
        <p>Go to your Library and tap "Track" on any currently reading book to start a focus timer.</p>
        <button className="btn btn-primary" onClick={onClose}>Back to Dashboard</button>
        <style>{`
          .focus-empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 16px;
            padding: 80px 24px;
            min-height: 80vh;
          }
          .zen-icon { font-size: 4rem; animation: float 3s infinite ease-in-out; }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const paddedMins = mins.toString().padStart(2, '0');
    const paddedSecs = secs.toString().padStart(2, '0');
    
    if (hrs > 0) {
      return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${paddedMins}:${paddedSecs}`;
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      // Resume timer
      if (pauseTimeRef.current && activeSession) {
        const pausedDuration = Date.now() - pauseTimeRef.current;
        // Shift activeSession start time to account for the pause
        activeSession.startTime = activeSession.startTime + pausedDuration;
      }
      setIsPaused(false);
    } else {
      // Pause timer
      pauseTimeRef.current = Date.now();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  const handleStopClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(true);
    setShowLogModal(true);
  };

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightInput.trim() && !sessionHighlights.includes(highlightInput.trim())) {
      setSessionHighlights(prev => [...prev, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setSessionHighlights(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    
    logSession(
      book.id,
      durationMins,
      book.currentPage,
      endPage,
      sessionNotes,
      sessionHighlights
    );

    setShowLogModal(false);
    onClose();
  };

  const handleCancelSession = () => {
    if (confirm('Are you sure you want to cancel this reading session? Your elapsed time will not be recorded.')) {
      cancelActiveSession();
      onClose();
    }
  };

  return (
    <div className={`focus-mode-view ${ambientTheme} fade-in`}>
      {/* Ambient static backdrop */}
      <div className="ambient-blur-bg"></div>

      <header className="focus-header">
        <button className="btn-ghost back-to-lib" onClick={onClose}>
          ← Exit Focus
        </button>
        <div className="ambient-selector">
          <button className={`amb-btn ${ambientTheme === 'midnight' ? 'active' : ''}`} onClick={() => setAmbientTheme('midnight')}>Midnight</button>
          <button className={`amb-btn ${ambientTheme === 'aurora' ? 'active' : ''}`} onClick={() => setAmbientTheme('aurora')}>Aurora</button>
          <button className={`amb-btn ${ambientTheme === 'solitude' ? 'active' : ''}`} onClick={() => setAmbientTheme('solitude')}>Solitude</button>
        </div>
      </header>

      <main className="focus-main">
        <div className="focus-timer-card">
          <span className="zen-caption">Deep Reading Mode</span>
          <h1 className="focus-timer-clock">{formatTime(elapsedSeconds)}</h1>
          
          <div className="focus-book-badge glass-panel">
            <span className="active-dot"></span>
            <div className="focus-book-info">
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
            </div>
          </div>
        </div>

        <div className="focus-controls-row">
          <button className="btn btn-secondary cancel-session-btn" onClick={handleCancelSession}>
            Cancel
          </button>
          <button className={`btn focus-btn-play-pause ${isPaused ? 'play' : 'pause'}`} onClick={handlePauseToggle}>
            {isPaused ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>
          <button className="btn btn-primary finish-session-btn" onClick={handleStopClick}>
            Finish
          </button>
        </div>
      </main>

      {/* Log Session Modal */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Reading Progress</h2>
            </div>
            <form onSubmit={handleLogSubmit} className="modal-body">
              <div className="log-summary-pill">
                <span>⏱️ Reading Duration: <strong>{Math.max(1, Math.round(elapsedSeconds / 60))} min</strong></span>
                <span>📖 Started at page: <strong>{book.currentPage}</strong></span>
              </div>

              <div className="form-group">
                <label className="form-label">Ending Page</label>
                <input
                  type="number"
                  className="form-input"
                  min={book.currentPage}
                  max={book.totalPages}
                  value={endPage}
                  onChange={e => setEndPage(parseInt(e.target.value) || book.currentPage)}
                  required
                />
                <span className="input-helper">Must be between page {book.currentPage} and {book.totalPages}.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Session Notes / Thoughts</label>
                <textarea
                  className="form-textarea"
                  placeholder="What happened in these chapters? Write your takeaways..."
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Capture Highlights</label>
                <div className="highlight-adder-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter a quote..."
                    value={highlightInput}
                    onChange={e => setHighlightInput(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddHighlight}>
                    Add
                  </button>
                </div>
                {sessionHighlights.length > 0 && (
                  <div className="modal-highlights-list">
                    {sessionHighlights.map((hl, index) => (
                      <div key={index} className="modal-highlight-item glass-panel">
                        <p>"{hl}"</p>
                        <button type="button" className="hl-remove" onClick={() => handleRemoveHighlight(index)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer-btns">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowLogModal(false);
                  setIsPaused(false);
                }}>
                  Resume Timer
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .focus-mode-view {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 1500;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 40px;
          color: white;
          overflow: hidden;
        }

        /* Ambient static backdrop */
        .ambient-blur-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -1;
          opacity: 1;
          transition: background 1.5s ease;
        }

        /* Ambient Themes (Muted and desaturated matte backdrops) */
        .midnight {
          background-color: #0F1115;
        }
        .midnight .ambient-blur-bg { 
          background: radial-gradient(circle at 10% 20%, rgba(90, 111, 168, 0.08) 0%, rgba(15, 17, 21, 0) 60%), #0F1115; 
        }

        .aurora {
          background-color: #0F1115;
        }
        .aurora .ambient-blur-bg { 
          background: radial-gradient(circle at 20% 30%, rgba(66, 140, 110, 0.06) 0%, rgba(90, 111, 168, 0.06) 40%, rgba(15, 17, 21, 0) 80%), #0F1115; 
        }

        .solitude {
          background-color: #09090b;
        }
        .solitude .ambient-blur-bg { 
          background: radial-gradient(circle at 80% 20%, rgba(189, 165, 110, 0.05) 0%, rgba(15, 17, 21, 0) 50%), #0F1115; 
        }

        .focus-header {
          width: 100%;
          max-width: 1200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .back-to-lib {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }

        .back-to-lib:hover {
          color: white;
        }

        .ambient-selector {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          padding: 4px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .amb-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .amb-btn.active, .amb-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        .focus-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
          z-index: 10;
        }

        .focus-timer-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }

        .zen-caption {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 700;
        }

        .focus-timer-clock {
          font-size: 6.5rem;
          font-weight: 800;
          font-family: var(--font-heading);
          letter-spacing: -0.04em;
          color: white;
        }

        .focus-book-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .active-dot {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
        }

        .focus-book-info h3 {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .focus-book-info p {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .focus-controls-row {
          display: flex;
          align-items: center;
          gap: 32px;
          z-index: 10;
        }

        .focus-btn-play-pause {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
          background: white;
          color: var(--text-inverse);
          transition: var(--transition-spring);
        }

        .focus-btn-play-pause:hover {
          transform: scale(1.04);
          box-shadow: var(--shadow-lg);
        }

        .focus-btn-play-pause.play {
          background: var(--color-success);
          color: white;
          border-color: transparent;
        }

        .focus-btn-play-pause.play svg {
          margin-left: 2px;
        }

        .cancel-session-btn {
          color: rgba(255, 255, 255, 0.7);
        }
        .cancel-session-btn:hover {
          color: var(--color-danger);
          background: rgba(239, 68, 68, 0.12);
        }

        .finish-session-btn {
          font-weight: 700;
        }

        /* Log modal specifics */
        .log-summary-pill {
          display: flex;
          justify-content: space-between;
          background: var(--color-primary-light);
          color: var(--text-primary);
          padding: 10px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          border: 1px solid rgba(129, 140, 248, 0.2);
        }

        .highlight-adder-row {
          display: flex;
          gap: 10px;
        }

        .highlight-adder-row input {
          flex: 1;
        }

        .modal-highlights-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 120px;
          overflow-y: auto;
          margin-top: 8px;
        }

        .modal-highlight-item {
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }

        .modal-highlight-item p {
          font-style: italic;
          color: var(--text-secondary);
        }

        .hl-remove {
          background: transparent;
          border: none;
          color: var(--color-danger);
          cursor: pointer;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .focus-timer-clock {
            font-size: 4.5rem;
          }
          .focus-controls-row {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};
