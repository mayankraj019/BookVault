'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useBookStore } from '../store/useBookStore';
import { useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

const Auth = dynamic(() => import('../views/Auth').then((m) => m.Auth), {
  loading: () => <div className="min-h-screen flex items-center justify-center text-xs text-text-secondary">Loading secure vault...</div>
});

const Navigation = dynamic(() => import('../components/Navigation').then((m) => m.Navigation));

const Dashboard = dynamic(() => import('../views/Dashboard').then((m) => m.Dashboard), {
  loading: () => <div className="p-8 text-xs text-text-secondary">Loading dashboard...</div>
});

const Library = dynamic(() => import('../views/Library').then((m) => m.Library), {
  loading: () => <div className="p-8 text-xs text-text-secondary">Loading library...</div>
});

const FocusMode = dynamic(() => import('../views/FocusMode').then((m) => m.FocusMode), {
  loading: () => <div className="fixed inset-0 bg-black/90 backdrop-blur z-50 flex items-center justify-center text-xs text-text-secondary">Entering focus mode...</div>
});

const Analytics = dynamic(() => import('../views/Analytics').then((m) => m.Analytics), {
  loading: () => <div className="p-8 text-xs text-text-secondary">Compiling analytics...</div>
});

const AISpace = dynamic(() => import('../views/AISpace').then((m) => m.AISpace), {
  loading: () => <div className="p-8 text-xs text-text-secondary">Loading AI Space...</div>
});

const Settings = dynamic(() => import('../views/Settings').then((m) => m.Settings), {
  loading: () => <div className="p-8 text-xs text-text-secondary">Loading settings...</div>
});
import { PullToRefresh } from '../components/PullToRefresh';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  const queryClient = useQueryClient();
  const { accessToken, isOnline, setOnline } = useAuthStore();
  const activeSession = useBookStore((state) => state.activeSession);
  const startSession = useBookStore((state) => state.startSession);

  const [currentView, setView] = useState<string>('dashboard');
  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(!!activeSession);

  // Sync network state listeners
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // Pull-to-refresh sync callback
  const handleSyncData = async () => {
    queryClient.invalidateQueries();
    await new Promise((resolve) => setTimeout(resolve, 600));
  };

  const handleStartSession = (bookId: string) => {
    startSession(bookId);
    setIsFocusModeOpen(true);
  };

  // Guard Clause: Authentication
  if (!accessToken) {
    return <Auth />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onStartSession={handleStartSession} setView={setView} />;
      case 'library':
        return <Library onStartSession={handleStartSession} />;
      case 'analytics':
        return <Analytics />;
      case 'ai-space':
        return <AISpace />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onStartSession={handleStartSession} setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg-primary text-text-primary overflow-x-hidden font-sans">
      {/* Offline Banner alerts */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-brand-warning/90 backdrop-blur text-text-inverse py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
          <ShieldAlert className="w-4 h-4" />
          <span>You are currently offline. Local changes will sync when connection returns.</span>
        </div>
      )}

      {/* Floating Navigation Panels */}
      <Navigation 
        currentView={currentView} 
        setView={setView} 
        openFocusMode={() => setIsFocusModeOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 lg:pl-76 pb-20 lg:pb-6 pt-6 min-h-screen flex flex-col justify-start">
        <PullToRefresh onRefresh={handleSyncData}>
          {renderActiveView()}
        </PullToRefresh>
      </main>

      {/* Fullscreen Zen Reading mode timer overlay */}
      {isFocusModeOpen && (
        <FocusMode onClose={() => setIsFocusModeOpen(false)} />
      )}
    </div>
  );
}
