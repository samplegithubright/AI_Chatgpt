"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:8000/history', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    })
    .then(data => {
      setHistory(data);
    })
    .catch(err => {
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [router]);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all your chat history? This cannot be undone.')) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8000/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete history');
      
      setHistory([]);
    } catch (err: any) {
      alert(err.message || 'Failed to clear history');
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col font-sans">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <header className="h-16 flex items-center px-6 border-b border-white/5 bg-bg-main/50 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Chat</span>
        </Link>
        <h1 className="text-lg font-semibold text-white ml-auto flex items-center gap-2">
          <Clock size={18} className="text-brand-primary" />
          Chat History
        </h1>
        {history.length > 0 && !loading && (
          <button 
            onClick={handleClearHistory}
            className="ml-4 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-red-500/20"
            title="Clear all history"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Loader2 className="animate-spin mb-4 text-brand-primary" size={32} />
              <p>Loading your past conversations...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted glass-effect rounded-3xl">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-white mb-2">No history yet</h2>
              <p>Start a conversation to see it here.</p>
              <Link href="/" className="mt-6 px-6 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-all">
                Start Chatting
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((msg, idx) => (
                <div key={msg._id || idx} className={`flex gap-4 p-5 rounded-2xl ${msg.role === 'user' ? 'bg-white/5 border border-white/10' : 'bg-brand-primary/5 border border-brand-primary/20'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-brand-primary text-white'}`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white text-sm capitalize">{msg.role}</span>
                      <span className="text-xs text-text-muted">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-text-main prose prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
