"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Trash2, 
  Shield, 
  User as UserIcon,
  AlertCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";

interface User {
  _id: string;
  email: string;
  name: string | null;
  created_at: string;
  is_admin: boolean;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action will remove all their chat history.`)) return;
    
    setDeletingEmail(email);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`http://localhost:8000/admin/users/${email}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setNotification({ type: 'success', message: 'User deleted successfully' });
        setUsers(users.filter(u => u.email !== email));
      } else {
        const data = await res.json();
        setNotification({ type: 'error', message: data.detail || 'Failed to delete user' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error occurred' });
    } finally {
      setDeletingEmail(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) || 
    (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="text-brand-primary" size={32} />
            User Management
          </h1>
          <p className="text-text-muted mt-1 text-sm">Control access, monitor roles, and manage user lifecycles.</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111113] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all w-full md:w-96 shadow-lg"
          />
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`
          flex items-center gap-3 p-4 rounded-2xl border animate-slide-up
          ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}
        `}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-[#111113] border border-white/5 rounded-[28px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em]">Profile</th>
                <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em]">Registration Date</th>
                <th className="px-8 py-5 text-right text-[11px] font-bold text-text-muted uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={32} />
                    <p className="text-text-muted text-sm italic">Synchronizing user data...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-text-muted">
                    No users found matching your search criteria.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-inner relative group-hover:border-brand-primary/30 transition-colors">
                        {user.is_admin ? <Shield className="text-brand-primary" size={20} /> : <UserIcon className="text-white/40" size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">{user.name || 'Anonymous User'}</p>
                        <p className="text-xs text-text-muted font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border
                      ${user.is_admin 
                        ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]' 
                        : 'bg-white/5 border-white/10 text-text-muted'}
                    `}>
                      {user.is_admin ? 'Super Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-white/70">
                      {new Date(user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest">Global Access</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.email)}
                      disabled={deletingEmail === user.email || user.is_admin}
                      className={`
                        p-3 rounded-xl transition-all
                        ${user.is_admin 
                          ? 'opacity-20 cursor-not-allowed grayscale' 
                          : 'bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 hover:border-red-500/30 hover:scale-105 active:scale-95 shadow-lg'}
                      `}
                    >
                      {deletingEmail === user.email ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
