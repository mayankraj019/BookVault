import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container glass-panel fade-in">
        <div className="modal-drag-handle"></div>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 6, 10, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 2000;
          padding: 0;
        }

        .modal-container {
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          border-radius: 24px 24px 0 0;
          border-top: 1px solid var(--border-neutral);
          border-left: none;
          border-right: none;
          border-bottom: none;
          background: var(--bg-glass);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .modal-drag-handle {
          width: 36px;
          height: 4px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-full);
          margin: 12px auto 0 auto;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @media (min-width: 768px) {
          .modal-overlay {
            align-items: center;
            padding: 20px;
          }

          .modal-container {
            max-width: 540px;
            max-height: 90vh;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-neutral);
            animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .modal-drag-handle {
            display: none;
          }
        }

        .modal-container:hover {
          transform: none;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          padding: 20px 24px 24px 24px;
          border-bottom: 1px solid var(--border-neutral);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h2 {
          font-size: 1.35rem;
          font-family: var(--font-heading);
          background: linear-gradient(to right, #ffffff, #d1d5db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
      `}</style>
    </div>
  );
};
