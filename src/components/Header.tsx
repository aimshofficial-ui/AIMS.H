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
  Check
} from 'lucide-react';
import { SharedAppData } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BottomTabId } from './BottomNavBar';

interface HeaderProps {
  appData: SharedAppData;
  activeTab?: BottomTabId;
  onSelectTab?: (tab: BottomTabId) => void;
  onOpenPartnerTab: () => void;
  onOpenProfile?: () => void;
  onOpenPWAGuide: () => void;
  onOpenNotifications?: () => void;
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
  onLogOut,
  missionCount = 0,
  messageCount = 0,
  pendingRequestsCount = 0,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const isSynced = appData.partnerConnection.status === 'accepted';
  const otherFounder = Object.values(appData.founders).find((f) => f.id !== appData.activeFounderId);
  const pairedFounder = appData.partnerConnection.pairedUserId && appData.partnerConnection.pairedUserId !== appData.activeFounderId
    ? appData.founders[appData.partnerConnection.pairedUserId]
    : otherFounder;
  const partnerUser = pairedFounder || otherFounder;

  const handleAvatarClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else if (onSelectTab) {
      onSelectTab('profile');
    }
  };

  const handleCopyInviteCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeUser.inviteCode) {
      navigator.clipboard.writeText(activeUser.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const desktopNavItems = [
    { id: 'missions' as BottomTabId, label: 'Missions', icon: Target, badge: missionCount },
    { id: 'skills' as BottomTabId, label: 'Skills', icon: Zap },
    { id: 'drive' as BottomTabId, label: 'Drive', icon: FolderKanban },
    { id: 'media' as BottomTabId, label: 'Media', icon: Tv },
    { id: 'habits' as BottomTabId, label: 'Habits', icon: Flame },
    { id: 'chat' as BottomTabId, label: 'Chat', icon: MessageSquare, badge: messageCount },
    { id: 'analytics' as BottomTabId, label: 'Analytics', icon: Activity },
    { id: 'partners' as BottomTabId, label: 'Partners', icon: Users, badge: pendingRequestsCount },
    { id: 'profile' as BottomTabId, label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2 transition">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand & Partner Sync Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div 
            onClick={onOpenPartnerTab}
            className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs cursor-pointer hover:bg-indigo-700 transition"
          >
            AH
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
                AIMS.H Hub
              </h1>
              {isSynced ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              ) : (
                <button
                  onClick={onOpenPartnerTab}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold hover:bg-amber-100 transition"
                >
                  + Pair Partner
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {isSynced && partnerUser ? `With ${partnerUser.name}` : 'Shared Co-Founder OS'}
            </p>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        {onSelectTab && (
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/90 shadow-2xs">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Notification Bell Button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Partner Connection Requests & Alerts"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}

          {/* Direct PWA Install Button */}
          {isInstallable && (
            <button
              onClick={install}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
              title="Install App"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Guide icon */}
          <button
            onClick={onOpenPWAGuide}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="PWA & App Guide"
            aria-label="App Guide"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          {/* Active Profile Avatar Button & Quick Menu */}
          <div className="relative" ref={menuRef}>
            <div
              className={`flex items-center gap-1.5 p-1 sm:pr-1.5 rounded-xl transition select-none ${
                activeTab === 'profile'
                  ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-700 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={handleAvatarClick}
                className="flex items-center gap-1.5 cursor-pointer"
                title="Click to view & edit Profile / Avatars"
              >
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                />
                <span className="text-xs font-bold max-w-[85px] truncate hidden sm:inline">
                  {activeUser.name.split(' ')[0]}
                </span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition cursor-pointer"
                title="Profile actions & Logout"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Profile Dropdown Popup */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 bg-slate-50 rounded-xl mb-1.5 border border-slate-100 flex items-center gap-2.5">
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    className="w-9 h-9 rounded-xl object-cover border border-indigo-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{activeUser.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{activeUser.role}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleAvatarClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition text-left cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>My Profile & Avatars (ছেলে/মেয়ে)</span>
                  </button>

                  <button
                    onClick={handleCopyInviteCode}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Code: {activeUser.inviteCode}</span>
                    </span>
                    {copiedCode ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  {onLogOut && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogOut();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition text-left cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out (লগআউট)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
