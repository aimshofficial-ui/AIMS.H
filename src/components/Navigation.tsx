import React from 'react';
import { 
  Target, 
  FolderKanban, 
  Zap, 
  UserCheck, 
  Tv, 
  Flame, 
  MessageSquare,
  FileText
} from 'lucide-react';

export type NavTabId = 'missions' | 'drive' | 'skills' | 'branding' | 'media' | 'habits' | 'chat';

interface NavigationProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  missionCount?: number;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  missionCount = 0,
  unreadCount = 0,
}) => {
  const tabs = [
    {
      id: 'missions' as NavTabId,
      label: 'Mission Control',
      icon: Target,
      badge: missionCount > 0 ? `${missionCount}` : undefined,
      color: 'cyan',
    },
    {
      id: 'drive' as NavTabId,
      label: 'Shared Drive & Vault',
      icon: FolderKanban,
      color: 'purple',
    },
    {
      id: 'skills' as NavTabId,
      label: 'Skill Mastery',
      icon: Zap,
      color: 'amber',
    },
    {
      id: 'branding' as NavTabId,
      label: 'Founder Branding',
      icon: UserCheck,
      color: 'pink',
    },
    {
      id: 'media' as NavTabId,
      label: 'Smart Media Hub',
      icon: Tv,
      color: 'blue',
    },
    {
      id: 'habits' as NavTabId,
      label: 'Habit Tracker',
      icon: Flame,
      color: 'emerald',
    },
    {
      id: 'chat' as NavTabId,
      label: 'Comms & Scratchpad',
      icon: MessageSquare,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      color: 'teal',
    },
  ];

  return (
    <nav className="w-full bg-[#07090e]/90 backdrop-blur-md border-b border-white/5 px-2 sm:px-6 py-2 sticky top-[57px] z-30 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-1.5 sm:gap-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 select-none ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/15'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>

              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-white/10 text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
