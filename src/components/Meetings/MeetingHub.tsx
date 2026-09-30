import React, { useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Calendar, 
  Clock, 
  Plus, 
  ExternalLink, 
  Bell, 
  BellRing, 
  Vibrate, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Share2, 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Copy, 
  Check, 
  AlertCircle,
  XCircle,
  FileText,
  X,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgencyMeeting, SharedAppData, ChatMessage } from '../../types';
import { saveAppData } from '../../utils/storage';
import { triggerMobileAlert, pushAppNotification } from '../../utils/notifications';

interface MeetingHubProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

// 3D Geometric Torus & Sphere SVG Art
const Torus3DArt: React.FC<{ color?: string; size?: string }> = ({ color = 'orange', size = 'w-16 h-16' }) => {
  return (
    <svg className={`${size} opacity-85 select-none drop-shadow-md pointer-events-none`} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`meet3d-${color}`} cx="35%" cy="35%" r="65%">
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
        <radialGradient id={`meetSphere-${color}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      
      <circle cx="50" cy="50" r="32" stroke={`url(#meet3d-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="50" cy="50" r="32" stroke={`url(#meetSphere-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="72" cy="28" r="8" fill={`url(#meet3d-${color})`} />
      <circle cx="72" cy="28" r="8" fill={`url(#meetSphere-${color})`} />
      <circle cx="28" cy="68" r="5" fill={`url(#meet3d-${color})`} />
    </svg>
  );
};

const DECLINE_PRESETS = [
  'In a client call / outreach sprint',
  'Currently editing & rendering video reels',
  'Can we reschedule to 1 hour later?',
  'Personal appointment / unavailable right now',
];

export const MeetingHub: React.FC<MeetingHubProps> = ({ appData, onUpdateData }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Meeting Details modal & Decline modal state
  const [viewingMeeting, setViewingMeeting] = useState<AgencyMeeting | null>(null);
  const [decliningMeeting, setDecliningMeeting] = useState<AgencyMeeting | null>(null);
  const [customDeclineReason, setCustomDeclineReason] = useState('');

  // New Meeting Form
  const [meetTitle, setMeetTitle] = useState('Agency Strategy & Client Review');
  const [meetTime, setMeetTime] = useState('Today, 09:00 PM');
  const [meetUrl, setMeetUrl] = useState('https://meet.google.com/new');
  const [meetAgenda, setMeetAgenda] = useState('1. Review Video Reels\n2. Client Outreach Targets\n3. Deliverables Sprint');

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const partnerUser = foundersList.find((f) => f.id !== activeUser.id) || {
    id: 'user_2',
    name: 'Partner',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  };

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(partnerUser.id || 'all');
  const meetings: AgencyMeeting[] = appData.meetings || [];
  const currentMeeting = meetings[0] || null;

  // Check if there is an unresponded meeting invitation for activeUser
  const pendingInvitation = meetings.find(
    (m) => m.hostId !== activeUser.id && (m.targetPartnerId === activeUser.id || !m.targetPartnerId) && m.status === 'upcoming'
  );

  // Ring partner / Trigger Mobile Vibration
  const handleTriggerMeetingAlert = () => {
    const meetingTitle = currentMeeting ? currentMeeting.title : 'Live Agency Meeting';
    
    triggerMobileAlert({
      title: `🚨 Co-Founder Meeting Alert!`,
      message: `${activeUser.name} is waiting in "${meetingTitle}". Tap to join now!`,
      vibratePattern: [300, 150, 300, 150, 500, 200, 500],
    });

    const updated = pushAppNotification(appData, {
      type: 'meeting',
      title: `🚨 Live Alert from ${activeUser.name}`,
      message: `${activeUser.name} is calling you to the Meeting Room!`,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderAvatar: activeUser.avatar,
      targetUserId: selectedPartnerId || 'all',
      actionTab: 'meetings',
      timestamp: 'Just now',
    });
    onUpdateData(updated);

    setIsVibrating(true);
    setAlertSent(true);
    setTimeout(() => setIsVibrating(false), 2000);
    setTimeout(() => setAlertSent(false), 4000);
  };

  // Schedule a new meeting
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle.trim()) return;

    const newMeeting: AgencyMeeting = {
      id: `meet-${Date.now()}`,
      title: meetTitle.trim(),
      scheduledTime: meetTime.trim(),
      meetUrl: meetUrl.trim() || 'https://meet.google.com/new',
      agenda: meetAgenda.trim(),
      hostId: activeUser.id,
      targetPartnerId: selectedPartnerId,
      status: 'upcoming',
      participants: [activeUser.id, selectedPartnerId],
      createdAt: new Date().toISOString(),
    };

    // Automated chat notice
    const autoMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderAvatar: activeUser.avatar,
      recipientId: selectedPartnerId,
      content: `📅 Meeting Scheduled: "${meetTitle.trim()}" at ${meetTime.trim()}.\nAgenda: ${meetAgenda.trim()}\nJoin Link: ${meetUrl.trim() || 'https://meet.google.com/new'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
    };

    const updated = pushAppNotification(
      {
        ...appData,
        meetings: [newMeeting, ...(appData.meetings || [])],
        messages: [...appData.messages, autoMsg],
      },
      {
        type: 'meeting',
        title: `📹 Meeting Request: ${meetTitle.trim()}`,
        message: `${activeUser.name} scheduled a meeting for ${meetTime.trim()}: "${meetAgenda.trim()}". Tap to view details!`,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        targetUserId: selectedPartnerId,
        actionTab: 'meetings',
        timestamp: meetTime.trim(),
      }
    );

    onUpdateData(updated);
    setIsAddModalOpen(false);
  };

  // Agree / Accept a meeting proposal
  const handleAgreeMeeting = (meeting: AgencyMeeting) => {
    const updatedMeetings = (appData.meetings || []).map((m) =>
      m.id === meeting.id ? { ...m, status: 'accepted' as const } : m
    );

    const autoMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderAvatar: activeUser.avatar,
      recipientId: meeting.hostId,
      content: `✅ I agreed to attend the meeting "${meeting.title}" scheduled for ${meeting.scheduledTime}. See you there!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
    };

    const updated = pushAppNotification(
      {
        ...appData,
        meetings: updatedMeetings,
        messages: [...appData.messages, autoMsg],
      },
      {
        type: 'meeting',
        title: `✅ Meeting Accepted by ${activeUser.name}`,
        message: `${activeUser.name} agreed to attend "${meeting.title}" at ${meeting.scheduledTime}!`,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        targetUserId: meeting.hostId,
        actionTab: 'meetings',
        timestamp: 'Agreed',
      }
    );

    onUpdateData(updated);
    if (viewingMeeting?.id === meeting.id) {
      setViewingMeeting({ ...viewingMeeting, status: 'accepted' });
    }
  };

  // Decline meeting with reason
  const handleSubmitDecline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decliningMeeting) return;

    const reason = customDeclineReason.trim() || 'Unavailable at this time';

    const updatedMeetings = (appData.meetings || []).map((m) =>
      m.id === decliningMeeting.id
        ? { ...m, status: 'declined' as const, declineReason: reason }
        : m
    );

    const autoMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderAvatar: activeUser.avatar,
      recipientId: decliningMeeting.hostId,
      content: `❌ I cannot attend the meeting "${decliningMeeting.title}" at ${decliningMeeting.scheduledTime}.\nReason: ${reason}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
    };

    const updated = pushAppNotification(
      {
        ...appData,
        meetings: updatedMeetings,
        messages: [...appData.messages, autoMsg],
      },
      {
        type: 'meeting',
        title: `❌ Meeting Declined by ${activeUser.name}`,
        message: `${activeUser.name} cannot attend "${decliningMeeting.title}". Reason: ${reason}`,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        targetUserId: decliningMeeting.hostId,
        actionTab: 'meetings',
        timestamp: 'Declined',
      }
    );

    onUpdateData(updated);
    if (viewingMeeting?.id === decliningMeeting.id) {
      setViewingMeeting({ ...viewingMeeting, status: 'declined', declineReason: reason });
    }
    setDecliningMeeting(null);
    setCustomDeclineReason('');
  };

  const handleDeleteMeeting = (meetId: string) => {
    const updated = {
      ...appData,
      meetings: (appData.meetings || []).filter((m) => m.id !== meetId),
    };
    saveAppData(updated);
    onUpdateData(updated);
    if (viewingMeeting?.id === meetId) {
      setViewingMeeting(null);
    }
  };

  const handleCopyMeetLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans pb-12">
      
      {/* 1. HERO BANNER: 3D Minimalist Live Meeting Room */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-rose-700 text-white p-5 sm:p-6 shadow-xl shadow-purple-500/20"
      >
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
          <Torus3DArt color="pink" size="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-amber-300" />
              Live Agency Meeting & Video Sync
            </span>

            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Bilateral Room</span>
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {currentMeeting ? currentMeeting.title : 'Live Co-Founder Meeting Room'}
            </h2>
            <p className="text-xs text-purple-100 mt-1 max-w-md">
              {currentMeeting ? (
                <>Scheduled for <strong>{currentMeeting.scheduledTime}</strong>. One click sends a live notification & phone vibration to your partner.</>
              ) : (
                'No meetings scheduled. Click below to ring your partner or launch an instant Google Meet room.'
              )}
            </p>
          </div>

          {/* Bilateral Presence: You & Partner */}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl backdrop-blur-md border border-white/20">
                <div className="relative">
                  <img src={activeUser.avatar} alt="You" className="w-7 h-7 rounded-full object-cover border border-white" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-bold text-white">You</span>

                <span className="text-white/40">⇄</span>

                <div className="relative">
                  <img src={partnerUser.avatar} alt="Partner" className="w-7 h-7 rounded-full object-cover border border-white" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-white">{partnerUser.name.split(' ')[0]}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerMeetingAlert}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                  isVibrating
                    ? 'bg-amber-400 text-slate-950 scale-105 animate-bounce'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md'
                }`}
                title="Send notification & vibrate partner's phone"
              >
                <Vibrate className="w-4 h-4 text-amber-300" />
                <span>{alertSent ? 'Buzzed Partner!' : 'Buzz Partner Phone'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-3" />
                <span>Schedule Meeting</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. PENDING INVITATION CARD (Agree / Disagree Response) */}
      {pendingInvitation && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-pastel-orange rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-md border-2 border-orange-300 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-600 text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Incoming Meeting Proposal
            </span>
            <span className="text-xs font-mono font-bold text-orange-950">
              {pendingInvitation.scheduledTime}
            </span>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900">
              {pendingInvitation.title}
            </h3>
            <p className="text-xs text-orange-950 font-medium mt-0.5">
              Proposed by <strong>{appData.founders[pendingInvitation.hostId]?.name || 'Co-Founder'}</strong>: "{pendingInvitation.agenda}"
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => handleAgreeMeeting(pendingInvitation)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-3" />
              <span>I Agree (Attend Meeting)</span>
            </button>

            <button
              type="button"
              onClick={() => setDecliningMeeting(pendingInvitation)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Cannot Attend (State Reason)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewingMeeting(pendingInvitation)}
              className="px-3 py-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
            >
              Full Details
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. LIVE MEETING STAGE (Dual Avatar Camera Feed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* Your Feed */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border-2 border-indigo-500/40 shadow-md flex flex-col justify-between p-3.5 group">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/20">
              Your Feed (Live)
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${camActive ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
            <div className="relative">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white/80 shadow-xl"
              />
              <span className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <p className="text-xs font-bold text-white shadow-xs">{activeUser.name}</p>
          </div>

          <div className="flex items-center justify-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setMicActive(!micActive)}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer backdrop-blur-md ${
                micActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-rose-600 text-white'
              }`}
            >
              {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setCamActive(!camActive)}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer backdrop-blur-md ${
                camActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-rose-600 text-white'
              }`}
            >
              {camActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Partner Feed */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border-2 border-purple-500/40 shadow-md flex flex-col justify-between p-3.5 group">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/20">
              {partnerUser.name.split(' ')[0]}'s Feed
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full">
              Connected
            </span>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
            <div className="relative">
              <img
                src={partnerUser.avatar}
                alt={partnerUser.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white/80 shadow-xl"
              />
              <span className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            </div>
            <p className="text-xs font-bold text-white shadow-xs">{partnerUser.name}</p>
          </div>

          <div className="flex items-center justify-center gap-2 z-10">
            <a
              href={currentMeeting ? currentMeeting.meetUrl : 'https://meet.google.com/new'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Launch Google Meet Video</span>
            </a>
          </div>
        </div>

      </div>

      {/* 4. MEETING CONTROLS & AGENDA (3D Pastel Box) */}
      {currentMeeting ? (
        <div className="card-pastel-orange rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-sm space-y-3">
          <div className="absolute right-2 top-2 pointer-events-none">
            <Torus3DArt color="orange" size="w-20 h-20" />
          </div>

          <div className="relative z-10 space-y-2 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-orange-900 border border-orange-200">
                Meeting Agenda & Sync Points
              </span>
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                {currentMeeting.scheduledTime}
              </span>
              {currentMeeting.status === 'accepted' && (
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  ✅ Both Agreed
                </span>
              )}
              {currentMeeting.status === 'declined' && (
                <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                  ❌ Partner Declined: {currentMeeting.declineReason}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-medium bg-white/70 p-3 rounded-2xl border border-orange-200/80">
              {currentMeeting.agenda}
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href={currentMeeting.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Enter Meeting Room (Google Meet)</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopyMeetLink(currentMeeting.meetUrl)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-orange-50 text-slate-800 font-bold text-xs flex items-center gap-1 border border-orange-200 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-700" />}
                <span>{copiedLink ? 'Copied Link' : 'Copy Meet Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerMeetingAlert}
                className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-800 font-bold text-xs flex items-center gap-1 border border-amber-200 cursor-pointer"
              >
                <Vibrate className="w-3.5 h-3.5 text-amber-600" />
                <span>Send Vibration Alert</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="app-card p-8 text-center space-y-3 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
            <Video className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-slate-900">No upcoming meetings scheduled</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Schedule a sprint sync, client review, or 1-on-1 strategy call with your partner.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Schedule Meeting
          </button>
        </div>
      )}

      {/* 5. SCHEDULED MEETINGS LIST */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-extrabold text-slate-800 px-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Scheduled Agency Meetings ({meetings.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {meetings.map((meet, idx) => {
            const colorVariant = idx % 2 === 0 ? 'blue' : 'pink';
            const cardClass = colorVariant === 'blue' ? 'card-pastel-blue' : 'card-pastel-pink';
            const isHost = meet.hostId === activeUser.id;
            const hostUser = appData.founders[meet.hostId];

            return (
              <div
                key={meet.id}
                className={`p-4 rounded-3xl ${cardClass} relative overflow-hidden shadow-2xs space-y-2.5`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="cursor-pointer" onClick={() => setViewingMeeting(meet)}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-slate-800 border border-slate-200">
                        {meet.scheduledTime}
                      </span>
                      {meet.status === 'accepted' && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ✅ Agreed
                        </span>
                      )}
                      {meet.status === 'declined' && (
                        <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                          ❌ Declined
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{meet.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{meet.agenda}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMeeting(meet.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] text-slate-600 font-medium">
                    Host: {hostUser?.name || 'Partner'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingMeeting(meet)}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 text-[11px] cursor-pointer"
                    >
                      Details
                    </button>
                    <a
                      href={meet.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 text-[11px] cursor-pointer shadow-2xs"
                    >
                      <Video className="w-3 h-3" />
                      <span>Join</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL MEETING DETAILS MODAL (Separate Page/Modal) */}
      {viewingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="app-card w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl rounded-3xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Meeting Details</h3>
                  <p className="text-xs text-slate-500">Live sync and co-founder status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMeeting(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-700">Scheduled Time</span>
                <p className="text-base font-black text-purple-950">{viewingMeeting.scheduledTime}</p>
                <p className="text-[11px] text-purple-800">
                  Host: <strong>{appData.founders[viewingMeeting.hostId]?.name || 'Co-Founder'}</strong>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">{viewingMeeting.title}</h4>
                <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {viewingMeeting.agenda}
                </p>
              </div>

              {/* Status Badge */}
              <div className="p-3 rounded-2xl border flex items-center justify-between">
                <span className="font-bold text-slate-600">Agreement Status:</span>
                {viewingMeeting.status === 'accepted' ? (
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    ✅ Both Co-Founders Agreed
                  </span>
                ) : viewingMeeting.status === 'declined' ? (
                  <span className="font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                    ❌ Declined: {viewingMeeting.declineReason}
                  </span>
                ) : (
                  <span className="font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    ⏳ Pending Partner Response
                  </span>
                )}
              </div>

              {/* Action Buttons if user is invitee */}
              {viewingMeeting.hostId !== activeUser.id && (
                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleAgreeMeeting(viewingMeeting)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-3" />
                    <span>I Agree (Attend)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDecliningMeeting(viewingMeeting);
                      setViewingMeeting(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-black text-xs border border-rose-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cannot Attend (State Reason)</span>
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={viewingMeeting.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Google Meet</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleDeleteMeeting(viewingMeeting.id)}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs"
                >
                  Delete Meeting
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* DECLINE MEETING MODAL (State Reason) */}
      {decliningMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="app-card w-full max-w-md p-5 space-y-4 shadow-2xl rounded-3xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                Cannot Attend Meeting
              </h3>
              <button
                type="button"
                onClick={() => setDecliningMeeting(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              State the reason you cannot attend <strong>"{decliningMeeting.title}"</strong> at {decliningMeeting.scheduledTime}. Your partner will see this reason in notifications and chat so they won't need to call you!
            </p>

            <form onSubmit={handleSubmitDecline} className="space-y-3">
              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500">Quick Reasons:</span>
                <div className="flex flex-col gap-1.5">
                  {DECLINE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomDeclineReason(preset)}
                      className={`p-2 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                        customDeclineReason === preset
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or Write Custom Reason:
                </label>
                <textarea
                  value={customDeclineReason}
                  onChange={(e) => setCustomDeclineReason(e.target.value)}
                  placeholder="e.g. Currently in a high-ticket client pitch, can we do 10:15 PM?"
                  className="w-full app-input p-3 text-xs h-20 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecliningMeeting(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm cursor-pointer"
                >
                  Send Reason to Partner
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="app-card w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Video className="w-4 h-4 stroke-3" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Schedule Co-Founder Meeting</h3>
                  <p className="text-xs text-slate-500">Sends notification & vibration alert directly.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meeting Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  placeholder="e.g. Agency Strategy & Client Review"
                  className="w-full app-input px-3.5 py-2 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time & Date</label>
                  <input
                    type="text"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    placeholder="e.g. Today, 09:00 PM"
                    className="w-full app-input px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meet Link / URL</label>
                  <input
                    type="url"
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full app-input px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Invite Co-Founder Partner <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full app-input px-3 py-2 text-xs font-semibold"
                >
                  {foundersList
                    .filter((f) => f.id !== activeUser.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role}) - {p.inviteCode}
                      </option>
                    ))}
                  {foundersList.filter((f) => f.id !== activeUser.id).length === 0 && (
                    <option value="all">All Connected Workspace Partners</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agenda / Description</label>
                <textarea
                  value={meetAgenda}
                  onChange={(e) => setMeetAgenda(e.target.value)}
                  placeholder="1. Review reels&#10;2. Client outreach status"
                  className="w-full app-input px-3.5 py-2 text-xs h-20 resize-none"
                />
              </div>

              <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-100 flex items-center gap-2 text-purple-900 text-[11px] font-semibold">
                <Vibrate className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Scheduling this will send an instant phone vibration and push notification with agree/decline buttons!</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Schedule & Ring Partner
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
