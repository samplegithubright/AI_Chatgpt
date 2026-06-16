"use client";

import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MessageItemProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
  };
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { t } = useLanguage();

  return (
    <div className={`w-full py-8 flex justify-center animate-fade-in ${isUser ? '' : 'bg-white/[0.02]'}`}>
      <div className="max-w-3xl w-full px-4 md:px-6 flex gap-4 md:gap-6">
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border
          ${isUser 
            ? 'bg-white/10 border-white/10 text-white' 
            : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
          }
        `}>
          {isUser ? <User size={18} /> : <Sparkles size={18} />}
        </div>

        {/* Content Area */}
        <div className="flex-1 pt-1.5 space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-tight mb-1">
            {isUser ? t('you') : t('assistant')}
          </p>
          {message.image && (
            <div className="mb-3 max-w-sm rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <img src={message.image} alt="Uploaded" className="w-full h-auto object-contain" />
            </div>
          )}
          <div className="text-[15px] leading-relaxed text-text-main whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
