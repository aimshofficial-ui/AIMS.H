import React, { useState } from 'react';
import { X, Users, Copy, Check, ShieldCheck, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { SharedAppData, UserProfile } from '../types';
import { saveAppData } from '../utils/storage';

interface PartnerConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

export const PartnerConnectModal: React.FC<PartnerConnectModalProps> = ({
  isOpen,
  onClose,
  appData,
  onUpdateData,
}) => {
  const activeUser = appData.founders[appData.activeFounderId] || appData.founders.founder_1;
  const partnerUser = appData.activeFounderId === 'founder_1' ? appData.founders.founder_2 : appData.founders.founder_1;

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeUser.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('Please enter an invite code.');
      return;
    }

    if (trimmed === activeUser.inviteCode) {
      setErrorMsg('You cannot pair with your own invite code.');
      return;
    }

    // Check if matching partner or another user in founders
    const matchedPartner = Object.values(appData.founders).find((f) => f.inviteCode === trimmed);
    const partnerId = matchedPartner ? matchedPartner.id : (appData.activeFounderId === 'founder_1' ? 'founder_2' : 'founder_1');

    const updatedData: SharedAppData = {
      ...appData,
      partnerConnection: {
        partnerInviteCode: trimmed,
        status: 'accepted',
        pairedUserId: partnerId,
        pairedAt: new Date().toISOString(),
      },
    };

    saveAppData(updatedData);
    onUpdateData(updatedData);
    setSuccessMsg(`Successfully paired with ${matchedPartner ? matchedPartner.name : 'Partner'}! Synced Mode is active.`);
    setInputCode('');
  };

  const handleSetPending = () => {
    const updatedData: SharedAppData = {
      ...appData,
      partnerConnection: {
        ...appData.partnerConnection,
        status: 'pending',
      },
    };
    saveAppData(updatedData);
    onUpdateData(updatedData);
  };

  const handleAcceptPair = () => {
    const updatedData: SharedAppData = {
      ...appData,
      partnerConnection: {
        ...appData.partnerConnection,
        status: 'accepted',
        pairedAt: new Date().toISOString(),
      },
    };
    saveAppData(updatedData);
    onUpdateData(updatedData);
    setSuccessMsg('Partner request accepted! Synced Mode is now LIVE across both devices.');
  };

  const handleUnpair = () => {
    const updatedData: SharedAppData = {
      ...appData,
      partnerConnection: {
        partnerInviteCode: '',
        status: 'none',
        pairedUserId: '',
      },
    };
    saveAppData(updatedData);
    onUpdateData(updatedData);
    setSuccessMsg('Partner disconnected. Switched to standalone mode.');
  };

  const isSynced = appData.partnerConnection.status === 'accepted';
  const isPending = appData.partnerConnection.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-xl overflow-hidden rounded-2xl glass-panel-glow border border-cyan-500/30 p-6 text-slate-100 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Co-Founder Pairing System
                {isSynced && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SYNCED
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect your partner using a 6-character Invite Code to synchronize missions, skills, habits, and assets in real-time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Step 1: Your Unique Invite Code */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Your Unique Invite Code
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Share with your partner</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 py-2.5 px-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 font-mono text-lg font-bold tracking-widest flex items-center justify-between shadow-inner">
              <span>{activeUser.inviteCode}</span>
              <span className="text-xs font-sans text-slate-500 font-normal">({activeUser.name})</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition flex items-center gap-2 text-xs font-semibold shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Step 2: Connect or Current Partner Status */}
        {isSynced ? (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={partnerUser.avatar}
                  alt={partnerUser.name}
                  className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    {partnerUser.name}
                    <span className="text-xs text-slate-400 font-normal">(@{partnerUser.username})</span>
                  </h4>
                  <p className="text-xs text-emerald-400 font-mono">
                    Code: {partnerUser.inviteCode} • Role: {partnerUser.role}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  ACTIVE SYNC
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Missions, skills growth, habit streaks, asset libraries, and messages are automatically synchronizing across tabs and devices.
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-[11px] text-slate-400">
                Paired: {new Date(appData.partnerConnection.pairedAt || Date.now()).toLocaleDateString()}
              </span>
              <button
                onClick={handleUnpair}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline transition"
              >
                Disconnect Partner
              </button>
            </div>
          </div>
        ) : isPending ? (
          <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                Connection Request Pending
              </div>
              <span className="text-xs font-mono text-amber-400">
                Code: {appData.partnerConnection.partnerInviteCode || partnerUser.inviteCode}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Awaiting partner confirmation. Click "Accept & Sync" to complete pairing immediately.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAcceptPair}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
              >
                Accept & Enable Synced Mode
              </button>
              <button
                onClick={handleUnpair}
                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="mt-4 p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Enter Partner's Invite Code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. AIMSH-H74Y"
                className="flex-1 py-2 px-3 rounded-xl glass-input font-mono text-sm tracking-widest placeholder:text-slate-500"
                maxLength={10}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
              >
                Connect <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Default partner code: <button type="button" onClick={() => setInputCode(partnerUser.inviteCode)} className="text-cyan-400 underline font-mono">{partnerUser.inviteCode}</button> ({partnerUser.name})
            </p>
          </form>
        )}

        {/* Quick Testing Controls */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Co-Founder Simulation Controls
            </span>
            <span className="text-[10px] text-slate-500">Test different states instantly</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleAcceptPair}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                isSynced
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Force Synced Mode
            </button>
            <button
              onClick={handleSetPending}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                isPending
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Simulate Pending
            </button>
            <button
              onClick={handleUnpair}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                !isSynced && !isPending
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Reset to Standalone
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
