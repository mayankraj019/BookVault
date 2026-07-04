import React from 'react';
import { useApp } from '../context/AppContext';

export const Analytics: React.FC = () => {
  const { sessions, books, collections } = useApp();

  // Basic Calculations
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  
  const totalPagesRead = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
  const completedBooks = books.filter(b => b.status === 'completed').length;
  
  const averageSpeed = totalMinutes > 0 
    ? (totalPagesRead / totalMinutes).toFixed(2) 
    : '0';

  // Collection breakdown (genres/categories)
  const getCollectionsStats = () => {
    const stats: Array<{ name: string; count: number; percentage: number }> = [];
    
    collections.forEach(col => {
      const count = books.filter(b => b.collections.includes(col)).length;
      stats.push({ name: col, count, percentage: 0 });
    });

    const totalBooks = books.length || 1;
    stats.forEach(s => {
      s.percentage = Math.round((s.count / totalBooks) * 100);
    });

    // Sort by count descending
    return stats.sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const collectionStats = getCollectionsStats();

  // 15 Session History for Line Chart
  const getLineChartData = () => {
    // Reverse sessions so they run chronologically left-to-right
    const lastSessions = [...sessions].slice(0, 10).reverse();
    return lastSessions;
  };

  const lineData = getLineChartData();
  const maxSessionPages = Math.max(...lineData.map(d => d.pagesRead), 10);

  // Generate SVG Line points
  const getSvgPoints = () => {
    if (lineData.length === 0) return [];
    const width = 500;
    const height = 150;
    const paddingX = 40;
    const paddingY = 20;
    
    const points = lineData.map((d, index) => {
      const x = paddingX + (index * (width - 2 * paddingX)) / Math.max(1, lineData.length - 1);
      // Invert Y because SVG coordinates start from top-left
      const y = height - paddingY - (d.pagesRead / maxSessionPages) * (height - 2 * paddingY);
      return { x, y };
    });

    return points;
  };

  const svgPoints = getSvgPoints();

  return (
    <div className="analytics-view fade-in">
      <header className="analytics-header">
        <h2>Insights & Analytics</h2>
      </header>

      {/* Grid of Key Numbers */}
      <div className="analytics-summary-grid">
        <div className="stats-metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-emoji">⏱️</span>
            <span className="metric-lbl">Total Time</span>
          </div>
          <span className="metric-value">
            {totalHours > 0 ? `${totalHours}h ` : ''}{remainingMins}m
          </span>
          <span className="metric-trend">Across {sessions.length} sessions</span>
        </div>

        <div className="stats-metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-emoji">📖</span>
            <span className="metric-lbl">Pages Read</span>
          </div>
          <span className="metric-value">{totalPagesRead}</span>
          <span className="metric-trend">Total catalog pages</span>
        </div>

        <div className="stats-metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-emoji">⚡</span>
            <span className="metric-lbl">Reading Speed</span>
          </div>
          <span className="metric-value">{averageSpeed}</span>
          <span className="metric-trend">Average pages / minute</span>
        </div>

        <div className="stats-metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-emoji">🏆</span>
            <span className="metric-lbl">Completed</span>
          </div>
          <span className="metric-value">{completedBooks}</span>
          <span className="metric-trend">Finished books</span>
        </div>
      </div>

      <div className="analytics-charts-row">
        {/* Pages Read Trend Line Chart */}
        <div className="analytics-chart-box glass-panel">
          <h3 className="chart-title">Pages Read Progression (Recent Sessions)</h3>
          {lineData.length > 0 ? (
            <div className="line-chart-wrapper">
              <svg viewBox="0 0 500 180" width="100%" height="100%" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Horizontals */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                <line x1="30" y1="75" x2="480" y2="75" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                <line x1="30" y1="130" x2="480" y2="130" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

                {/* Filled Area */}
                {svgPoints.length > 1 && (
                  <path
                    d={`
                      M ${svgPoints[0].x} 130
                      ${svgPoints.map(p => `L ${p.x} ${p.y}`).join(' ')}
                      L ${svgPoints[svgPoints.length - 1].x} 130
                      Z
                    `}
                    fill="url(#line-grad)"
                  />
                )}

                {/* Draw line */}
                {svgPoints.length > 1 && (
                  <path
                    d={svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Circles for values */}
                {svgPoints.map((p, idx) => (
                  <g key={idx} className="line-chart-dot">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="var(--color-primary)"
                      stroke="#090d16"
                      strokeWidth="1.5"
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      fontSize="9"
                      fill="var(--text-primary)"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {lineData[idx].pagesRead}
                    </text>
                  </g>
                ))}

                {/* Labels */}
                <line x1="30" y1="130" x2="480" y2="130" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
              </svg>
              <div className="line-chart-labels">
                {lineData.map((d) => (
                  <span key={d.id} className="label-item">
                    {new Date(d.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-chart-fallback">
              <p>Record focus sessions to view your pages-read progression.</p>
            </div>
          )}
        </div>

        {/* Collection Shelves Breakdown */}
        <div className="analytics-chart-box glass-panel distribution-box">
          <h3 className="chart-title">Shelves Distribution</h3>
          {books.length > 0 ? (
            <div className="distrib-list">
              {collectionStats.map(stat => (
                <div key={stat.name} className="distrib-item">
                  <div className="distrib-meta">
                    <span className="distrib-name">🏷️ {stat.name}</span>
                    <span className="distrib-count">{stat.count} {stat.count === 1 ? 'book' : 'books'} ({stat.percentage}%)</span>
                  </div>
                  <div className="distrib-progress-track">
                    <div 
                      className="distrib-progress-fill" 
                      style={{ 
                        width: `${stat.percentage}%`,
                        background: `linear-gradient(to right, var(--color-primary), var(--color-primary-hover))`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-chart-fallback">
              <p>Add books to custom shelves to view distribution stats.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reading Logs History List */}
      <div className="history-logs-section glass-panel">
        <h3 className="chart-title">Reading Sessions Log</h3>
        {sessions.length > 0 ? (
          <div className="sessions-table-wrapper">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Pages Logged</th>
                  <th>Speed</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const speed = s.durationMinutes > 0 
                    ? (s.pagesRead / s.durationMinutes).toFixed(1) 
                    : '0';
                  return (
                    <tr key={s.id}>
                      <td className="table-book-title">{s.bookTitle}</td>
                      <td>{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>⏱️ {s.durationMinutes} min</td>
                      <td>📖 {s.pagesRead} pages (p.{s.startPage} - {s.endPage})</td>
                      <td>⚡ {speed} ppm</td>
                      <td className="table-notes">{s.notes || <span className="no-notes-lbl">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-table-fallback">
            <span className="empty-log-icon">📋</span>
            <p>No logged reading sessions yet. Track a session in Focus Mode to populate your reading history.</p>
          </div>
        )}
      </div>

      <style>{`
        .analytics-view {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .analytics-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          font-family: var(--font-heading);
          background: linear-gradient(to right, #ffffff, #9ca3af);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .analytics-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stats-metric-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .metric-emoji {
          font-size: 1.25rem;
        }

        .metric-lbl {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .metric-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-heading);
        }

        .metric-trend {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        /* Charts Row */
        .analytics-charts-row {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }

        .analytics-chart-box {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .line-chart-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          height: 180px;
        }

        .line-chart-labels {
          display: flex;
          justify-content: space-between;
          padding: 8px 40px 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .label-item {
          width: 32px;
          text-align: center;
        }

        .empty-chart-fallback {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 0.85rem;
          text-align: center;
          height: 180px;
        }

        /* Distribution Box */
        .distrib-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          justify-content: center;
          height: 100%;
        }

        .distrib-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .distrib-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .distrib-name {
          color: var(--text-primary);
          font-weight: 600;
        }

        .distrib-count {
          color: var(--text-secondary);
        }

        .distrib-progress-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .distrib-progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
        }

        /* Session table history log */
        .history-logs-section {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sessions-table-wrapper {
          overflow-x: auto;
        }

        .sessions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }

        .sessions-table th {
          padding: 12px 16px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-neutral);
          font-weight: 700;
        }

        .sessions-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          vertical-align: middle;
        }

        .table-book-title {
          color: var(--text-primary);
          font-weight: 600;
        }

        .table-notes {
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-style: italic;
        }

        .no-notes-lbl {
          color: var(--text-tertiary);
          font-style: normal;
        }

        .empty-table-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px;
          color: var(--text-secondary);
          gap: 12px;
        }

        .empty-log-icon {
          font-size: 2.5rem;
        }

        @media (max-width: 1024px) {
          .analytics-summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .analytics-charts-row {
            display: flex;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
