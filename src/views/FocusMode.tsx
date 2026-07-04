'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookStore } from '../store/useBookStore';
import { apiRequest } from '../utils/api';
import { Book } from '../types';
import { Play, Pause, X, Check } from 'lucide-react';
import { Modal } from '../components/Modal';

interface FocusModeProps {
  onClose: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const activeSession = useBookStore((state) => state.activeSession);
  const pauseSession = useBookStore((state) => state.pauseSession);
  const resumeSession = useBookStore((state) => state.resumeSession);
  const tickSession = useBookStore((state) => state.tickSession);
  const clearSession = useBookStore((state) => state.clearSession);

  const [ambientTheme, setAmbientTheme] = useState<'midnight' | 'aurora' | 'solitude'>('midnight');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // Log form states
  const [pagesRead, setPagesRead] = useState<number>(5);
  const [sessionNote, setSessionNote] = useState<string>('');

  // Fetch active book details
  const { data: book } = useQuery<Book>({
    queryKey: ['book', activeSession?.bookId],
    queryFn: () => apiRequest<Book>(`/books/${activeSession!.bookId}`),
    enabled: !!activeSession?.bookId,
  });

  // Ticking session clock using setInterval
  useEffect(() => {
    if (!activeSession || activeSession.isPaused) return;

    const timer = setInterval(() => {
      tickSession();
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, tickSession]);

  const logSessionMutation = useMutation({
    mutationFn: (data: { bookId: string; durationSeconds: number; pagesRead: number }) => 
      apiRequest('/sessions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      // If notes are entered, log note as well
      if (sessionNote.trim() && activeSession) {
        apiRequest(`/books/${activeSession.bookId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ type: 'note', content: sessionNote.trim() })
        }).catch(() => {});
      }

      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      
      clearSession();
      setShowLogModal(false);
      onClose();
    }
  });

  if (!activeSession) return null;

  const seconds = activeSession.elapsedSeconds;
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const handleCancelSession = () => {
    if (confirm('Cancel reading session? Elapsed time will not be recorded.')) {
      clearSession();
      onClose();
    }
  };

  const handleFinishSession = (e: React.FormEvent) => {
    e.preventDefault();
    logSessionMutation.mutate({
      bookId: activeSession.bookId,
      durationSeconds: activeSession.elapsedSeconds,
      pagesRead: Number(pagesRead)
    });
  };

  const getThemeBackground = () => {
    switch (ambientTheme) {
      case 'midnight':
        return 'bg-gradient-to-tr from-[#0F1115] via-[#0b0c10] to-[#121824]';
      case 'aurora':
        return 'bg-gradient-to-tr from-[#0F1115] via-[#091515] to-[#10141b]';
      case 'solitude':
        return 'bg-gradient-to-tr from-[#0F1115] via-[#14120e] to-[#0c0d0f]';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between p-6 ${getThemeBackground()} transition-all duration-700`}>
      {/* Top Header */}
      <header className="flex justify-between items-center w-full max-w-4xl mx-auto">
        <button 
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/4"
        >
          ← Minimize Timer
        </button>

        {/* Theme selectors */}
        <div className="flex bg-white/3 p-1 rounded-full border border-white/5">
          {['midnight', 'aurora', 'solitude'].map((t) => (
            <button
              key={t}
              onClick={() => setAmbientTheme(t as 'midnight' | 'aurora' | 'solitude')}
              className={`px-3.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all ${
                ambientTheme === t ? 'bg-white/8 text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Clock display section */}
      <main className="flex-1 flex flex-col justify-center items-center gap-12 max-w-lg mx-auto text-center">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Focused Reading</span>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white select-none">
            {formatTime(seconds)}
          </h1>
          {book && (
            <div className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-white/4 border border-white/6 mt-4">
              <span className="w-1.5 h-1.5 bg-brand-success rounded-full"></span>
              <p className="text-xs font-bold text-text-primary truncate max-w-[200px]">{book.title}</p>
            </div>
          )}
        </div>

        {/* Stopwatch buttons */}
        <div className="flex items-center gap-6">
          <button 
            onClick={handleCancelSession}
            className="w-12 h-12 rounded-full border border-brand-danger/20 text-brand-danger hover:bg-brand-danger/5 flex items-center justify-center active:scale-90"
            title="Cancel session"
          >
            <X className="w-5 h-5" />
          </button>

          <button 
            onClick={activeSession.isPaused ? resumeSession : pauseSession}
            className="w-16 h-16 rounded-full bg-text-primary text-text-inverse flex items-center justify-center hover:scale-104 shadow-lg active:scale-95 transition-transform"
          >
            {activeSession.isPaused ? (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            ) : (
              <Pause className="w-6 h-6 fill-current" />
            )}
          </button>

          <button 
            onClick={() => setShowLogModal(true)}
            className="w-12 h-12 rounded-full border border-brand-success/20 text-brand-success hover:bg-brand-success/5 flex items-center justify-center active:scale-90"
            title="Finish session"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Footer safe margin */}
      <footer className="text-center py-2 text-[10px] text-text-tertiary">
        Stopwatch state persists automatically. You can safely reload.
      </footer>

      {/* Log Reading Session Modal Bottom Sheet */}
      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Log Reading Session">
        {book && (
          <form onSubmit={handleFinishSession} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
            <div className="p-4 rounded-lg bg-bg-tertiary border border-border-neutral">
              <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Session Summary</p>
              <p className="text-sm font-bold text-text-primary">{book.title}</p>
              <p className="text-xs text-text-secondary mt-1">
                Completed {Math.round(activeSession.elapsedSeconds / 60)} minutes focused reading.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary">Pages Read during this session</label>
              <input 
                type="number" 
                required
                min={1}
                value={pagesRead}
                onChange={(e) => setPagesRead(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary">Add note to book notebook (Optional)</label>
              <textarea 
                placeholder="Log a key takeaway or quote..."
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                className="w-full p-3 rounded bg-bg-secondary border border-border-neutral text-xs outline-none text-text-primary placeholder:text-text-tertiary min-h-[80px]"
              />
            </div>

            <button 
              type="submit"
              disabled={logSessionMutation.isPending}
              className="mt-4 py-3 rounded bg-brand-primary hover:bg-brand-primary-hover active:scale-98 text-text-inverse font-bold shadow-lg disabled:opacity-50"
            >
              {logSessionMutation.isPending ? 'Logging Session...' : 'Log & Complete Session'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
