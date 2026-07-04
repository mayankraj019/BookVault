'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { apiRequest } from '../utils/api';
import { BookOpen, KeyRound, Mail, ShieldAlert, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { User } from '../types';

type AuthMode = 'login' | 'register' | 'verify-otp' | 'forgot' | 'reset-otp' | 'reset-password';

export const Auth: React.FC = () => {
  const { setAuth } = useAuthStore();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resetMessages = () => { setErrorMessage(null); setInfoMessage(null); };
  const resetOtp = () => setOtp(['', '', '', '', '', '']);

  // ─── OTP input handling ───────────────────────────────────────────────────
  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const next = [...otp];
    next[index] = value.slice(-1); // only last typed char
    setOtp(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  }, [otp]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  }, []);

  const otpValue = otp.join('');

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      resetOtp();
      setAuthMode('verify-otp');
      setInfoMessage('A 6-digit code has been sent to your email. Check your inbox!');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp: otpValue }),
      });
      setInfoMessage('Email verified! You can now log in.');
      setAuthMode('login');
      resetOtp();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    resetMessages();
    setIsResending(true);
    try {
      await apiRequest('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      resetOtp();
      otpRefs.current[0]?.focus();
      setInfoMessage('A new code has been sent to your email!');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      const result = await apiRequest<{ user: User; accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(result.user, result.accessToken);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      resetOtp();
      setAuthMode('reset-otp');
      setInfoMessage('A 6-digit reset code has been sent to your email!');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setErrorMessage('Please enter all 6 digits');
      return;
    }
    resetMessages();
    setAuthMode('reset-password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp: otpValue, password }),
      });
      setInfoMessage('Password reset successful! Please log in with your new password.');
      setAuthMode('login');
      resetOtp();
      setPassword('');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP Box UI ────────────────────────────────────────────────────────────
  const OtpBoxes = ({ purpose }: { purpose: 'verify' | 'reset' }) => (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] text-text-tertiary text-center leading-relaxed">
        Enter the 6-digit code sent to{' '}
        <span className="font-bold text-brand-primary">{email}</span>
      </p>
      <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { otpRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            className={`
              w-11 h-13 text-center text-xl font-bold rounded-lg border-2 outline-none
              bg-bg-secondary text-text-primary transition-all duration-150
              ${digit ? 'border-brand-primary text-brand-primary' : 'border-border-neutral'}
              focus:border-brand-primary focus:bg-bg-tertiary
            `}
            aria-label={`OTP digit ${i + 1}`}
          />
        ))}
      </div>
      {purpose === 'verify' && (
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isResending}
          className="flex items-center justify-center gap-1.5 text-[10px] text-text-tertiary hover:text-brand-primary transition-colors mx-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
          {isResending ? 'Sending…' : 'Resend Code'}
        </button>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  const titleMap: Record<AuthMode, string> = {
    login: 'Access My Vault',
    register: 'Create Account',
    'verify-otp': 'Verify Email',
    forgot: 'Reset Password',
    'reset-otp': 'Enter Reset Code',
    'reset-password': 'New Password',
  };

  const subtitleMap: Record<AuthMode, string> = {
    login: 'Welcome back, reader',
    register: 'Start your reading journey',
    'verify-otp': 'Check your inbox',
    forgot: 'We\'ll send a reset code',
    'reset-otp': 'Sent to your email',
    'reset-password': 'Choose a strong password',
  };

  return (
    <div className="flex flex-col justify-center items-center flex-1 px-4 py-12 bg-bg-primary">
      <div className="w-full max-w-sm glass-surface rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">
        {/* Brand header */}
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">BookVault</h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
              Personal Reading Companion
            </p>
          </div>
          <div className="text-center mt-1">
            <p className="text-base font-semibold text-text-primary">{titleMap[authMode]}</p>
            <p className="text-[11px] text-text-tertiary mt-0.5">{subtitleMap[authMode]}</p>
          </div>
        </header>

        {/* Alert messages */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-brand-danger/20 bg-brand-danger/5 text-brand-danger text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {infoMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-brand-success/20 bg-brand-success/5 text-brand-success text-[11px] leading-relaxed">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ── LOGIN ── */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary placeholder:text-text-tertiary"
                  placeholder="name@domain.com"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-wider">Password</label>
                <button type="button" onClick={() => { resetMessages(); setAuthMode('forgot'); }} className="text-[9px] text-brand-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="mt-2 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-text-inverse font-bold shadow-lg disabled:opacity-50 transition-all">
              {isLoading ? 'Signing in…' : 'Access My Vault'}
            </button>
            <p className="text-center text-[10px] text-text-tertiary">
              New Reader?{' '}
              <button type="button" onClick={() => { resetMessages(); setAuthMode('register'); }} className="text-brand-primary hover:underline font-bold">
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTER ── */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary placeholder:text-text-tertiary"
                  placeholder="name@domain.com"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Create Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="password" required minLength={8} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="mt-2 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-text-inverse font-bold shadow-lg disabled:opacity-50 transition-all">
              {isLoading ? 'Creating Account…' : 'Register Account'}
            </button>
            <p className="text-center text-[10px] text-text-tertiary">
              Already have a Vault?{' '}
              <button type="button" onClick={() => { resetMessages(); setAuthMode('login'); }} className="text-brand-primary hover:underline font-bold">
                Log In
              </button>
            </p>
          </form>
        )}

        {/* ── VERIFY OTP (after registration) ── */}
        {authMode === 'verify-otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <OtpBoxes purpose="verify" />
            <button type="submit" disabled={isLoading || otpValue.length !== 6}
              className="py-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-text-inverse font-bold shadow-lg disabled:opacity-50 transition-all text-sm">
              {isLoading ? 'Verifying…' : 'Verify Email'}
            </button>
            <button type="button" onClick={() => { resetMessages(); setAuthMode('login'); }}
              className="flex items-center justify-center gap-1.5 text-[10px] text-text-tertiary hover:text-text-primary transition-colors mx-auto">
              <ArrowLeft className="w-3 h-3" />
              Back to Login
            </button>
          </form>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
            <p className="text-[10px] text-text-tertiary leading-relaxed text-center font-normal">
              Enter your email and we&apos;ll send a 6-digit reset code.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary placeholder:text-text-tertiary"
                  placeholder="name@domain.com"
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="mt-2 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-text-inverse font-bold shadow-lg disabled:opacity-50 transition-all">
              {isLoading ? 'Sending Code…' : 'Send Reset Code'}
            </button>
            <button type="button" onClick={() => { resetMessages(); setAuthMode('login'); }}
              className="flex items-center justify-center gap-1.5 text-[10px] text-text-tertiary hover:text-text-primary transition-colors mx-auto">
              <ArrowLeft className="w-3 h-3" />
              Back to Login
            </button>
          </form>
        )}

        {/* ── RESET OTP verification ── */}
        {authMode === 'reset-otp' && (
          <form onSubmit={handleVerifyResetOtp} className="flex flex-col gap-5">
            <OtpBoxes purpose="reset" />
            <button type="submit" disabled={otpValue.length !== 6}
              className="py-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-text-inverse font-bold shadow-lg disabled:opacity-50 transition-all text-sm">
              Continue
            </button>
            <button type="button" onClick={() => { resetMessages(); setAuthMode('forgot'); }}
              className="flex items-center justify-center gap-1.5 text-[10px] text-text-tertiary hover:text-text-primary transition-colors mx-auto">
              <ArrowLeft className="w-3 h-3" />
              Resend Code
            </button>
          </form>
        )}

        {/* ── NEW PASSWORD (after OTP verified) ── */}
        {authMode === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="password" required minLength={8} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="mt-2 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-text-inverse font-bold shadow-lg disabled:opacity-50 transition-all">
              {isLoading ? 'Saving…' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
