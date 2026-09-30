import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Clock, 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Zap, 
  Check, 
  MessageSquare, 
  Users, 
  FolderKanban, 
  Tv, 
  Search,
  Video,
  Vibrate,
  BellRing,
  ExternalLink,
  PhoneCall,
  Activity,
  Layers,
  Star,
  Phone,
  ShieldCheck,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MissionItem, MissionPriority, MissionStatus, AssigneeId, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';
import { pushAppNotification } from '../../utils/notifications';

interface MissionBoardProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onSelectTab?: (tab: any) => void;
}

// 3D Geometric Torus & Sphere SVG Art
const Torus3DArt: React.FC<{ color?: string; size?: string }> = ({ color = 'orange', size = 'w-20 h-20' }) => {
  return (
    <svg className={`${size} opacity-85 select-none drop-shadow-md pointer-events-none`} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`mb3d-${color}`} cx="35%" cy="35%" r="65%">
          {color === 'orange' && (
            <>
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="40%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#c2410c" />
            </>
          )}
          {color === 'blue' && (
            <>
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </>
          )}
          {color === 'pink' && (
            <>
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="40%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#be185d" />
            </>
          )}
          {color === 'purple' && (
            <>
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="40%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </>
          )}
        </radialGradient>
        <radialGradient id={`mbSphere-${color}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      
      <circle cx="50" cy="50" r="32" stroke={`url(#mb3d-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="50" cy="50" r="32" stroke={`url(#mbSphere-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="72" cy="28" r="8" fill={`url(#mb3d-${color})`} />
      <circle cx="72" cy="28" r="8" fill={`url(#mbSphere-${color})`} />
      <circle cx="28" cy="68" r="5" fill={`url(#mb3d-${color})`} />
    </svg>
  );
};

// 3D Dynamic Rocket Graphic
const Rocket3DGraphic: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={`${className} drop-shadow-md select-none`} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="rocketBody" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#38BDF8" />
      </radialGradient>
      <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
    </defs>
    {/* Flame */}
    <path d="M42 66 Q50 90 50 90 Q50 90 58 66 Z" fill="url(#rocketFlame)" />
    <path d="M46 66 Q50 80 50 80 Q50 80 54 66 Z" fill="#FEF08A" />
    {/* Rocket Fuselage */}
    <path d="M50 14 C38 34 36 60 50 70 C64 60 62 34 50 14 Z" fill="url(#rocketBody)" stroke="#0284C7" strokeWidth="2.5" />
    {/* Fins */}
    <path d="M37 52 L22 66 L36 66 Z" fill="#0284C7" />
    <path d="M63 52 L78 66 L64 66 Z" fill="#0284C7" />
    {/* Porthole */}
    <circle cx="50" cy="38" r="7" fill="#0284C7" />
    <circle cx="50" cy="38" r="5" fill="#E0F2FE" />
  </svg>
);

