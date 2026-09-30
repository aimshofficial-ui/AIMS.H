import React, { useEffect } from 'react';
import { 
  Target, 
  Zap, 
  FolderKanban, 
  Tv, 
  Flame, 
  MessageSquare, 
  Users,
  Activity,
  User
} from 'lucide-react';
import { motion } from 'motion/react';

export type BottomTabId = 'missions' | 'analytics' | 'partners' | 'skills' | 'drive' | 'media' | 'habits' | 'chat' | 'profile';

export interface TabConfig {
  id: BottomTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  shortcut: string;
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
  const tabs: TabConfig[] = [
    {
      id: 'missions',
      label: 'Missions',
      icon: Target,
      color: 'indigo',
      activeBg: 'bg-indigo-50/90',
      activeBorder: 'border-indigo-200/90',
      activeText: 'text-indigo-600',
      shortcut: '1',
      badge: missionCount > 0 ? missionCount : null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Activity,
      color: 'cyan',
      activeBg: 'bg-cyan-50/90',
      activeBorder: 'border-cyan-200/90',
      activeText: 'text-cyan-600',
      shortcut: '2',
    },
    {
      id: 'partners',
      label: 'Partners',
      icon: Users,
      color: 'blue',
      activeBg: 'bg-blue-50/90',
      activeBorder: 'border-blue-200/90',
      activeText: 'text-blue-600',
      shortcut: '3',
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      dot: !isPartnerConnected,
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: Zap,
      color: 'violet',
      activeBg: 'bg-violet-50/90',
      activeBorder: 'border-violet-200/90',
      activeText: 'text-violet-600',
      shortcut: '4',
    },
    {
      id: 'drive',
      label: 'Drive',
      icon: FolderKanban,
      color: 'blue',
      activeBg: 'bg-blue-50/90',
      activeBorder: 'border-blue-200/90',
      activeText: 'text-blue-600',
      shortcut: '5',
    },
    {
      id: 'media',
      label: 'Media',
      icon: Tv,
      color: 'rose',
      activeBg: 'bg-rose-50/90',
      activeBorder: 'border-rose-200/90',
      activeText: 'text-rose-600',
      shortcut: '6',
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: Flame,
      color: 'amber',
      activeBg: 'bg-amber-50/90',
      activeBorder: 'border-amber-200/90',
      activeText: 'text-amber-600',
      shortcut: '7',
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      color: 'emerald',
      activeBg: 'bg-emerald-50/90',
      activeBorder: 'border-emerald-200/90',
      activeText: 'text-emerald-600',
      shortcut: '8',
      badge: messageCount > 0 ? messageCount : null,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      color: 'indigo',
      activeBg: 'bg-indigo-50/90',
      activeBorder: 'border-indigo-200/90',
      activeText: 'text-indigo-600',
      shortcut: '9',
    },
  ];

  // Quick keyboard shortcuts (1 to 9) to switch tabs effortlessly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.getAttribute('contenteditable')) {
        return;
      }
      const keyMap: Record<string, BottomTabId> = {
        '1': 'missions',
        '2': 'analytics',
        '3': 'partners',
        '4': 'skills',
        '5': 'drive',
        '6': 'media',
        '7': 'habits',
        '8': 'chat',
        '9': 'profile',
      };
      if (keyMap[e.key]) {
        onSelectTab(keyMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <nav className="bottom-nav-bar rounded-2xl sm:rounded-full p-1 sm:p-1.5 px-2 flex items-center justify-between shadow-2xl shadow-slate-900/10 border border-slate-200/90 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative shrink-0 flex-1 min-w-[50px] sm:min-w-0 py-1.5 px-1 rounded-xl sm:rounded-full flex flex-col items-center justify-center transition-all duration-200 select-none cursor-pointer group active:scale-95 ${
                  isActive
                    ? `${tab.activeText} font-bold`
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/70'
                }`}
                title={`${tab.label} (Press ${tab.shortcut})`}
              >
                {/* Active Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className={`absolute inset-0 ${tab.activeBg} border ${tab.activeBorder} rounded-xl sm:rounded-full -z-10 shadow-xs`}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="relative">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  {/* Badge */}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  )}

                  {/* Alert dot */}
                  {tab.dot && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white animate-pulse" />
                  )}
                </div>

                <span className="text-[9px] sm:text-[10px] tracking-tight truncate max-w-full font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
