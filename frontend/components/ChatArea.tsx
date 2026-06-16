"use client";

import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { Sparkles, MessageCircle, Lightbulb, Code } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatAreaProps {
  messages: Array<{ role: 'user' | 'assistant'; content: string; image?: string }>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
          <Sparkles size={32} className="text-brand-primary" />
        </div>
        <h1 className="text-3xl font-semibold mb-8 text-white tracking-tight">{t('howCanIHelp')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
          <div className="p-4 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-all text-left group">
            <Lightbulb size={20} className="text-yellow-500 mb-3" />
            <h3 className="text-sm font-medium text-text-main group-hover:text-white">{t('explainQuantum')}</h3>
            <p className="text-xs text-text-muted">{t('simpleTerms')}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-all text-left group">
            <Code size={20} className="text-blue-500 mb-3" />
            <h3 className="text-sm font-medium text-text-main group-hover:text-white">{t('writePython')}</h3>
            <p className="text-xs text-text-muted">{t('automateEmails')}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-all text-left group">
            <MessageCircle size={20} className="text-green-500 mb-3" />
            <h3 className="text-sm font-medium text-text-main group-hover:text-white">{t('brainstormNames')}</h3>
            <p className="text-xs text-text-muted">{t('coffeeShop')}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-all text-left group">
            <Sparkles size={20} className="text-purple-500 mb-3" />
            <h3 className="text-sm font-medium text-text-main group-hover:text-white">{t('planTrip')}</h3>
            <p className="text-xs text-text-muted">{t('tokyoBudget')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto scroll-smooth pb-4"
    >
      <div className="flex flex-col">
        {messages.map((msg, index) => (
          <MessageItem key={index} message={msg} />
        ))}
      </div>
    </div>
  );
};

export default ChatArea;
