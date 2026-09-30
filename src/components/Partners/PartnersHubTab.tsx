import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Copy, 
  Check, 
  UserPlus, 
  Briefcase, 
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
  Vibrate,
  UserMinus,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SharedAppData, PartnerRequest, UserProfile, PartnerConnection } from '../../types';
import { saveAppData } from '../../utils/storage';
import { cloudSync } from '../../utils/cloudSync';
import { getPartnerForUser, cleanAppData } from '../../utils/partnerHelper';
import { pushAppNotification, triggerMobileAlert } from '../../utils/notifications';

interface PartnersHubTabProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onNavigateToChat: () => void;
}

// 3D Geometric Torus & Sphere SVG Art
const Torus3DArt: React.FC<{ color?: string; size?: string }> = ({ color = 'orange', size = 'w-16 h-16' }) => {
  return (
    <svg className={`${size} opacity-85 select-none drop-shadow-md pointer-events-none`} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`partner3d-${color}`} cx="35%" cy="35%" r="65%">
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
        <radialGradient id={`partnerSphere-${color}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      
      <circle cx="50" cy="50" r="32" stroke={`url(#partner3d-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="50" cy="50" r="32" stroke={`url(#partnerSphere-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="72" cy="28" r="8" fill={`url(#partner3d-${color})`} />
      <circle cx="72" cy="28" r="8" fill={`url(#partnerSphere-${color})`} />
      <circle cx="28" cy="68" r="5" fill={`url(#partner3d-${color})`} />
    </svg>
  );
};

const AVAILABILITY_OPTIONS = [
  'Available for Execution',
  'In Strategy Call',
  'Reviewing Deliverables',
  'Client Meeting',
  'Focus Mode / Do Not Disturb',
] as const;

export const PartnersHubTab: React.FC<PartnersHubTabProps> = ({
  appData,
  onUpdateData,
  onNavigateToChat,
}) => {
  const [partnerInputCode, setPartnerInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [requestSentNotice, setRequestSentNotice] = useState('');
  const [myCurrentTask, setMyCurrentTask] = useState('');
  const [isEditingTask, setIsEditingTask] = useState(false);

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    inviteCode: 'AIMSH-MINE',
  };

  const myStatus = appData.partnerStatuses[activeUser.id] || {
    userId: activeUser.id,
    isOnline: true,
    currentTask: 'Directing agency sprint & client deliverables',
    availability: 'Available for Execution',
    lastSeen: 'Active now',
    sessionMinutes: 28,
  };

  // Find partner strictly using partnerHelper
  const pairedPartner = getPartnerForUser(appData, activeUser.id);
  const isConnected = !!pairedPartner;

  // Incoming pending requests directed to this user's invite code
  const incomingRequests = appData.partnerRequests.filter(
    (req) => req.status === 'pending' && (req.targetInviteCode === activeUser.inviteCode || !req.targetInviteCode)
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeUser.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Send a pairing request to another partner's invite code
  const handleSendPairRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSentNotice('');

    const targetCode = partnerInputCode.trim().toUpperCase();
    if (!targetCode) return;

    if (targetCode === activeUser.inviteCode) {
      setRequestSentNotice('You cannot pair with your own invite code.');
      return;
    }

    // Call CloudSync to broadcast invite to the real user on any device
    const res = await cloudSync.sendPartnerInvite(activeUser.id, targetCode);

    if (res.success) {
      setPartnerInputCode('');
      setRequestSentNotice(
        res.isTargetOnline
          ? `🎉 Connection request sent directly to ${res.targetPartnerName || targetCode}! They can now click Allow & Connect.`
          : `✅ Connection request registered for ${targetCode}! When your partner opens the app with code ${targetCode}, they will see the alert.`
      );

      triggerMobileAlert({
        title: '🤝 Connection Request Sent!',
        message: `Waiting for ${targetCode} to accept...`,
        vibratePattern: [150, 100, 150],
      });
    } else {
      setRequestSentNotice(`⚠️ ${res.error || 'Failed to send invite'}`);
    }
  };

  // Accept incoming request
  const handleAcceptRequest = async (req: PartnerRequest) => {
    await cloudSync.acceptPartnerRequest(req.id, activeUser.id);
    triggerMobileAlert({
      title: '🎉 Partner Connected!',
      message: `You are now linked with ${req.fromUserName}!`,
      vibratePattern: [300, 150, 300, 150, 500],
    });
  };

  // Decline incoming request
  const handleDeclineRequest = (reqId: string) => {
    const updatedRequests = appData.partnerRequests.map((r) =>
      r.id === reqId ? { ...r, status: 'declined' as const } : r
    );
    const updatedData: SharedAppData = {
      ...appData,
      partnerRequests: updatedRequests,
    };
    saveAppData(updatedData, true);
    cloudSync.syncState(updatedData);
    onUpdateData(updatedData);
  };

  // Disconnect partner
  const handleDisconnectPartner = async () => {
    if (!confirm('Are you sure you want to disconnect from this partner?')) return;
    await cloudSync.disconnectPartner();
    const updatedConnection: PartnerConnection = {
      partnerInviteCode: '',
      status: 'none',
      pairedUserId: '',
    };
    const updatedData = {
      ...appData,
      partnerConnection: updatedConnection,
    };
    saveAppData(updatedData, true);
    onUpdateData(updatedData);
  };

  // Change active user's availability
  const handleChangeAvailability = (newAvail: typeof AVAILABILITY_OPTIONS[number]) => {
    const updatedStatus = {
      ...myStatus,
      availability: newAvail,
    };
    const updated = {
      ...appData,
      partnerStatuses: {
        ...appData.partnerStatuses,
        [activeUser.id]: updatedStatus,
      },
    };
    saveAppData(updated);
    onUpdateData(updated);
  };

  // Save current working task
  const handleSaveCurrentTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myCurrentTask.trim()) return;

    const updatedStatus = {
      ...myStatus,
      currentTask: myCurrentTask.trim(),
    };
    const updated = {
      ...appData,
      partnerStatuses: {
        ...appData.partnerStatuses,
        [activeUser.id]: updatedStatus,
      },
    };
    saveAppData(updated);
    onUpdateData(updated);
    setIsEditingTask(false);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans pb-12">
      
      {/* 1. HERO BANNER: 3D Minimalist Co-Founder Dual Hub */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-5 sm:p-6 shadow-xl shadow-indigo-500/20"
      >
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
          <Torus3DArt color="pink" size="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              Co-Founder Real-Time Connection Hub
            </span>

            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
              isConnected
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-400/30'
                : 'bg-amber-950/40 text-amber-300 border-amber-400/30'
            }`}>
              {isConnected ? '● Partner Linked' : '○ Standalone / Ready to Pair'}
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {isConnected && pairedPartner
                ? `Workspace linked with ${pairedPartner.name}`
                : 'Connect with your Co-Founder Partner'}
            </h2>
            <p className="text-xs text-indigo-100 mt-1 max-w-md">
              Both partners can see each other's live presence, tasks, skills, and meetings in real-time without delay.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-200">
                Your Invite Code: <strong className="font-mono text-white bg-white/20 px-2 py-0.5 rounded-md">{activeUser.inviteCode}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1 px-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={onNavigateToChat}
              className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Messenger</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. PENDING INCOMING REQUESTS (Prominent 1-Tap Acceptance Card) */}
      {incomingRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-800 px-1 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Incoming Connection Requests ({incomingRequests.length})</span>
          </h3>

          <div className="space-y-2">
            {incomingRequests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-pastel-orange p-4 rounded-3xl relative overflow-hidden shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={req.fromUserAvatar}
                    alt={req.fromUserName}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-slate-900">{req.fromUserName}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white text-orange-900 font-bold border border-orange-200">
                        Code: {req.fromInviteCode}
                      </span>
                    </div>
                    <p className="text-xs text-orange-950 font-semibold">{req.fromUserRole} wants to connect with your workspace</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept & Connect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeclineRequest(req.id)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-slate-200 cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 3. YOUR SEAT & LIVE STATUS (3D Pastel Card) */}
      <div className="card-pastel-blue p-4 sm:p-5 rounded-3xl relative overflow-hidden shadow-sm space-y-3">
        <div className="absolute right-2 top-2 pointer-events-none">
          <Torus3DArt color="blue" size="w-18 h-18" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-[85%]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">{activeUser.name} (You)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{activeUser.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Availability:</span>
            <select
              value={myStatus.availability}
              onChange={(e) => handleChangeAvailability(e.target.value as any)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold shadow-2xs outline-none cursor-pointer"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Working Task Bar */}
        <div className="relative z-10 p-3 bg-white/90 rounded-2xl border border-sky-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs flex-1">
            <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-700 shrink-0">Working on:</span>
            {isEditingTask ? (
              <form onSubmit={handleSaveCurrentTask} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={myCurrentTask}
                  onChange={(e) => setMyCurrentTask(e.target.value)}
                  placeholder="e.g. Closing client contract, high-ticket reels..."
                  className="flex-1 px-2.5 py-1 text-xs app-input"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold cursor-pointer"
                >
                  Save
                </button>
              </form>
            ) : (
              <span className="text-slate-700 font-medium truncate">{myStatus.currentTask}</span>
            )}
          </div>

          {!isEditingTask && (
            <button
              onClick={() => {
                setMyCurrentTask(myStatus.currentTask);
                setIsEditingTask(true);
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer shrink-0"
            >
              Update
            </button>
          )}
        </div>
      </div>

      {/* 4. BILATERAL ROSTER: YOU & YOUR CONNECTED PARTNER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Co-Founder Workspace Seats ({isConnected ? 2 : 1})</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            Real-Time Bilateral Sync Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* YOU (ACTIVE USER) */}
          <div className="p-4 sm:p-5 rounded-3xl card-pastel-blue relative overflow-hidden shadow-sm space-y-3">
            <div className="absolute right-2 top-2 pointer-events-none">
              <Torus3DArt color="blue" size="w-16 h-16" />
            </div>

            <div className="relative z-10 flex items-start justify-between gap-3 max-w-[85%]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-slate-900">{activeUser.name}</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-white text-slate-800 font-black">
                      YOU
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{activeUser.role} • Code: {activeUser.inviteCode}</p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Now
              </span>
            </div>

            <div className="relative z-10 p-2.5 rounded-2xl bg-white/80 border border-slate-200/80 space-y-1 text-xs">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Current Focus:</span>
              </div>
              <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                {myStatus.currentTask}
              </p>
            </div>
          </div>

          {/* REAL CONNECTED PARTNER OR CONNECT PROMPT */}
          {pairedPartner ? (
            <div className="p-4 sm:p-5 rounded-3xl card-pastel-pink relative overflow-hidden shadow-sm space-y-3">
              <div className="absolute right-2 top-2 pointer-events-none">
                <Torus3DArt color="pink" size="w-16 h-16" />
              </div>

              <div className="relative z-10 flex items-start justify-between gap-3 max-w-[85%]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={pairedPartner.avatar}
                      alt={pairedPartner.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">{pairedPartner.name}</h4>
                    <p className="text-[11px] text-slate-600 font-medium">{pairedPartner.role} • Code: {pairedPartner.inviteCode}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </div>

              <div className="relative z-10 p-2.5 rounded-2xl bg-white/80 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Partner Focus:</span>
                </div>
                <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                  {(appData.partnerStatuses[pairedPartner.id] || {}).currentTask || 'Active in shared agency workspace'}
                </p>
              </div>

              {/* Action Buttons for Connected Partner */}
              <div className="relative z-10 pt-1 flex items-center flex-wrap justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleDisconnectPartner}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 flex items-center gap-1 cursor-pointer transition"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-bold text-slate-800">No Partner Connected Yet</h5>
              <p className="text-[11px] text-slate-400 max-w-[220px]">
                Enter your partner's invite code below or share your code <strong className="font-mono text-slate-700">{activeUser.inviteCode}</strong> to pair in real-time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. CONNECT PARTNER BY CODE FORM */}
      <div className="card-pastel-pink p-5 rounded-3xl relative overflow-hidden shadow-sm space-y-4">
        <div className="absolute right-2 top-2 pointer-events-none">
          <Torus3DArt color="pink" size="w-20 h-20" />
        </div>

        <div className="relative z-10 max-w-[85%]">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-pink-600" />
            Connect With Another Partner (Invite System)
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Enter your co-founder's unique invite code. They will receive an instant incoming request to pair workspaces.
          </p>
        </div>

        <form onSubmit={handleSendPairRequest} className="relative z-10 flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={partnerInputCode}
            onChange={(e) => setPartnerInputCode(e.target.value)}
            placeholder="e.g. AIMSH-7B4K"
            className="w-full sm:w-64 font-mono uppercase text-xs px-3.5 py-2.5 app-input bg-white shadow-2xs font-bold"
          />
          <button
            type="submit"
            disabled={!partnerInputCode.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Partner Request</span>
          </button>
        </form>

        {requestSentNotice && (
          <div className="relative z-10 p-3 rounded-2xl bg-white/95 border border-pink-200 text-xs font-bold text-pink-900 flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{requestSentNotice}</span>
          </div>
        )}
      </div>

    </div>
  );
};
