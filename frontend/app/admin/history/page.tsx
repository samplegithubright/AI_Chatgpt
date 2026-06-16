"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Search, User, Clock, Hash } from "lucide-react";

interface ChatMessage {
  _id: string;
  user_email: string;
  role: string;
  content: string;
  timestamp: string;
  session_id: string;
}

export default function AdminHistoryPage() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:8000/admin/all-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter(msg => 
    msg.user_email.toLowerCase().includes(search.toLowerCase()) || 
    msg.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Chat Monitor</h1>
          <p className="text-text-muted mt-1">Monitor real-time interactions across the platform</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by user or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111113] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all w-full sm:w-80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-text-muted italic">Decrypting system logs...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-20 text-text-muted">No interactions found matching your search.</div>
        ) : (
          filteredHistory.map((msg) => (
            <div key={msg._id} className="bg-[#111113] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${msg.role === 'user' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <MessageSquare size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white capitalize">{msg.role}</p>
                      <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 flex items-center gap-1">
                        <Hash size={10} />
                        {msg.session_id ? msg.session_id.slice(0, 8) : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{msg.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
                  <Clock size={12} />
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
