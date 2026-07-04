import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveSession {
  bookId: string;
  startTime: number; // timestamp
  elapsedSeconds: number;
  isPaused: boolean;
}

interface BookState {
  activeSession: ActiveSession | null;
  startSession: (bookId: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  tickSession: () => void;
  clearSession: () => void;
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      activeSession: null,
      startSession: (bookId) => set({
        activeSession: {
          bookId,
          startTime: Date.now(),
          elapsedSeconds: 0,
          isPaused: false
        }
      }),
      pauseSession: () => set((state) => {
        if (!state.activeSession) return {};
        return { activeSession: { ...state.activeSession, isPaused: true } };
      }),
      resumeSession: () => set((state) => {
        if (!state.activeSession) return {};
        return { activeSession: { ...state.activeSession, isPaused: false } };
      }),
      tickSession: () => set((state) => {
        if (!state.activeSession || state.activeSession.isPaused) return {};
        return {
          activeSession: {
            ...state.activeSession,
            elapsedSeconds: state.activeSession.elapsedSeconds + 1
          }
        };
      }),
      clearSession: () => set({ activeSession: null })
    }),
    {
      name: 'bookvault-session-storage',
    }
  )
);
