"use client";

import React, { useEffect, useState } from "react";
import { 
  Settings, 
  Save, 
  Globe, 
  Cpu, 
  ShieldAlert, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Palette,
  Bot,
  Zap,
  Users,
  Layout,
  Terminal
} from "lucide-react";

interface SettingsData {
  system_name: string;
  default_model: string;
  maintenance_mode: boolean;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  public_signup: boolean;
  brand_color: string;
}

type TabType = 'general' | 'ai' | 'security' | 'appearance';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<SettingsData>({
    system_name: "LLM GPT",
    default_model: "ministral-3:8b",
    maintenance_mode: false,
    system_prompt: "You are a helpful AI assistant.",
    temperature: 0.7,
    max_tokens: 2000,
    public_signup: true,
    brand_color: "#3b82f6"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:8000/admin/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setNotification(null);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('http://localhost:8000/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setNotification({ type: 'success', message: 'Registry synchronized successfully' });
      } else {
        setNotification({ type: 'error', message: 'Failed to update system registry' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Connectivity issue detected' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const tabs: {id: TabType, label: string, icon: any}[] = [
    { id: 'general', label: 'General', icon: Layout },
    { id: 'ai', label: 'AI Core', icon: Bot },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'appearance', label: 'Branding', icon: Palette },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-text-muted">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="text-sm italic animate-pulse">Decrypting system configuration...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Settings size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Control Center</h1>
          </div>
          <p className="text-text-muted text-sm font-medium">Global system registry and platform architecture configuration.</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3.5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 group"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
          Deploy Changes
        </button>
      </div>

      {notification && (
        <div className={`
          flex items-center gap-3 p-5 rounded-[24px] border-2 animate-slide-up shadow-2xl
          ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}
        `}>
          {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase tracking-tight">{notification.message}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 flex lg:flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 lg:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-brand-primary/10 text-brand-primary border-2 border-brand-primary/30 shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)]' 
                    : 'text-text-muted hover:text-white hover:bg-white/5 border-2 border-transparent'}
                `}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#111113] border-2 border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
          
          {activeTab === 'general' && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Globe className="text-brand-primary" size={20} />
                  Identity & Reach
                </h3>
                <p className="text-xs text-text-muted">Manage how the platform identifies itself to users.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Platform Name</label>
                  <input 
                    type="text" 
                    value={settings.system_name}
                    onChange={(e) => setSettings({...settings, system_name: e.target.value})}
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-[20px] py-4 px-6 text-sm text-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all shadow-inner"
                    placeholder="LLM GPT"
                  />
                </div>

                <div className="flex items-center justify-between p-6 rounded-[24px] bg-white/[0.02] border-2 border-white/5 group hover:border-brand-primary/20 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-brand-primary" />
                      <p className="text-sm font-black text-white uppercase">Public Registration</p>
                    </div>
                    <p className="text-xs text-text-muted max-w-sm">Allow new users to create accounts without an invitation.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, public_signup: !settings.public_signup})}
                    className={`
                      w-16 h-9 rounded-full relative transition-all duration-500 shadow-xl
                      ${settings.public_signup ? 'bg-brand-primary' : 'bg-white/10'}
                    `}
                  >
                    <div className={`
                      absolute top-1.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-500
                      ${settings.public_signup ? 'left-8.5' : 'left-1.5'}
                    `} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Terminal className="text-brand-primary" size={20} />
                  Intelligence Core
                </h3>
                <p className="text-xs text-text-muted">Fine-tune the behavior and constraints of the integrated AI engine.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">System Directive (Prompt)</label>
                  <textarea 
                    value={settings.system_prompt}
                    onChange={(e) => setSettings({...settings, system_prompt: e.target.value})}
                    rows={4}
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-[20px] py-4 px-6 text-sm text-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all shadow-inner resize-none"
                    placeholder="Describe how the AI should behave..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex justify-between">
                      Creativity (Temp)
                      <span className="text-brand-primary">{settings.temperature}</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                      className="w-full accent-brand-primary h-1.5 bg-white/10 rounded-full cursor-pointer appearance-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Context Length (Tokens)</label>
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input 
                        type="number" 
                        value={settings.max_tokens}
                        onChange={(e) => setSettings({...settings, max_tokens: parseInt(e.target.value)})}
                        className="w-full bg-white/[0.03] border-2 border-white/5 rounded-[20px] py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Default Model Instance</label>
                  <div className="relative">
                    <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <select 
                      value={settings.default_model}
                      onChange={(e) => setSettings({...settings, default_model: e.target.value})}
                      className="w-full bg-white/[0.03] border-2 border-white/5 rounded-[20px] py-4 pl-12 pr-10 text-sm text-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all appearance-none cursor-pointer font-bold"
                    >
                      <option value="ministral-3:8b">Ministral 3 (8B)</option>
                      <option value="llama-3:8b">Llama 3 (8B)</option>
                      <option value="gpt-4o">GPT-4o (Preview)</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ShieldAlert className="text-red-500" size={20} />
                  System Lockdown
                </h3>
                <p className="text-xs text-text-muted">High-impact security overrides and maintenance protocols.</p>
              </div>

              <div className="p-8 rounded-[32px] bg-red-500/5 border-2 border-red-500/10 space-y-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-red-400 uppercase tracking-tight">Global Maintenance Mode</p>
                    <p className="text-xs text-text-muted max-w-sm">Immediately terminate all active sessions and block new connections for standard users.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, maintenance_mode: !settings.maintenance_mode})}
                    className={`
                      w-16 h-9 rounded-full relative transition-all duration-500 shadow-xl
                      ${settings.maintenance_mode ? 'bg-red-500' : 'bg-white/10'}
                    `}
                  >
                    <div className={`
                      absolute top-1.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-500
                      ${settings.maintenance_mode ? 'left-8.5' : 'left-1.5'}
                    `} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Palette className="text-brand-primary" size={20} />
                  Visual DNA
                </h3>
                <p className="text-xs text-text-muted">Customize the aesthetic personality of the platform.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Core Identity Color</label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl border-4 border-white/10 shadow-2xl transition-transform hover:scale-110"
                      style={{ backgroundColor: settings.brand_color }}
                    />
                    <input 
                      type="text" 
                      value={settings.brand_color}
                      onChange={(e) => setSettings({...settings, brand_color: e.target.value})}
                      className="flex-1 bg-white/[0.03] border-2 border-white/5 rounded-[20px] py-4 px-6 text-sm text-white font-mono uppercase focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all shadow-inner"
                    />
                    <input 
                      type="color" 
                      value={settings.brand_color}
                      onChange={(e) => setSettings({...settings, brand_color: e.target.value})}
                      className="w-0 h-0 opacity-0 absolute"
                      id="colorPicker"
                    />
                    <button 
                      onClick={() => document.getElementById('colorPicker')?.click()}
                      className="px-6 py-4 rounded-[20px] bg-white/5 border-2 border-white/5 text-xs font-black uppercase hover:bg-white/10 transition-all"
                    >
                      Pick
                    </button>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-white/[0.02] border-2 border-white/5">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 text-center">Live Preview</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: settings.brand_color }}></div>
                    <div className="h-2 w-32 bg-white/10 rounded-full"></div>
                    <div className="h-2 w-12 bg-white/5 rounded-full ml-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
