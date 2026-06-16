"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  MessageSquare, 
  Activity, 
  TrendingUp,
  Search,
  MoreVertical,
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface Stats {
  total_users: number;
  total_messages: number;
  total_sessions: number;
}

interface User {
  _id: string;
  email: string;
  name: string | null;
  created_at: string;
  is_admin: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('http://localhost:8000/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:8000/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!statsRes.ok || !usersRes.ok) throw new Error("Failed to fetch dashboard data");

        const [statsData, usersData] = await Promise.all([
          statsRes.json(),
          usersRes.json()
        ]);

        setStats(statsData);
        setUsers(usersData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-text-muted">Loading dashboard analytics...</div>;

  const statCards = [
    { name: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Total Messages', value: stats?.total_messages || 0, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Active Sessions', value: stats?.total_sessions || 0, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Growth Rate', value: '+12.5%', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">System Overview</h1>
        <p className="text-text-muted">Real-time performance metrics and user analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-[#111113] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Update 5m ago</span>
            </div>
            <p className="text-text-muted text-sm font-medium mb-1">{stat.name}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Users Table Section */}
      <div className="bg-[#111113] border border-white/5 rounded-[24px] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Users size={16} className="text-brand-primary" />
            </div>
            <h2 className="text-lg font-bold text-white">Registered Users</h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search users..."
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {user.name ? user.name[0] : (user.email ? user.email[0].toUpperCase() : '?')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{user.name || 'Anonymous'}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${user.is_admin ? 'text-brand-primary' : 'text-text-muted'}`}>
                      {user.is_admin ? 'Super Admin' : 'Standard User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-text-muted">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-center">
          <button className="text-[11px] font-bold text-text-muted hover:text-brand-primary transition-colors flex items-center gap-1 uppercase tracking-widest">
            View All Users
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111113] border border-white/5 rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">System Logs</h3>
            <button className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:underline">
              Download Logs
              <ExternalLink size={12} />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                <div className="mt-1 w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <div>
                  <p className="text-sm text-white/90">Successful user authentication</p>
                  <p className="text-[10px] text-text-muted font-medium mt-1 uppercase tracking-wider">Today, 2:4{i} PM • IP: 192.168.1.{i}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-primary/10 to-purple-600/10 border border-brand-primary/20 rounded-[24px] p-8 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/20 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">Server Status: Optimal</h3>
            <p className="text-text-muted text-sm mb-6 max-w-[280px]">All systems are operational. Average response time is 124ms.</p>
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-xl shadow-white/10 cursor-pointer hover:bg-white/90 transition-all">
                Run Diagnostics
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold cursor-pointer hover:bg-white/10 transition-all">
                View Reports
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
