"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (token) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, [pathname, router]);

  if (loading) return <div className="min-h-screen bg-bg-main flex items-center justify-center text-white">Loading...</div>;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Chat History', href: '/admin/history', icon: MessageSquare },
    { name: 'Settings', href: '/admin/setting', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex font-sans">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#111113] border-r border-white/5 transition-transform duration-300 ease-in-out transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
              <ShieldCheck className="text-brand-primary" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Admin Portal</h2>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Super User Access</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]' 
                      : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#111113]/50 backdrop-blur-xl sticky top-0 z-40">
          <button 
            className="lg:hidden p-2 -ml-2 text-text-muted hover:text-white transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">System Administrator</p>
              <p className="text-[10px] text-text-muted">Online • Healthy</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-purple-500 flex items-center justify-center text-[10px] font-bold">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}
    </div>
  );
}
