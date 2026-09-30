import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Video, 
  MessageSquare, 
  Users, 
  Grid, 
  Zap, 
  FolderKanban, 
  Flame, 
  Search, 
  User, 
  Tv, 
  Activity, 
  Building2, 
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type BottomTabId = 'missions' | 'analytics' | 'partners' | 'skills' | 'drive' | 'media' | 'habits' | 'search' | 'chat' | 'profile' | 'meetings' | 'clients';

export interface TabConfig {
  id: BottomTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
  dot?: boolean;
}

interface BottomNavBarProps {
  activeTab: BottomTabId;
  onSelectTab: (tab: BottomTabId) => void;
  missionCount?: number;
  messageCount?: number;
  pendingRequestsCount?: number;
  isPartnerConnected?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  missionCount = 0,
  messageCount = 0,
  pendingRequestsCount = 0,
  isPartnerConnected = false,
}) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // 5 Primary Core Navigation Dock Tabs (Spacious & Clean)
  const primaryDockTabs: TabConfig[] = [
    {
      id: 'missions',
      label: 'Home',
      icon: Home,
      badge: missionCount > 0 ? missionCount : null,
    },
    {
      id: 'meetings',
      label: 'Meeting',
      icon: Video,
      dot: true,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      badge: messageCount > 0 ? messageCount : null,
    },
    {
      id: 'partners',
      label: 'Partner',
      icon: Users,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      dot: !isPartnerConnected,
    },
  ];

  // Secondary Tools Grid inside the Apps Sheet
  const secondaryApps: { id: BottomTabId; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'skills', label: 'Skills Matrix', icon: Zap, color: 'bg-amber-500 text-amber-950', desc: 'Co-founder skill progress' },
    { id: 'drive', label: 'Shared Drive', icon: FolderKanban, color: 'bg-indigo-500 text-indigo-950', desc: 'Client assets & files' },
    { id: 'habits', label: 'Habit Tracker', icon: Flame, color: 'bg-orange-500 text-orange-950', desc: 'Daily execution streak' },
    { id: 'clients', label: 'Client CRM', icon: Building2, color: 'bg-emerald-500 text-emerald-950', desc: 'Agency client pipeline' },
    { id: 'search', label: 'Global Search', icon: Search, color: 'bg-sky-500 text-sky-950', desc: 'Google, YouTube & Drive' },
    { id: 'media', label: 'Media Vault', icon: Tv, color: 'bg-rose-500 text-rose-950', desc: 'Reels, hooks & video vault' },
    { id: 'analytics', label: 'Analytics', icon: Activity, color: 'bg-purple-500 text-purple-950', desc: 'Performance stats' },
    { id: 'profile', label: 'Profile & Settings', icon: User, color: 'bg-slate-700 text-slate-100', desc: 'Seat details & branding' },
  ];

  const handleSelectApp = (tabId: BottomTabId) => {
    onSelectTab(tabId);
    setIsMoreSheetOpen(false);
  };

  const isSecondaryActive = secondaryApps.some((app) => app.id === activeTab);

  return (
    <>
      {/* 1. Apps & Tools Slide-Up Sheet */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-lg rounded-3xl bg-white p-5 text-slate-900 shadow-2xl border border-slate-200 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Workspace Apps & Tools</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Tap to open any tool</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Apps */}
              <div className="grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {secondaryApps.map((app) => {
                  const Icon = app.icon;
                  const isActive = activeTab === app.id;

                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleSelectApp(app.id)}
                      className={`p-3 rounded-2xl border flex items-center gap-3 transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${app.color} flex items-center justify-center shrink-0 shadow-xs font-bold`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-900 truncate">{app.label}</h4>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{app.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Primary 5-Button Dock Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-2.5 sm:p-4 pointer-events-none font-sans">
        <div className="max-w-sm mx-auto pointer-events-auto">
          <nav className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full p-1.5 px-3 flex items-center justify-between shadow-2xl shadow-slate-900/15">
            {primaryDockTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative py-2 px-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md scale-105'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                  title={tab.label}
                >
                  <div className="relative">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    
                    {/* Badge */}
                    {tab.badge && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-3.5 h-3.5 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white">
                        {tab.badge}
                      </span>
                    )}
                    {tab.dot && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full border border-white animate-pulse" />
                    )}
                  </div>

                  <span className={`text-[9px] tracking-tight mt-0.5 leading-none ${isActive ? 'font-black text-white' : 'font-semibold text-slate-500'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* Apps & Tools Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMoreSheetOpen(true)}
              className={`relative py-2 px-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSecondaryActive
                  ? 'bg-indigo-600 text-white shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
              title="More Apps & Tools"
            >
              <Grid className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" />
              <span className={`text-[9px] tracking-tight mt-0.5 leading-none ${isSecondaryActive ? 'font-black text-white' : 'font-semibold text-slate-500'}`}>
                More
              </span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};
