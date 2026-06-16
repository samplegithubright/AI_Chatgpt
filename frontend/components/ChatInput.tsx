"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Globe, Image as ImageIcon, X, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatInputProps {
  onSendMessage: (content: string, image?: string, fileContent?: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<{ name: string, content: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() || image || fileContent) {
      onSendMessage(input, image || undefined, fileContent?.content);
      setInput('');
      setImage(null);
      setFileContent(null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDocClick = () => {
    docInputRef.current?.click();
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent({
          name: file.name,
          content: event.target?.result as string
        });
      };
      reader.readAsText(file);
    }
  };

  const removeDoc = () => {
    setFileContent(null);
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full px-4 pb-4 md:pb-8">
      <div className="max-w-3xl mx-auto relative group">
        {/* Hidden File Input for Docs */}
        <input 
          type="file" 
          ref={docInputRef} 
          onChange={handleDocChange} 
          accept=".txt,.md,.js,.py,.json,.css,.html" 
          className="hidden" 
        />

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <div className="flex flex-wrap gap-2 mb-2">
          {/* Image Preview */}
          {image && (
            <div className="p-2 glass-effect rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="relative group/img">
                <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-white/10" />
                <button 
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Doc Preview */}
          {fileContent && (
            <div className="p-2 glass-effect rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-3 pr-8 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <FileText size={20} />
              </div>
              <div className="flex flex-col max-w-[150px]">
                <span className="text-xs font-medium text-white truncate">{fileContent.name}</span>
                <span className="text-[10px] text-text-muted">Document attached</span>
              </div>
              <button 
                onClick={removeDoc}
                className="absolute top-1 right-1 p-1 text-text-muted hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Input Wrapper */}
        <div className="relative flex flex-col w-full glass-effect rounded-[26px] overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-white/10">
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? t('thinking') : t('messagePlaceholder')}
            disabled={isLoading}
            className="w-full bg-transparent border-none focus:ring-0 text-[15px] py-4 pl-4 pr-12 resize-none max-h-[200px] text-white placeholder-text-muted disabled:opacity-50"
          />

          {/* Action Row */}
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <button 
                onClick={handleDocClick}
                disabled={isLoading} 
                className={`p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 ${fileContent ? 'text-brand-primary bg-brand-primary/10' : 'text-text-muted'}`} 
                title="Attach Document"
              >
                <Plus size={18} />
              </button>
              <button 
                onClick={handleImageClick}
                disabled={isLoading} 
                className={`p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 ${image ? 'text-brand-primary bg-brand-primary/10' : 'text-text-muted'}`} 
                title="Upload Image"
              >
                <ImageIcon size={18} />
              </button>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={(!input.trim() && !image && !fileContent) || isLoading}
              className={`
                p-2 rounded-xl transition-all duration-200
                ${(input.trim() || image || fileContent) && !isLoading
                  ? 'bg-white text-black hover:bg-white/90 scale-100' 
                  : 'bg-white/10 text-white/20 cursor-not-allowed scale-95'
                }
              `}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
        
        {/* Legal/Info text */}
        <p className="text-center text-[11px] text-text-muted mt-3">
          {t('mistakesInfo')}
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
