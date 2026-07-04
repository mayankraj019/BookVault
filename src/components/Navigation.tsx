'use client';

import React from 'react';
import { useBookStore } from '../store/useBookStore';
import { 
  BookOpen, 
  Library as LibraryIcon, 
  BarChart2, 
  Sparkles, 
  Settings, 
  Timer
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
  openFocusMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, openFocusMode }) => {
  const activeSession = useBookStore((state) => state.activeSession);
  const isTimerTicking = activeSession && !activeSession.isPaused;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'library', label: 'Library', icon: LibraryIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'ai-space', label: 'AI Space', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Floating Sidebar */}
      <aside className="hidden lg:flex fixed top-6 bottom-6 left-6 w-64 glass-surface rounded-lg p-6 flex-col justify-between z-40 h-[calc(100vh-48px)] shadow-lg">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-lg bg-brand-primary/10 border border-border-neutral flex items-center justify-center text-brand-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">BookVault</h1>
          </div>

          <nav className="flex flex-col gap-1.5" aria-label="Desktop sidebar navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-primary/15 text-brand-primary border-l-2 border-brand-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/3'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Active Timer Widget */}
        {activeSession && (
          <button 
            onClick={openFocusMode}
            className="flex items-center justify-between p-3.5 rounded-md bg-brand-primary/10 border border-brand-primary/20 hover:border-brand-primary/40 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                {isTimerTicking && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isTimerTicking ? 'bg-brand-success' : 'bg-brand-warning'}`}></span>
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">Active Reading Session</p>
                <p className="text-[10px] text-text-secondary">
                  {Math.floor(activeSession.elapsedSeconds / 60)}m {activeSession.elapsedSeconds % 60}s elapsed
                </p>
              </div>
            </div>
            <Timer className="w-4 h-4 text-brand-primary" />
          </button>
        )}
      </aside>

      {/* Mobile Floating Bottom Nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 glass-surface rounded-lg px-6 flex justify-around items-center z-40 shadow-lg" aria-label="Mobile bottom navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full transition-all ${
                isActive ? 'text-brand-primary scale-105' : 'text-text-secondary'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[9px] font-medium tracking-wide">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* Mobile Quick Focus Session Button */}
        {activeSession && (
          <button
            onClick={openFocusMode}
            aria-label="Open active focus timer session panel"
            className="absolute -top-12 right-4 w-10 h-10 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center shadow-lg border border-brand-primary/40 active:scale-95"
          >
            <Timer className="w-4.5 h-4.5 animate-pulse" aria-hidden="true" />
          </button>
        )}
      </nav>
    </>
  );
};
