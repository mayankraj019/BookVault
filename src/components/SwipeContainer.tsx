'use client';

import React, { useRef } from 'react';

interface SwipeContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const SwipeContainer: React.FC<SwipeContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 60
}) => {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return;

    const diffX = e.changedTouches[0].clientX - startX.current;
    const diffY = e.changedTouches[0].clientY - startY.current;

    // Detect horizontal swipe if X movement is larger than Y movement
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      } else if (diffX > threshold && onSwipeRight) {
        onSwipeRight();
      }
    }

    startX.current = null;
    startY.current = null;
  };

  return (
    <div 
      onTouchStart={handleTouchStart} 
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
};
