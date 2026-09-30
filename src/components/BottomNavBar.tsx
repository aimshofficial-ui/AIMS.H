import React, { useEffect } from 'react';
import { 
  Target, 
  Zap, 
  FolderKanban, 
  Tv, 
  Flame, 
  MessageSquare, 
  Users, 
  Video,
  Activity, 
  User,
  Calendar,
  Home,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';

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
  // Primary core navigation with clean line-art icons
  const primaryTabs: TabConfig[] = [
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
      id: 'skills',
      label: 'Skills',
      icon: Zap,
    },
    {
      id: 'drive',
      label: 'Drive',
      icon: FolderKanban,
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: Flame,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      badge: messageCount > 0 ? messageCount : null,
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
    },
    {
      id: 'partners',
      label: 'Partner',
      icon: Users,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      dot: !isPartnerConnected,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  // Quick keyboard shortcuts (1 to 6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.getAttribute('contenteditable')) {
        return;
      }
      const keyMap: Record<string, BottomTabId> = {
        '1': 'missions',
        '2': 'meetings',
        '3': 'skills',
        '4': 'drive',
        '5': 'habits',
        '6': 'search',
        '7': 'partners',
        '8': 'profile',
      };
      if (keyMap[e.key]) {
        onSelectTab(keyMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2.5 sm:p-4 pointer-events-none font-sans">
      <div className="max-w-md mx-auto pointer-events-auto">
        {/* Floating Bottom Navigation Bar (#FFFFFF with rounded-full, elevated soft drop shadow) */}
        <nav className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full p-1.5 px-2.5 flex items-center justify-between shadow-2xl shadow-slate-900/10">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative py-2 px-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/25 scale-105'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
                title={tab.label}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  
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

                {isActive && (
                  <span className="text-[9px] font-black tracking-tight mt-0.5 leading-none">
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
