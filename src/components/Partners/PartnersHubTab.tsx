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
  Activity
} from 'lucide-react';
import { SharedAppData, PartnerRequest, UserProfile } from '../../types';
import { saveAppData } from '../../utils/storage';

interface PartnersHubTabProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onNavigateToChat: () => void;
}

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeUser.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Send a pairing request to another partner's invite code
  const handleSendPairRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSentNotice('');

    const targetCode = partnerInputCode.trim().toUpperCase();
    if (!targetCode) return;

    if (targetCode === activeUser.inviteCode) {
      setRequestSentNotice('You cannot pair with your own invite code.');
      return;
    }

    const newReq: PartnerRequest = {
      id: `req-${Date.now()}`,
      fromUserId: activeUser.id,
      fromUserName: activeUser.name,
      fromUserAvatar: activeUser.avatar,
      fromUserRole: activeUser.role,
      fromInviteCode: activeUser.inviteCode,
      targetInviteCode: targetCode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };

    const updated = {
      ...appData,
      partnerRequests: [newReq, ...appData.partnerRequests],
    };

    saveAppData(updated);
    onUpdateData(updated);
    setPartnerInputCode('');
    setRequestSentNotice(`Pairing request sent to ${targetCode}! The partner will see a bell icon notification to accept.`);
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
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="app-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Agency Partners & Live Co-Founder Roster
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Presence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time active status, tasks, availability & instant bell-pairing requests.
          </p>
        </div>

        <button
          onClick={onNavigateToChat}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Open Messenger</span>
        </button>
      </div>

      {/* Your Seat & Live Status Controller */}
      <div className="app-card p-5 space-y-3 bg-linear-to-br from-white to-indigo-50/20 border-indigo-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-sm"
              />
              {/* Blue checkmark / active indicator for Online */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{activeUser.name} (You)</h3>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500">{activeUser.role}</p>
            </div>
          </div>

          {/* Quick Availability Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Your Availability:</span>
            <select
              value={myStatus.availability}
              onChange={(e) => handleChangeAvailability(e.target.value as any)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold shadow-2xs outline-none focus:border-indigo-500"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Working Task Bar */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs flex-1">
            <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-700 shrink-0">Working on:</span>
            {isEditingTask ? (
              <form onSubmit={handleSaveCurrentTask} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={myCurrentTask}
                  onChange={(e) => setMyCurrentTask(e.target.value)}
                  placeholder="e.g., Closing client contract, editing high-retention reel..."
                  className="flex-1 px-2 py-1 text-xs app-input"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold"
                >
                  Save
                </button>
              </form>
            ) : (
              <span className="text-slate-600 truncate">{myStatus.currentTask}</span>
            )}
          </div>

          {!isEditingTask && (
            <button
              onClick={() => {
                setMyCurrentTask(myStatus.currentTask);
                setIsEditingTask(true);
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition shrink-0"
            >
              Update
            </button>
          )}
        </div>
      </div>

      {/* Partners List (All Registered Co-Founders) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            All Co-Founders & Partners ({foundersList.length})
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            Blue tick = Active · Red tick = Offline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {foundersList.map((partner) => {
            const isMe = partner.id === activeUser.id;
            const status = appData.partnerStatuses[partner.id] || {
              userId: partner.id,
              isOnline: isMe ? true : false,
              currentTask: isMe ? myStatus.currentTask : 'Reviewing Q4 strategy & marketing assets',
              availability: isMe ? myStatus.availability : 'Available for Execution',
              lastSeen: isMe ? 'Active now' : 'Seen 14m ago',
              sessionMinutes: isMe ? 28 : 15,
            };

            const isOnline = isMe || status.isOnline;

            return (
              <div
                key={partner.id}
                className="app-card p-4 space-y-3 relative hover:border-indigo-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                      />
                      {/* Status Checkmark Badge: Blue check for active, Red check for offline */}
                      {isOnline ? (
                        <span
                          className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white shadow-xs"
                          title="Active / Online"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span
                          className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-white flex items-center justify-center ring-2 ring-white shadow-xs"
                          title="Offline"
                        >
                          <XCircle className="w-3 h-3 stroke-[2.5]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{partner.name}</h4>
                        {isMe && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{partner.role}</p>
                    </div>
                  </div>

                  {/* Active / Offline Pill with Color-coded styling */}
                  {isOnline ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      Active Now
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      Offline
                    </span>
                  )}
                </div>

                {/* What they are working on */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Current Focus:</span>
                  </div>
                  <p className="text-slate-600 pl-4.5 text-[11px] leading-relaxed">
                    {status.currentTask || 'Focusing on high leverage agency deliverables'}
                  </p>
                </div>

                {/* Availability & Session Time */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    {status.availability}
                  </span>

                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {status.lastSeen} ({status.sessionMinutes}m logged)
                  </span>
                </div>

                {!isMe && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={onNavigateToChat}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Direct Message
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unique Invite Code & Partner Connection Form with Bell Request System */}
      <div className="app-card p-5 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            Connect With Another Partner (Bell Request System)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Each partner has a unique code. When you send a request, a bell notification appears instantly for them to accept.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Your Unique Code */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Your Unique Invite Code:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-indigo-600 tracking-wider">
                {activeUser.inviteCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Share this code with your co-founder so they can link with your workspace.
            </p>
          </div>

          {/* Connect Partner Form */}
          <form onSubmit={handleSendPairRequest} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Connect Partner By Code:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={partnerInputCode}
                onChange={(e) => setPartnerInputCode(e.target.value)}
                placeholder="e.g., AIMSH-9X2Y"
                className="flex-1 font-mono uppercase text-xs px-3 py-1.5 app-input"
              />
              <button
                type="submit"
                disabled={!partnerInputCode.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Send Request</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              A connection request will be sent to their notification bell.
            </p>
          </form>

        </div>

        {requestSentNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{requestSentNotice}</span>
          </div>
        )}
      </div>

    </div>
  );
};
