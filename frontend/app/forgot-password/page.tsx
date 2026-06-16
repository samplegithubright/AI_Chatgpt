"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, Loader2, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to send OTP');
      }

      const data = await response.json();
      setMessage(data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to reset password');
      }

      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-4 font-sans">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[400px] animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-2xl">
            <KeyRound size={24} className="text-brand-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-text-muted mt-2 text-center">
            {step === 1 
              ? "Enter your email to receive a verification code" 
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        <div className="glass-effect rounded-3xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-2 px-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm py-2 px-4 rounded-xl text-center">
              {message}
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleRequestOtp}>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-all transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Code'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase ml-1">Verification Code</label>
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all tracking-[0.5em] text-center font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-all transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Reset Password'}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full bg-transparent text-text-muted text-sm hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} /> Back to email
              </button>
            </form>
          )}

          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-text-muted hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
