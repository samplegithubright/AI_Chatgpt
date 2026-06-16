"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import { LogOut, Languages, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/i18n/translations";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const { t, language, setLanguage } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const router = useRouter();

  const fetchSessions = (token: string) => {
    fetch("http://localhost:8000/sessions", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        handleLogout();
        return [];
      }
      return res.ok ? res.json() : [];
    })
    .then(data => setSessions(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('user_email');
    if (token) {
      setIsLoggedIn(true);
      if (email) setUserEmail(email);
      fetchSessions(token);
    }
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
  };

  const handleSelectChat = (sessionId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setCurrentSessionId(sessionId);
    fetch(`http://localhost:8000/history/${sessionId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        handleLogout();
        return [];
      }
      return res.ok ? res.json() : [];
    })
    .then(data => {
      setMessages(data.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })));
    })
    .catch(err => console.error(err));
  };

  const handleDeleteChat = async (sessionId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        if (currentSessionId === sessionId) {
          handleNewChat();
        }
        fetchSessions(token);
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    setIsLoggedIn(false);
    setUserEmail('');
    setMessages([]);
    setSessions([]);
    setCurrentSessionId(null);
  };


  const handleSendMessage = async (content: string, image?: string, fileContent?: string) => {
    if ((!content.trim() && !image && !fileContent) || isLoading) return;

    // Add user message to UI immediately
    const userMessage = { role: 'user' as const, content, image };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    // Create a placeholder for the assistant response
    let assistantMessageContent = "";
    
    try {
      const token = localStorage.getItem('token');
      const headers: any = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
          session_id: currentSessionId,
          image: image,
          file_content: fileContent
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
            handleLogout();
            throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to connect to AI");
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error("No reader available");

      // Add the assistant message to the list
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process each complete SSE message
        let parts = buffer.split('\n\n');
        buffer = parts.pop() || ""; // Keep the last incomplete part in buffer
        
        for (const part of parts) {
          if (part.startsWith('data: ')) {
            try {
              const data = JSON.parse(part.slice(6).trim());
              
              if (data.session_id && currentSessionId !== data.session_id) {
                setCurrentSessionId(data.session_id);
                if (token) {
                  fetchSessions(token);
                }
              }
              
              if (data.tool) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    // We can use a special marker or state here
                    lastMessage.content = `_Action: ${data.tool}..._\n\n` + lastMessage.content;
                  }
                  return newMessages;
                });
              }
              
              if (data.content) {
                assistantMessageContent += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    // If we had an action marker, we might want to clean it or just append
                    // For now, let's just ensure we don't double up or make it messy
                    lastMessage.content = assistantMessageContent;
                  }
                  return newMessages;
                });
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error("Error parsing stream chunk:", e);
            }
          }
        }
      }

    } catch (error: any) {
      console.error("Error calling AI backend:", error);
      setMessages(prev => {
        const newMsgs = [...prev];
        const last = newMsgs[newMsgs.length - 1];
        if (last && last.role === 'assistant' && last.content === '') {
          last.content = error.message || "Sorry, I'm having trouble connecting.";
        } else {
          newMsgs.push({ 
            role: 'assistant', 
            content: error.message || "Sorry, I'm having trouble connecting to my brain right now." 
          });
        }
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-bg-main overflow-hidden font-sans">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        sessions={sessions}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        currentSessionId={currentSessionId}
        userEmail={userEmail}
      />



      {/* Main Chat Container */}
      <div className={`
        flex-1 flex flex-col h-full transition-all duration-300 ease-in-out relative
        ${isSidebarOpen ? 'md:ml-0' : 'md:ml-0'}
      `}>
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-bg-main/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle Placeholder (Space reserved) */}
            <div className="w-8 md:hidden" /> 
            <h1 className="text-sm font-semibold text-white hidden md:block">{t('title')}</h1>
            <h1 className="text-sm font-semibold text-white md:hidden">Chat</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-main hover:bg-white/5 transition-all"
              >
                <Languages size={16} className="text-brand-primary" />
                <span className="uppercase">{language}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-32 glass-effect rounded-xl overflow-hidden border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    {(['en', 'hi'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${language === lang ? 'text-brand-primary font-bold bg-white/5' : 'text-text-main'}`}
                      >
                        {lang === 'en' ? 'English' : 'Hindi'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/history" className="text-sm text-brand-primary hover:underline">
                  {t('viewHistory')}
                </Link>
                <span className="text-xs text-text-muted hidden sm:block">{userEmail}</span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-1.5 rounded-lg text-sm font-medium text-text-main hover:bg-white/5 transition-all">
                  {t('login')}
                </Link>
                <Link href="/signup" className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 transition-all shadow-lg shadow-white/5">
                  {t('signup')}
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Messaging Area */}
        <ChatArea messages={messages} />

        {/* Input Area */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </main>
  );
}
