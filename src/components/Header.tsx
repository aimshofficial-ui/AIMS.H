import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Download, 
  Smartphone, 
  Target,
  Zap,
  FolderKanban,
  Tv,
  Flame,
  MessageSquare,
  Activity,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Copy,
  Check,
  Search,
  Wifi,
  Signal,
  Battery,
  Calendar,
  Grid,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { SharedAppData } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadOneTimeBackup } from '../utils/storage';
import { BottomTabId } from './BottomNavBar';

interface HeaderProps {
  appData: SharedAppData;
  activeTab?: BottomTabId;
  onSelectTab?: (tab: BottomTabId) => void;
  onOpenPartnerTab: () => void;
  onOpenProfile?: () => void;
  onOpenPWAGuide: () => void;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  onLogOut?: () => void;
  missionCount?: number;
  messageCount?: number;
  pendingRequestsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  appData,
  activeTab = 'missions',
  onSelectTab,
  onOpenPartnerTab,
  onOpenProfile,
  onOpenPWAGuide,
  onOpenNotifications,
  onOpenSearch,
  onLogOut,
  missionCount = 0,
  messageCount = 0,
  pendingRequestsCount = 0,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('9:41');
  const menuRef = useRef<HTMLDivElement>(null);

  // Live time for status notch
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedHours = hours % 12 || 12;
      const formattedMins = String(minutes).padStart(2, '0');
      setCurrentTime(`${formattedHours}:${formattedMins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Formatted current date string e.g. "Today, 30 Sep"
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isMenuOpen]);

  const activeUser = appData.founders[appData.activeFounderId] || {
    name: 'Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'Co-Founder',
    inviteCode: 'AIMSH-CODE',
  };

  const isSynced = appData.partnerConnection.status === 'accepted' && 
    !!appData.partnerConnection.pairedUserId && 
    !!appData.founders[appData.partnerConnection.pairedUserId];
  const partnerUser = isSynced ? appData.founders[appData.partnerConnection.pairedUserId] : null;

  // Unread notifications calculation
  const unreadNotificationsCount = (appData.notifications || []).filter((n) => !n.isRead).length;
  const totalNotifications = pendingRequestsCount + unreadNotificationsCount;

  const agencyName = appData.agencySettings?.agencyName || 'AIMS.H Workspace';
  const agencyLogoUrl = appData.agencySettings?.agencyLogoUrl;

  const handleAvatarClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else if (onSelectTab) {
      onSelectTab('profile');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 font-sans shadow-xs">
      
      {/* 1. Dynamic Island / Status Notch Header with Agency Logo */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-1.5 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-600 select-none">
        <span className="font-mono tracking-tight text-slate-800 font-black">{currentTime}</span>
        
        {/* Dynamic Island Pill in Center (with Custom Agency Logo if set) */}
        <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono tracking-wider shadow-sm">
          {agencyLogoUrl ? (
            <img
              src={agencyLogoUrl}
              alt={agencyName}
              className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-white/30"
            />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <span className="truncate max-w-[140px] sm:max-w-[200px]">{agencyName}</span>
          <span className="text-[9px] text-slate-400 hidden sm:inline">• Synced</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono">100%</span>
            <Battery className="w-4 h-4 fill-slate-700" />
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar with menu, agency brand / date pill, and profile avatar */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Top-Left: Rounded menu grid icon & User Profile Avatar with notification indicator */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('missions')}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition cursor-pointer shadow-xs"
            title="Overview Grid"
          >
            <Grid className="w-4 h-4 text-slate-700" />
          </button>

          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative group cursor-pointer"
            title="Open Profile & Agency Settings"
          >
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-blue-200 group-hover:scale-105 transition"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </button>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block leading-tight">
              Welcome back,
            </span>
            <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight flex items-center gap-1.5">
              <span>{activeUser.name}</span>
              {isSynced && partnerUser && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                  & {partnerUser.name}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Center: Live Date Pill Container */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 shadow-xs text-xs font-black text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Today, {formattedDate}</span>
        </div>

        {/* Top-Right: Search + Notification Bell + Dropdown Menu */}
        <div className="flex items-center gap-1.5">
          
          {/* Search Icon */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSearch) {
                onOpenSearch();
              } else if (onSelectTab) {
                onSelectTab('missions');
              }
            }}
            className="w-9 h-9 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Global Workspace Search (সার্চ করুন)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Bell with real-time indicator */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="w-9 h-9 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 flex items-center justify-center transition shadow-2xs relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs animate-bounce">
                  {totalNotifications}
                </span>
              )}
            </button>
          )}

          {/* Quick Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
              title="Menu & Settings"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 bg-slate-50 rounded-xl mb-1.5 border border-slate-100 flex items-center gap-2.5">
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    className="w-8 h-8 rounded-xl object-cover border border-blue-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 truncate">{activeUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{activeUser.role}</p>
                  </div>
                </div>

                <div className="space-y-0.5 text-xs font-bold text-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleAvatarClick();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Profile & Agency Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenPartnerTab();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Partner Hub & Invite</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onSelectTab) onSelectTab('clients');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-orange-600" />
                    <span>Agency Client Sheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenPWAGuide();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mobile App Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      const res = downloadOneTimeBackup(appData);
                      if (res.success) {
                        alert(`✅ Data downloaded successfully: ${res.filename}`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-indigo-50 text-indigo-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download Hub Backup (JSON)</span>
                  </button>

                  {isInstallable && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        install();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-blue-50 text-blue-600 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Install PWA to Phone</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onLogOut) onLogOut();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