export const MissionBoard: React.FC<MissionBoardProps> = ({ 
  appData, 
  onUpdateData,
  onSelectTab 
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVibrating, setIsVibrating] = useState(false);
  const [vibrationAlertSent, setVibrationAlertSent] = useState(false);

  // New Mission State
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM • Deep Work');
  const [newPriority, setNewPriority] = useState<MissionPriority>('High');
  const [newTags, setNewTags] = useState('Video Production');
  const [newDesc, setNewDesc] = useState('');

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const isPartnerLinked = appData.partnerConnection.status === 'accepted' && 
    !!appData.partnerConnection.pairedUserId && 
    !!appData.founders[appData.partnerConnection.pairedUserId];

  const partnerUser = isPartnerLinked 
    ? appData.founders[appData.partnerConnection.pairedUserId] 
    : null;

  const todayIso = new Date().toISOString().split('T')[0];
  const meetings = appData.meetings || [];
  const todaysMeeting = meetings[0] || null;

  // Trigger Phone Vibration Alert
  const handleTriggerMeetingAlert = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 150, 300, 150, 500]);
      } catch (e) {
        // Ignore vibration error
      }
    }

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // AudioContext unavailable
    }

    setIsVibrating(true);
    setVibrationAlertSent(true);
    setTimeout(() => setIsVibrating(false), 2000);
    setTimeout(() => setVibrationAlertSent(false), 4000);
  };

  // Generate 7-day week calendar
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return {
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      dateNum: d.getDate(),
      offset: i,
      isoDate: d.toISOString().split('T')[0],
      taskCount: (i % 3) + 1,
    };
  });

  // Agree to meeting
  const handleAgreeMeeting = () => {
    if (!todaysMeeting) return;
    const updatedMeetings = (appData.meetings || []).map((m) =>
      m.id === todaysMeeting.id ? { ...m, status: 'accepted' as const } : m
    );
    const updatedWithNotif = pushAppNotification(
      {
        ...appData,
        meetings: updatedMeetings,
      },
      {
        type: 'meeting',
        title: `✅ Meeting Agreed by ${activeUser.name}`,
        message: `${activeUser.name} agreed to attend "${todaysMeeting.title}" at ${todaysMeeting.scheduledTime}!`,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        targetUserId: todaysMeeting.hostId,
        actionTab: 'meetings',
        timestamp: 'Agreed',
      }
    );
    onUpdateData(updatedWithNotif);
  };

  // Toggle mission completion
  const handleToggleMission = (missionId: string) => {
    const updatedMissions = appData.missions.map((m) => {
      if (m.id !== missionId) return m;
      const nextStatus: MissionStatus = m.status === 'Completed' ? 'To-Do' : 'Completed';
      return { ...m, status: nextStatus };
    });
    const updated = { ...appData, missions: updatedMissions };
    saveAppData(updated);
    onUpdateData(updated);
  };

  // Toggle habit directly on home page
  const handleToggleHabit = (habitId: string) => {
    const updatedHabits = appData.habits.map((h) => {
      if (h.id !== habitId) return h;
      const isDone = !!h.history[todayIso];
      const nextHistory = { ...h.history, [todayIso]: !isDone };
      const nextStreak = !isDone ? (h.streakCount || 0) + 1 : Math.max(0, (h.streakCount || 1) - 1);
      return {
        ...h,
        history: nextHistory,
        streakCount: nextStreak,
      };
    });
    const updated = { ...appData, habits: updatedHabits };
    saveAppData(updated);
    onUpdateData(updated);
  };

  // Delete mission
  const handleDeleteMission = (missionId: string) => {
    const updated = {
      ...appData,
      missions: appData.missions.filter((m) => m.id !== missionId),
    };
    saveAppData(updated);
    onUpdateData(updated);
  };

  // Create new custom mission
  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMission: MissionItem = {
      id: `ms-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || `${newTime} • ${newTags}`,
      targetDate: new Date().toISOString(),
      priority: newPriority,
      status: 'To-Do',
      assignee: 'both',
      tags: [newTags],
      subtasks: [],
      createdAt: new Date().toISOString(),
    };

    const updatedWithNotif = pushAppNotification(
      {
        ...appData,
        missions: [newMission, ...appData.missions],
      },
      {
        type: 'schedule',
        title: `⚡ Plan: ${newTitle.trim()}`,
        message: `${activeUser.name} scheduled "${newTitle.trim()}" (${newTime}) with priority: ${newPriority}.`,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        targetUserId: partnerUser ? partnerUser.id : 'all',
        actionTab: 'missions',
        timestamp: newTime,
      }
    );

    onUpdateData(updatedWithNotif);

    setNewTitle('');
    setNewDesc('');
    setIsAddModalOpen(false);
  };

  const activeMissions = appData.missions.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 max-w-xl mx-auto font-sans pb-12">
      
      {/* 1. GREETING AREA: Large, bold personalized text with subtext indicator */}
      <div className="pt-1 px-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Morning, {activeUser.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Remains private and protected 🔒</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-slate-900/15 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-3" />
          <span>New Plan</span>
        </button>
      </div>

      {/* 2. METRICS & STAT CARDS: Side-by-side colorful rounded widgets featuring 3D dynamic graphics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        
        {/* Card 1: Vibrant Blue Gradient with 3D Rocket for "Success 56%" */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white p-4 shadow-lg shadow-blue-500/20 flex flex-col justify-between h-36">
          <div className="absolute -right-1 -bottom-2 pointer-events-none opacity-90">
            <Rocket3DGraphic className="w-18 h-18" />
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/20">
              Sprint Rate
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-200" />
          </div>
          <div className="z-10">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none block">
              Success 56%
            </span>
            <p className="text-[11px] text-blue-100 font-medium mt-1">
              {appData.missions.filter((m) => m.status === 'Completed').length} / {appData.missions.length || 1} missions done
            </p>
          </div>
        </div>

        {/* Card 2: Warm Orange Card with 3D graphic for "Clients" */}
        <div 
          onClick={() => onSelectTab && onSelectTab('clients')}
          className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-4 shadow-lg shadow-orange-500/20 flex flex-col justify-between h-36 cursor-pointer hover:scale-[1.02] transition"
        >
          <div className="absolute -right-2 -bottom-2 pointer-events-none opacity-85">
            <Torus3DArt color="orange" size="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/20">
              Agency CRM
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-200" />
          </div>
          <div className="z-10">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none block">
              Clients {(appData.clients || []).length}
            </span>
            <p className="text-[11px] text-orange-100 font-medium mt-1 flex items-center gap-1">
              <span>Open client sheet</span> &rarr;
            </p>
          </div>
        </div>

        {/* Card 3: Neon Violet Card for Daily Habits */}
        <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-[24px] bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-800 text-white p-4 shadow-lg shadow-purple-500/20 flex flex-col justify-between h-36">
          <div className="absolute -right-2 -bottom-2 pointer-events-none opacity-85">
            <Torus3DArt color="purple" size="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/20">
              Execution
            </span>
            <Flame className="w-3.5 h-3.5 text-purple-200" />
          </div>
          <div className="z-10">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none block">
              Rituals 100%
            </span>
            <p className="text-[11px] text-purple-100 font-medium mt-1">
              {appData.habits.length} daily habits synced
            </p>
          </div>
        </div>

      </div>

      {/* 3. HORIZONTAL CALENDAR STRIP: Date selector pills across the top with active day highlighted in glowing violet */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-violet-600" />
            <span>Schedule Timeline</span>
          </h3>
          <span className="text-[10px] font-bold text-violet-600">This Week</span>
        </div>

        <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          {weekDays.map((item) => {
            const isSelected = selectedDayOffset === item.offset;
            return (
              <button
                key={item.dayName}
                type="button"
                onClick={() => setSelectedDayOffset(item.offset)}
                className={`flex-1 py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white ring-2 ring-violet-400 shadow-md shadow-violet-500/25 scale-102 font-black'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-violet-200' : 'text-slate-400'}`}>
                  {item.dayName}
                </span>
                <span className={`text-sm font-black my-0.5 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {item.dateNum}
                </span>
                <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-slate-300'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CATEGORIES GRID: Section titled "Categories" with "View all" link */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-900 tracking-tight">
            Categories
          </h3>
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('skills')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {/* Item 1: Missions */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('missions')}
            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Missions</span>
          </button>

          {/* Item 2: Clients */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('clients')}
            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Clients</span>
          </button>

          {/* Item 3: Meetings */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('meetings')}
            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Meetings</span>
          </button>

          {/* Item 4: Skills */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('skills')}
            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Skills</span>
          </button>

          {/* Item 5: Drive */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('drive')}
            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Drive</span>
          </button>

          {/* Item 6: Habits */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('habits')}
            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Habits</span>
          </button>

          {/* Item 7: Chat */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('chat')}
            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Chat</span>
          </button>
        </div>
      </div>

      {/* 5. LIVE MEETING PROPOSAL CARD (Existing logic completely intact!) */}
      {todaysMeeting ? (
        <motion.div
          layout
          className="bg-white rounded-3xl p-4 sm:p-5 border border-purple-200/80 shadow-md shadow-purple-500/5 relative overflow-hidden space-y-3"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-purple-700" />
              Live Agency Meeting
            </span>
            <span className="text-xs font-mono font-bold text-purple-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              {todaysMeeting.scheduledTime}
            </span>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900">
              {todaysMeeting.title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              {todaysMeeting.agenda}
            </p>
          </div>

          {todaysMeeting.status === 'accepted' ? (
            <p className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200 inline-block">
              ✅ Both Co-Founders Agreed to Attend
            </p>
          ) : todaysMeeting.status === 'declined' ? (
            <p className="text-xs text-rose-800 font-bold bg-rose-50 px-3 py-1.5 rounded-2xl border border-rose-200 inline-block">
              ❌ Declined by Partner: {todaysMeeting.declineReason}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              One-click alerts partner with vibration and push notification.
            </p>
          )}

          {/* Invitee agreement buttons */}
          {todaysMeeting.hostId !== activeUser.id && todaysMeeting.status === 'upcoming' && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAgreeMeeting}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-3" />
                <span>I Agree (Attend)</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('meetings')}
                className="px-3.5 py-2 rounded-full bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 cursor-pointer"
              >
                State Reason
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={handleTriggerMeetingAlert}
              className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                isVibrating
                  ? 'bg-amber-400 text-slate-950 scale-105 animate-bounce'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <Vibrate className="w-4 h-4 text-amber-300" />
              <span>{vibrationAlertSent ? 'Vibrating Partner Phone!' : 'Buzz Partner Phone'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('meetings')}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>Meeting Room</span>
            </button>
          </div>
        </motion.div>
      ) : null}

      {/* 6. LIST CARDS (Appointments / Scheduled Plans): Rounded white list items with icon, title, subtitle, time badges, action icons */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Scheduled Plans & Tasks</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {activeMissions.length}
            </span>
          </h3>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plan</span>
          </button>
        </div>

        <div className="space-y-2">
          {activeMissions.slice(0, 4).map((mission) => {
            const isCompleted = mission.status === 'Completed';
            return (
              <div
                key={mission.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleMission(mission.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-3" />
                  </button>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-black truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {mission.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {mission.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {mission.priority}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMission(mission.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. CONTACT / CO-FOUNDER PARTNER CARD: Only shown when partner is actually connected */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        {partnerUser ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={partnerUser.avatar}
                  alt={partnerUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs ring-1 ring-blue-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900">{partnerUser.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{partnerUser.role}</p>
                
                {/* Star Rating System (5-Star indicator) */}
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[10px] font-bold text-slate-600 pl-1 font-mono">5.0 Co-Founder Trust</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTriggerMeetingAlert}
                className="w-9 h-9 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center transition cursor-pointer"
                title="Buzz Phone"
              >
                <Vibrate className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('chat')}
                className="w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition cursor-pointer"
                title="Message Partner"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 stroke-1.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">No Partner Connected Yet</h4>
                <p className="text-[11px] text-slate-500">
                  Share your code <span className="font-mono font-bold text-blue-600">{activeUser.inviteCode}</span> or link your partner.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('partners')}
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer whitespace-nowrap shadow-xs"
            >
              + Link Partner
            </button>
          </div>
        )}
      </div>

      {/* 8. HABIT TRACKER QUICK CHECK-IN */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Today's Habits Check-in</h4>
              <p className="text-[10px] text-slate-500">Tap to complete daily ritual</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('habits')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>

        <div className="space-y-2">
          {appData.habits.slice(0, 3).map((habit) => {
            const isDone = !!habit.history[todayIso];
            return (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`p-2.5 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                  isDone ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-xl flex items-center justify-center transition ${
                      isDone ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  </div>
                  <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {habit.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{habit.streakCount || 0}d</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD PLAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600 stroke-3" />
                Add Agency Plan / Task
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMission} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Activity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Video Production / Dev Sprint"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time & Location</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 10:30 AM • Studio A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty / Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as MissionPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="High">Medium / High</option>
                    <option value="Medium">Light / Balanced</option>
                    <option value="Critical">Critical Sprint</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category / Tag</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Video Production, Client Sprint"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
