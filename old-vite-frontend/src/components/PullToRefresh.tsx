import React, { useState, useRef, useEffect } from 'react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh }) => {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const touchStart = useRef<number | null>(null);
  const isAtTop = useRef<boolean>(true);

  const handleTouchStart = (e: TouchEvent) => {
    // Check if the page is at the very top scroll position
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    isAtTop.current = scrollTop === 0;
    
    if (isAtTop.current && !isRefreshing) {
      touchStart.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStart.current === null || !isAtTop.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStart.current;

    if (distance > 0) {
      // Prevent native scroll behavior while pulling down
      if (e.cancelable) {
        e.preventDefault();
      }
      // Apply a dampening factor to make pulling feel heavy/resistant
      const dampenedDistance = Math.min(80, Math.pow(distance, 0.85));
      setPullDistance(dampenedDistance);
    }
  };

  const handleTouchEnd = () => {
    if (touchStart.current === null || isRefreshing) return;
    
    if (pullDistance > 55) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(55);
      
      onRefresh().finally(() => {
        // Smoothly hide loading spinner
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 800);
      });
    } else {
      setPullDistance(0);
    }

    touchStart.current = null;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use non-passive event listeners to allow preventDefault()
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef} className="pull-to-refresh-container">
      {/* Pull-to-refresh Indicator */}
      <div 
        className="ptr-indicator"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? Math.min(1, pullDistance / 55) : 0,
          transform: `translateY(${isRefreshing ? 0 : -20 + (pullDistance / 55) * 20}px)`
        }}
      >
        {isRefreshing ? (
          <div className="ptr-spinner"></div>
        ) : (
          <div className="ptr-arrow" style={{ transform: `rotate(${Math.min(180, (pullDistance / 55) * 180)}deg)` }}>
            ↓
          </div>
        )}
        <span className="ptr-label">
          {isRefreshing ? 'Syncing BookVault...' : pullDistance > 50 ? 'Release to Sync' : 'Pull to Sync'}
        </span>
      </div>

      <div 
        className="ptr-content"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: touchStart.current === null ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
      >
        {children}
      </div>

      <style>{`
        .pull-to-refresh-container {
          position: relative;
          width: 100%;
          min-height: 100%;
          overflow: hidden;
        }

        .ptr-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          overflow: hidden;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 550;
          pointer-events: none;
          transition: height 0.2s ease, opacity 0.2s ease;
        }

        .ptr-arrow {
          font-size: 1rem;
          transition: transform 0.15s ease;
        }

        .ptr-spinner {
          width: 14px;
          height: 14px;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: ptrSpin 0.7s linear infinite;
        }

        @keyframes ptrSpin {
          to { transform: rotate(360deg); }
        }

        .ptr-content {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};
