import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CircularProgress } from '../components/CircularProgress';

interface DashboardProps {
  onStartSession: (bookId: string) => void;
  setView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartSession, setView }) => {
  const { books, sessions, streak, goals, updateGoals } = useApp();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempYearly, setTempYearly] = useState(goals.yearlyBooksTarget);
  const [tempMonthly, setTempMonthly] = useState(goals.monthlyPagesTarget);

  // Get active or last read book
  const readingBooks = books.filter(b => b.status === 'currently-reading');
  const activeBook = readingBooks.length > 0 ? readingBooks[0] : null;

  // Calculate pages read in current month
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  const monthlyPagesRead = sessions
    .filter(s => {
      const sDate = new Date(s.date);
      return sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear;
    })
    .reduce((sum, s) => sum + s.pagesRead, 0);

  // Calculate completed books in current year
  const completedBooksThisYear = books.filter(b => {
    if (b.status !== 'completed' || !b.endDate) return false;
    const endDateObj = new Date(b.endDate);
    return endDateObj.getFullYear() === currentYear;
  }).length;

  // SVG Chart: Pages Read last 7 Days
  const getWeeklyData = () => {
    const data = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = dayNames[d.getDay()];
      
      const pages = sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.pagesRead, 0);
      
      data.push({ dayLabel, pages });
    }
    return data;
  };

  const weeklyData = getWeeklyData();
  const maxPagesInWeek = Math.max(...weeklyData.map(d => d.pages), 10); // avoid div by 0

  // Get latest 3 highlights or notes across all books
  const getRecentFeed = () => {
    const feed: Array<{ id: string; type: 'note' | 'highlight'; bookTitle: string; content: string; date: string }> = [];
    
    books.forEach(b => {
      b.notes.forEach(n => {
        feed.push({ id: n.id, type: 'note', bookTitle: b.title, content: n.content, date: n.date });
      });
      b.highlights.forEach(h => {
        feed.push({ id: h.id, type: 'highlight', bookTitle: b.title, content: h.content, date: h.date });
      });
    });

    return feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  };

  const recentFeed = getRecentFeed();

  // Save Goals
  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoals({
      yearlyBooksTarget: tempYearly,
      monthlyPagesTarget: tempMonthly
    });
    setShowGoalModal(false);
  };

  // Helper for greeting
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="dashboard-header">
        <div className="header-text">
          <span>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          <h2>{getGreeting()}, Reader</h2>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowGoalModal(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Adjust Goals
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Active Session & Resume Card */}
        <section className="dashboard-card main-card glass-panel">
          {activeBook ? (
            <div className="resume-reading-container">
              <div className="resume-book-cover">
                {activeBook.coverUrl ? (
                  <img src={activeBook.coverUrl} alt={activeBook.title} />
                ) : (
                  <div className="cover-fallback">{activeBook.title[0]}</div>
                )}
              </div>
              <div className="resume-book-details">
                <span className="card-subtitle">Continue Reading</span>
                <h3 className="resume-title">{activeBook.title}</h3>
                <p className="resume-author">by {activeBook.author}</p>
                <div className="resume-meta-row">
                  <span className="current-page-lbl">Page {activeBook.currentPage} of {activeBook.totalPages}</span>
                </div>
                <button className="btn btn-primary resume-btn" onClick={() => onStartSession(activeBook.id)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                  </svg>
                  Continue Reading
                </button>
              </div>
              <div className="resume-progress-ring">
                <CircularProgress
                  value={activeBook.currentPage}
                  max={activeBook.totalPages}
                  size={84}
                  strokeWidth={8}
                  color="var(--color-primary)"
                  label={`${Math.round((activeBook.currentPage / activeBook.totalPages) * 100)}%`}
                />
              </div>
            </div>
          ) : (
            <div className="no-active-book">
              <div className="empty-state-icon">📚</div>
              <h3>No books currently reading</h3>
              <p>Add a book to your library or update its status to start logging focused reading sessions.</p>
              <button className="btn btn-primary" onClick={() => setView('library')}>
                Explore My Library
              </button>
            </div>
          )}
        </section>

        {/* Goals Progress */}
        <section className="dashboard-card glass-panel">
          <h3 className="card-title">Activity Goals</h3>
          <div className="progress-rings-wrapper">
            <CircularProgress
              value={completedBooksThisYear}
              max={goals.yearlyBooksTarget}
              color="var(--color-primary)"
              label={`${completedBooksThisYear}/${goals.yearlyBooksTarget}`}
              subLabel="Books Completed"
            />
            <CircularProgress
              value={monthlyPagesRead}
              max={goals.monthlyPagesTarget}
              color="var(--color-success)"
              label={`${monthlyPagesRead}`}
              subLabel="Pages Read"
            />
          </div>
          <div className="goals-footer">
            <span className="goals-lbl">Monthly Target: {goals.monthlyPagesTarget} pages</span>
            <span className="goals-lbl">Yearly Target: {goals.yearlyBooksTarget} books</span>
          </div>
        </section>

        {/* Streak Analytics */}
        <section className="dashboard-card glass-panel">
          <h3 className="card-title">Daily Streak</h3>
          <div className="streak-stats-row">
            <div className="streak-stats-item">
              <span className="streak-val font-accent">🔥 {streak.currentStreak}</span>
              <span className="streak-lbl">Consecutive Days</span>
            </div>
            <div className="streak-stats-item">
              <span className="streak-val">
                {streak.history.length > 0 
                  ? new Date(streak.history[streak.history.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'N/A'}
              </span>
              <span className="streak-lbl">Last Logged Day</span>
            </div>
          </div>
          <div className="streak-visual-grid">
            {/* Show last 7 days visual streak boxes */}
            {(() => {
              const weekDays = [];
              const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
              for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const hasRead = streak.history.includes(dateStr);
                const isToday = i === 0;
                weekDays.push({
                  dayLetter: dayNames[d.getDay()],
                  hasRead,
                  isToday
                });
              }
              return weekDays.map((wd, index) => (
                <div key={index} className={`streak-day-cell ${wd.hasRead ? 'read' : ''} ${wd.isToday ? 'today' : ''}`}>
                  <span className="cell-day">{wd.dayLetter}</span>
                  <div className="cell-circle"></div>
                </div>
              ));
            })()}
          </div>
        </section>

        {/* Weekly Chart */}
        <section className="dashboard-card glass-panel chart-card">
          <h3 className="card-title">Pages Read This Week</h3>
          <div className="svg-chart-container">
            <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-primary-hover)" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="380" y2="20" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              <line x1="30" y1="65" x2="380" y2="65" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              <line x1="30" y1="110" x2="380" y2="110" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              
              {/* Bars */}
              {weeklyData.map((d, index) => {
                const barWidth = 26;
                const gap = 20;
                const startX = 40 + index * (barWidth + gap);
                const barHeight = (d.pages / maxPagesInWeek) * 100;
                const startY = 120 - barHeight;

                return (
                  <g key={index} className="chart-bar-group">
                    <rect
                      x={startX}
                      y={startY}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill="url(#bar-gradient)"
                      style={{ transition: 'all 0.5s' }}
                    />
                    {d.pages > 0 && (
                      <text
                        x={startX + barWidth / 2}
                        y={startY - 6}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {d.pages}
                      </text>
                    )}
                    <text
                      x={startX + barWidth / 2}
                      y="138"
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      fontSize="9.5"
                      fontWeight="500"
                    >
                      {d.dayLabel}
                    </text>
                  </g>
                );
              })}
              {/* Baseline */}
              <line x1="30" y1="120" x2="380" y2="120" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
            </svg>
          </div>
        </section>

        {/* Recent Highlights / Notes */}
        <section className="dashboard-card glass-panel feed-card">
          <h3 className="card-title">Recent Notes & Highlights</h3>
          {recentFeed.length > 0 ? (
            <div className="recent-feed-list">
              {recentFeed.map(item => (
                <div key={item.id} className="feed-item">
                  <div className="feed-item-header">
                    <span className={`feed-badge ${item.type}`}>
                      {item.type}
                    </span>
                    <span className="feed-book-title">{item.bookTitle}</span>
                  </div>
                  <p className="feed-content">"{item.content}"</p>
                  <span className="feed-date">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-feed-data">
              <span className="feed-empty-icon">📝</span>
              <p>No highlights or notes recorded yet. They will appear here once you write them during Focus Sessions.</p>
            </div>
          )}
        </section>
      </div>

      {/* Adjust Goals Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-container glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Set Activity Targets</h2>
              <button className="modal-close-btn" onClick={() => setShowGoalModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveGoals} className="modal-body">
              <div className="form-group">
                <label className="form-label">Yearly Books Goal</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="500"
                  value={tempYearly}
                  onChange={e => setTempYearly(parseInt(e.target.value) || 0)}
                  required
                />
                <span className="input-helper">Target number of books to complete in {currentYear}.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Pages Goal</label>
                <input
                  type="number"
                  className="form-input"
                  min="50"
                  max="10000"
                  value={tempMonthly}
                  onChange={e => setTempMonthly(parseInt(e.target.value) || 0)}
                  required
                />
                <span className="input-helper">Target number of pages to read each month.</span>
              </div>
              <div className="modal-footer-btns">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGoalModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text span {
          font-size: 0.75rem;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .header-text h2 {
          font-size: 2.2rem;
          font-weight: 800;
          font-family: var(--font-heading);
          background: linear-gradient(to right, #ffffff, #9ca3af);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }

        .dashboard-card {
          grid-column: span 4;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .main-card {
          grid-column: span 8;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .card-subtitle {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-primary);
          font-weight: 700;
        }

        /* Resume Reading styling */
        .resume-reading-container {
          display: flex;
          gap: 24px;
          height: 100%;
          align-items: center;
        }

        .resume-book-cover {
          width: 100px;
          aspect-ratio: 2/3;
          border-radius: var(--radius-sm);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .resume-book-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-fallback {
          width: 100%;
          height: 100%;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .resume-book-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .resume-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .resume-author {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .resume-meta-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .current-page-lbl {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .resume-progress-ring {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: var(--spacing-lg);
        }

        .resume-btn {
          align-self: flex-start;
        }

        .no-active-book {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 12px;
          padding: 24px;
        }

        .empty-state-icon {
          font-size: 3rem;
        }

        .no-active-book p {
          color: var(--text-secondary);
          max-width: 320px;
          font-size: 0.9rem;
          margin-bottom: 12px;
        }

        /* Activity Goals & Progress Rings */
        .progress-rings-wrapper {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0;
        }

        .goals-footer {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-top: 1px solid var(--border-neutral);
          padding-top: 12px;
        }

        .goals-lbl {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Streak calendar grid */
        .streak-stats-row {
          display: flex;
          gap: 24px;
        }

        .streak-stats-item {
          display: flex;
          flex-direction: column;
        }

        .streak-val {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .streak-val.font-accent {
          color: var(--color-success);
        }

        .streak-visual-grid {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }

        .streak-day-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .cell-day {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-tertiary);
        }

        .cell-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--border-neutral);
          background: rgba(255, 255, 255, 0.02);
          transition: var(--transition-smooth);
        }

        .streak-day-cell.read .cell-circle {
          background: var(--color-success);
          border-color: transparent;
        }

        .streak-day-cell.today .cell-circle {
          border-color: var(--color-primary);
        }

        /* Chart card */
        .chart-card {
          grid-column: span 6;
        }

        .svg-chart-container {
          flex: 1;
          display: flex;
          align-items: flex-end;
          padding-top: 10px;
          height: 160px;
        }

        .chart-bar-group rect {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chart-bar-group:hover rect {
          opacity: 0.85;
          fill: var(--color-primary);
        }

        /* Feed list */
        .feed-card {
          grid-column: span 6;
        }

        .recent-feed-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feed-item {
          border-bottom: 1px solid var(--border-neutral);
          padding-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .feed-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .feed-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .feed-badge {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .feed-badge.note {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        .feed-badge.highlight {
          background: var(--color-warning-light);
          color: var(--color-warning);
        }

        .feed-book-title {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .feed-content {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.4;
          font-style: italic;
        }

        .feed-date {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .no-feed-data {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 12px;
          color: var(--text-secondary);
          padding: 24px;
        }

        .feed-empty-icon {
          font-size: 2.2rem;
        }

        .no-feed-data p {
          max-width: 280px;
          font-size: 0.85rem;
        }

        /* Adjust Goals Modal specifics */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(4, 6, 10, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
        }

        .modal-container {
          width: 90%;
          max-width: 440px;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-neutral);
        }

        .modal-header h2 {
          font-size: 1.25rem;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.2rem;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .input-helper {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            display: flex;
            flex-direction: column;
          }
          .dashboard-card {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
