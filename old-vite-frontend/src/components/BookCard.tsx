import { useApp, type Book } from '../context/AppContext';
import { SwipeContainer } from '../components/SwipeContainer';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onStartSession?: (bookId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect, onStartSession }) => {
  const { updateBook } = useApp();

  const progressPercent = book.totalPages > 0 
    ? Math.round((book.currentPage / book.totalPages) * 100) 
    : 0;

  const handleRatingChange = (e: React.MouseEvent, ratingValue: number) => {
    e.stopPropagation();
    updateBook(book.id, { rating: ratingValue });
  };

  const getStatusLabel = (status: Book['status']) => {
    switch (status) {
      case 'currently-reading': return 'Reading';
      case 'completed': return 'Finished';
      case 'want-to-read': return 'To Read';
      case 'owned': return 'Owned';
    }
  };

  const getStatusColorClass = (status: Book['status']) => {
    switch (status) {
      case 'currently-reading': return 'status-reading';
      case 'completed': return 'status-completed';
      case 'want-to-read': return 'status-toread';
      case 'owned': return 'status-owned';
    }
  };

  return (
    <SwipeContainer
      onSwipeLeft={() => {
        if (book.status === 'currently-reading' && onStartSession) {
          onStartSession(book.id);
        }
      }}
      onSwipeRight={() => onSelect(book)}
    >
      <div className="book-card glass-panel" onClick={() => onSelect(book)}>
      <div className="book-cover-container">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="book-cover-img" loading="lazy" />
        ) : (
          <div className="book-cover-fallback">
            <span>{book.title[0]}</span>
          </div>
        )}
        <span className={`book-status-badge ${getStatusColorClass(book.status)}`}>
          {getStatusLabel(book.status)}
        </span>
        
        {book.status === 'currently-reading' && onStartSession && (
          <button 
            className="quick-session-btn"
            onClick={(e) => {
              e.stopPropagation();
              onStartSession(book.id);
            }}
            title="Start reading session"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
            <span>Track</span>
          </button>
        )}
      </div>

      <div className="book-card-details">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
        
        {book.collections.length > 0 && (
          <div className="book-card-collections">
            {book.collections.slice(0, 2).map(c => (
              <span key={c} className="collection-badge">{c}</span>
            ))}
            {book.collections.length > 2 && (
              <span className="collection-badge-more">+{book.collections.length - 2}</span>
            )}
          </div>
        )}

        {book.status !== 'want-to-read' && book.status !== 'owned' ? (
          <div className="book-card-progress">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="progress-labels">
              <span>{book.currentPage} / {book.totalPages} pages</span>
              <span className="progress-percent">{progressPercent}%</span>
            </div>
          </div>
        ) : (
          <div className="book-card-meta">
            <span>{book.totalPages} pages</span>
          </div>
        )}

        {book.status === 'completed' && (
          <div className="book-card-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star-icon ${star <= (book.rating || 0) ? 'filled' : ''}`}
                onClick={(e) => handleRatingChange(e, star)}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .book-card {
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          height: 100%;
          position: relative;
          background: var(--bg-glass);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid var(--border-neutral);
          box-shadow: var(--shadow-sm);
          transition: var(--transition-spring);
        }

        .book-card:hover {
          transform: translateY(-2px);
          border-color: rgba(129, 140, 248, 0.15);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
        }

        .book-cover-container {
          position: relative;
          aspect-ratio: 2 / 3;
          width: 100%;
          background: #111827;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .book-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .book-card:hover .book-cover-img {
          transform: scale(1.06);
        }

        .book-cover-fallback {
          width: 100%;
          height: 100%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-size: 3rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .book-status-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .status-reading {
          background: var(--color-primary-light);
          color: var(--color-primary);
          border: 1px solid rgba(129, 140, 248, 0.2);
        }

        .status-completed {
          background: var(--color-success-light);
          color: var(--color-success);
          border: 1px solid rgba(52, 211, 153, 0.2);
        }

        .status-toread {
          background: var(--color-warning-light);
          color: var(--color-warning);
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .status-owned {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          border: 1px solid var(--border-neutral);
        }

        .quick-session-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: var(--color-primary);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 14px;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: var(--shadow-md);
          opacity: 0;
          transform: translateY(10px);
          transition: var(--transition-spring);
        }

        .book-card:hover .quick-session-btn {
          opacity: 1;
          transform: translateY(0);
        }

        .quick-session-btn:hover {
          background: var(--color-primary-hover);
        }

        .book-card-details {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .book-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .book-card-author {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .book-card-collections {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 16px;
        }

        .collection-badge {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-neutral);
          color: var(--text-secondary);
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-weight: 500;
        }

        .collection-badge-more {
          color: var(--text-tertiary);
          font-size: 0.65rem;
          font-weight: 500;
          padding-left: 2px;
          display: flex;
          align-items: center;
        }

        .book-card-progress {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--color-primary);
          border-radius: var(--radius-full);
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .progress-percent {
          font-weight: 700;
          color: var(--text-primary);
        }

        .book-card-meta {
          margin-top: auto;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .book-card-rating {
          margin-top: auto;
          display: flex;
          gap: 2px;
        }

        .star-icon {
          color: rgba(255, 255, 255, 0.1);
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .star-icon.filled {
          color: var(--color-warning);
        }
      `}</style>
    </div>
    </SwipeContainer>
  );
};
