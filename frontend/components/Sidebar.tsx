"use client";

import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  PanelLeftClose, 
  PanelLeft, 
  MoreHorizontal,
  Trash2,
  User
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions?: any[];
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  currentSessionId?: string | null;
  userEmail?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  sessions = [], 
  onNewChat, 
  onSelectChat,
  onDeleteChat,
  currentSessionId,
  userEmail
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Backdrop */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-bg-sidebar border border-white/10 text-text-muted hover:text-white transition-colors"
        >
          <PanelLeft size={20} />
        </button>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-[260px] bg-bg-sidebar border-r border-white/5 
        transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:opacity-0'}
      `}>
        {/* Header: New Chat & Toggle */}
        <div className="p-3 flex items-center gap-2">
          <button 
            onClick={onNewChat}
            className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-200 text-sm font-medium text-white group"
          >
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-black group-hover:scale-110 transition-transform">
              <Plus size={14} strokeWidth={3} />
            </div>
            {t('newChat')}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2.5 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-all hidden md:block"
            title="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div>
            <h3 className="px-3 text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">{t('recentChats')}</h3>
            <div className="space-y-1">
              {sessions.length > 0 ? sessions.map((session) => (
                <div 
                  key={session.id} 
                  onClick={() => onSelectChat && onSelectChat(session.id)}
                  className={`sidebar-item group cursor-pointer ${currentSessionId === session.id ? 'bg-white/10 text-white' : ''}`}
                >
                  <MessageSquare size={16} className={`${currentSessionId === session.id ? 'text-white' : 'text-text-muted'} group-hover:text-white transition-colors`} />
                  <span className="flex-1 truncate text-sm">{session.title}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteChat) onDeleteChat(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-400 transition-all rounded-md hover:bg-white/10"
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              )) : (
                <p className="px-3 text-xs text-text-muted italic">{t('noRecentChats')}</p>
              )}
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-white/5 bg-bg-sidebar/50">
          <div className="sidebar-item !py-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/20">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userEmail ? userEmail.split('@')[0] : t('guest')}</p>
              <p className="text-[11px] text-text-muted truncate">{userEmail ? t('freePlan') : t('notLoggedIn')}</p>
            </div>
            <Settings size={16} className="text-text-muted hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
