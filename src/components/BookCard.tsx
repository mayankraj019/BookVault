'use client';

import React from 'react';
import { Book } from '../types';
import { SwipeContainer } from './SwipeContainer';
import { Play, Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onStartSession?: (bookId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect, onStartSession }) => {
  const progressPercent = book.totalPages > 0 
    ? Math.round((book.currentPage / book.totalPages) * 100) 
    : 0;

  const getStatusLabel = (status: Book['status']) => {
    switch (status) {
      case 'currently-reading': return 'Reading';
      case 'completed': return 'Finished';
      case 'want-to-read': return 'To Read';
      case 'owned': return 'Owned';
    }
  };

  const getStatusColor = (status: Book['status']) => {
    switch (status) {
      case 'currently-reading': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'completed': return 'bg-brand-success/10 text-brand-success border-brand-success/20';
      case 'want-to-read': return 'bg-brand-warning/10 text-brand-warning border-brand-warning/20';
      case 'owned': return 'bg-white/4 text-text-secondary border-white/6';
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
      <div 
        onClick={() => onSelect(book)}
        className="group relative flex flex-col justify-between p-4 rounded-lg bg-bg-tertiary border border-border-neutral hover:border-border-neutral-hover hover:-translate-y-0.5 active:scale-99 transition-all cursor-pointer h-full"
      >
        <div className="flex flex-col gap-3">
          {/* Cover Placeholder or Cover Image */}
          <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-bg-secondary border border-border-neutral flex items-center justify-center shadow-sm">
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-3xl font-extrabold text-white/10 select-none">{book.title[0]}</span>
            )}
            
            {/* Status Badge */}
            <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(book.status)}`}>
              {getStatusLabel(book.status)}
            </span>

            {/* Quick Session Play Overlay */}
            {book.status === 'currently-reading' && onStartSession && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onStartSession(book.id);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Start reading session"
              >
                <div className="w-12 h-12 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </button>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-text-primary line-clamp-1 group-hover:text-brand-primary transition-colors">{book.title}</h3>
            <p className="text-xs text-text-secondary mt-0.5">{book.author}</p>
          </div>
        </div>

        {/* Progress Fill Indicator or Ratings */}
        <div className="mt-4 pt-3 border-t border-border-neutral flex flex-col gap-1.5">
          {book.status !== 'want-to-read' && book.status !== 'owned' ? (
            <>
              <div className="w-full h-1 bg-white/4 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-semibold text-text-secondary">
                <span>{book.currentPage} / {book.totalPages} pages</span>
                <span>{progressPercent}%</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-text-tertiary">{book.totalPages} pages</span>
              {book.rating > 0 && (
                <div className="flex gap-0.5 text-brand-warning">
                  {Array.from({ length: book.rating }).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-current" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SwipeContainer>
  );
};
