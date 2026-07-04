'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh }) => {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const isAtTop = useRef<boolean>(true);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    isAtTop.current = scrollTop === 0;
    
    if (isAtTop.current && !isRefreshing) {
      touchStart.current = e.touches[0].clientY;
      setIsSwiping(true);
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStart.current === null || !isAtTop.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStart.current;

    if (distance > 0) {
      if (e.cancelable) {
        e.preventDefault();
      }
      const dampenedDistance = Math.min(80, Math.pow(distance, 0.85));
      setPullDistance(dampenedDistance);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (touchStart.current === null || isRefreshing) return;
    
    if (pullDistance > 55) {
      setIsRefreshing(true);
      setPullDistance(55);
      
      onRefresh().finally(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 800);
      });
    } else {
      setPullDistance(0);
    }

    touchStart.current = null;
    setIsSwiping(false);
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className="relative w-full min-h-full overflow-hidden">
      {/* Indicator */}
      <div 
        className="flex items-center justify-center gap-2 w-full overflow-hidden text-text-secondary text-xs font-semibold pointer-events-none transition-all duration-200"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? Math.min(1, pullDistance / 55) : 0,
          transform: `translateY(${isRefreshing ? 0 : -20 + (pullDistance / 55) * 20}px)`
        }}
      >
        {isRefreshing ? (
          <div className="w-3.5 h-3.5 border-1.5 border-white/15 border-t-brand-primary rounded-full animate-spin"></div>
        ) : (
          <div className="text-sm transition-transform" style={{ transform: `rotate(${Math.min(180, (pullDistance / 55) * 180)}deg)` }}>
            ↓
          </div>
        )}
        <span>
          {isRefreshing ? 'Syncing BookVault...' : pullDistance > 50 ? 'Release to Sync' : 'Pull to Sync'}
        </span>
      </div>

      <div 
        className="will-change-transform"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: !isSwiping ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};
