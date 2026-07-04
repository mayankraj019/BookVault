'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { Book, ReadingSession } from '../types';
import { CircularProgress } from '../components/CircularProgress';
import { BookOpen, Calendar, Flame, Target, TrendingUp } from 'lucide-react';

interface DashboardProps {
  onStartSession: (bookId: string) => void;
  setView: (view: string) => void;
}

interface AnalyticsData {
  totalPagesRead: number;
  totalDurationSeconds: number;
  totalSessions: number;
  currentStreak: number;
  history: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartSession, setView }) => {
  // Query books catalog
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: () => apiRequest<Book[]>('/books'),
  });

  // Query analytics stats
  const { data: analytics = { totalPagesRead: 0, totalDurationSeconds: 0, totalSessions: 0, currentStreak: 0, history: [] } } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: () => apiRequest<AnalyticsData>('/sessions/analytics'),
  });

  // Query recent sessions
  const { data: sessions = [] } = useQuery<ReadingSession[]>({
    queryKey: ['sessions'],
    queryFn: () => apiRequest<ReadingSession[]>('/sessions'),
  });

  const activeBook = books.find((b) => b.status === 'currently-reading');
  const wantToReadBooks = books.filter((b) => b.status === 'want-to-read').slice(0, 3);

  // Compute albedo albedo targets (mock goals, customizable later)
  const yearlyTarget = 12;
  const completedBooksCount = books.filter((b) => b.status === 'completed').length;
  const monthlyPagesTarget = 300;
  const currentMonthPagesRead = analytics.totalPagesRead % monthlyPagesTarget;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-4 px-2 md:px-6">
      {/* Date & Greeting header */}
      <header className="flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">Welcome Reader</h2>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Continue Reading Hero Section */}
        <section className="md:col-span-2 p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col justify-between min-h-[220px]">
          {activeBook ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 h-full">
              <div className="flex items-center gap-5">
                <div className="w-20 aspect-[2/3] rounded bg-bg-tertiary overflow-hidden border border-border-neutral flex-shrink-0 shadow-md">
                  {activeBook.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeBook.coverUrl} alt={activeBook.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white/10">{activeBook.title[0]}</div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-primary">Continue Reading</span>
                  <h3 className="text-lg font-bold text-text-primary line-clamp-1">{activeBook.title}</h3>
                  <p className="text-xs text-text-secondary">by {activeBook.author}</p>
                  <p className="text-xs text-text-tertiary mt-2">Page {activeBook.currentPage} of {activeBook.totalPages}</p>
                  <button 
                    onClick={() => onStartSession(activeBook.id)}
                    className="flex items-center gap-2 mt-4 px-4 py-2 text-xs font-semibold rounded-md bg-brand-primary text-text-inverse hover:bg-brand-primary-hover active:scale-95 self-start shadow-md"
                  >
                    <BookOpen className="w-3.5 h-3.5 fill-current" />
                    Continue Reading
                  </button>
                </div>
              </div>
              
              {/* Circular Progress Ring */}
              <div className="flex-shrink-0 self-center sm:self-auto pr-2">
                <CircularProgress
                  value={activeBook.currentPage}
                  max={activeBook.totalPages}
                  size={96}
                  strokeWidth={8}
                  color="var(--color-brand-primary)"
                  label={`${Math.round((activeBook.currentPage / activeBook.totalPages) * 100)}%`}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-6 h-full w-full">
              <span className="text-3xl">📚</span>
              <h3 className="text-sm font-bold text-text-primary">No active books currently reading</h3>
              <p className="text-xs text-text-secondary max-w-xs">Start a session or select a book in your library to log focused reading sessions.</p>
              <button 
                onClick={() => setView('library')}
                className="mt-2 px-4 py-2 text-xs font-semibold rounded-md bg-white/4 border border-border-neutral text-text-secondary hover:text-text-primary hover:bg-white/8"
              >
                Go to Library
              </button>
            </div>
          )}
        </section>

        {/* Goals Progress Card */}
        <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-brand-primary" />
              Activity Goals
            </h3>
          </div>
          <div className="flex justify-around items-center py-2">
            <CircularProgress
              value={completedBooksCount}
              max={yearlyTarget}
              color="var(--color-brand-primary)"
              label={`${completedBooksCount}/${yearlyTarget}`}
              subLabel="Books Finished"
            />
            <CircularProgress
              value={currentMonthPagesRead}
              max={monthlyPagesTarget}
              color="var(--color-brand-success)"
              label={`${currentMonthPagesRead}`}
              subLabel="Pages Read"
            />
          </div>
        </section>

        {/* Daily Streak Card */}
        <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-brand-success" />
            Reading Streak
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold text-brand-success">🔥 {analytics.currentStreak}</span>
            <div>
              <p className="text-xs font-bold text-text-primary">Consecutive Days</p>
              <p className="text-[10px] text-text-secondary">Keep the daily habit alive by logging pages read every day.</p>
            </div>
          </div>
          {/* Simple Streak calendar grid indicators (last 5 days) */}
          <div className="flex gap-2.5 mt-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = new Date();
              day.setDate(day.getDate() - (6 - i));
              const dayStr = day.toISOString().split('T')[0];
              const isStreakDay = analytics.history.includes(dayStr);
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[8px] font-semibold text-text-tertiary">
                    {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                  <div className={`w-full aspect-square rounded-sm border flex items-center justify-center transition-all ${
                    isStreakDay 
                      ? 'bg-brand-success/15 border-brand-success text-brand-success' 
                      : 'bg-white/1 border-border-neutral text-text-tertiary'
                  }`}>
                    {isStreakDay && <span className="text-[8px]">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Session Activity List */}
        <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-4 md:col-span-2">
          <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            Recent Sessions
          </h3>
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
            {sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="flex justify-between items-center p-3 rounded bg-bg-tertiary border border-border-neutral">
                <div>
                  <h4 className="text-xs font-bold text-text-primary line-clamp-1">{s.book?.title || 'Unknown Title'}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">Read {s.pagesRead} pages in {Math.round(s.durationSeconds / 60)} mins</p>
                </div>
                <span className="text-[9px] font-medium text-text-tertiary">
                  {new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-6 text-xs text-text-tertiary">No reading session logs recorded yet.</div>
            )}
          </div>
        </section>

        {/* Upcoming List Section */}
        <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-warning" />
            Up Next (To Read)
          </h3>
          <div className="flex flex-col gap-2.5">
            {wantToReadBooks.map((b) => (
              <div key={b.id} onClick={() => setView('library')} className="flex items-center gap-3 p-2.5 rounded bg-bg-tertiary border border-border-neutral hover:border-brand-warning/30 transition-all cursor-pointer">
                <div className="w-7 aspect-[2/3] rounded bg-bg-secondary flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white/5 border border-border-neutral">
                  {b.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    b.title[0]
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text-primary truncate">{b.title}</h4>
                  <p className="text-[10px] text-text-secondary truncate">by {b.author}</p>
                </div>
              </div>
            ))}
            {wantToReadBooks.length === 0 && (
              <div className="text-center py-6 text-xs text-text-tertiary">No books in Want to Read queue.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
