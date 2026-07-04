'use client';

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, User, Bell, Shield, Info, Laptop } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of BookVault?')) {
      // Clear HTTP cookie by calling refresh endpoint with invalid tokens or clearing client tokens
      clearAuth();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto py-4 px-2 md:px-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Settings</h2>
        <p className="text-xs text-text-secondary mt-0.5">Manage your user profile and preferences</p>
      </header>

      {/* Profile summary card */}
      <section className="p-5 rounded-lg bg-bg-secondary border border-border-neutral flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{user?.email || 'Reader'}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mt-0.5">Role: {user?.role || 'User'}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-brand-danger/10 border border-brand-danger/20 hover:bg-brand-danger/25 text-brand-danger transition-colors active:scale-95 shadow-md"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </section>

      {/* Settings list widget */}
      <section className="rounded-lg bg-bg-secondary border border-border-neutral divide-y divide-border-neutral overflow-hidden text-xs text-text-secondary">
        <div className="flex items-center justify-between p-4 hover:bg-white/1 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Bell className="w-4.5 h-4.5 text-brand-primary" />
            <div>
              <p className="font-bold text-text-primary">Daily Reading Reminders</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Receive PWA alerts to keep your streaks active</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-brand-primary">Enabled</span>
        </div>

        <div className="flex items-center justify-between p-4 hover:bg-white/1 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Laptop className="w-4.5 h-4.5 text-brand-success" />
            <div>
              <p className="font-bold text-text-primary">OLED Dark Mode</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Default slate-matte interface configuration</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-brand-success">Always On</span>
        </div>

        <div className="flex items-center justify-between p-4 hover:bg-white/1 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Shield className="w-4.5 h-4.5 text-brand-warning" />
            <div>
              <p className="font-bold text-text-primary">Privacy & Accounts</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Manage secure tokens, passwords, and sessions</p>
            </div>
          </div>
          <span className="text-text-tertiary">➔</span>
        </div>

        <div className="flex items-center justify-between p-4 hover:bg-white/1 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Info className="w-4.5 h-4.5 text-text-tertiary" />
            <div>
              <p className="font-bold text-text-primary">BookVault Build Info</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Version 1.2.0 • Handcrafted PWA Native Wrapper</p>
            </div>
          </div>
          <span className="text-text-tertiary">Stable</span>
        </div>
      </section>
    </div>
  );
};
