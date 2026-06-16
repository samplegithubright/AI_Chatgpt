"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Access denied');
      }

      const data = await response.json();
      localStorage.setItem('admin_token', data.access_token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 font-sans selection:bg-brand-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl mb-6 group transition-all hover:border-brand-primary/50">
            <ShieldCheck size={32} className="text-brand-primary group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Admin Access</h1>
          <p className="text-text-muted">Enter your credentials to manage the platform</p>
        </div>

        <div className="bg-[#111113] border border-white/5 rounded-[32px] p-10 shadow-2xl shadow-black/50">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl text-center mb-6 animate-shake">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Admin Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@llmgpt.com"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Secure Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-inner"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-[56px] bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 disabled:opacity-50 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Authenticate
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-text-muted">
            Restricted Area. All activities are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
