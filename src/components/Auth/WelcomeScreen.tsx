import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Users, Smartphone, KeyRound, Check } from 'lucide-react';
import { SharedAppData, UserProfile } from '../../types';
import { AVATAR_OPTIONS, generateInviteCode, saveAppData } from '../../utils/storage';

interface WelcomeScreenProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ appData, onUpdateData }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Agency Co-Founder');
  const [partnerCode, setPartnerCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  // Existing founders if any
  const existingFoundersList = Object.values(appData.founders);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    const newId = `founder_${Date.now()}`;
    const cleanUsername = name.trim().toLowerCase().replace(/\s+/g, '_');
    const myInviteCode = generateInviteCode('AIMSH');

    const newProfile: UserProfile = {
      id: newId,
      name: name.trim(),
      username: cleanUsername,
      email: `${cleanUsername}@aimsh-agency.com`,
      avatar: selectedAvatar,
      role: role.trim() || 'Co-Founder',
      inviteCode: myInviteCode,
      bio: 'Building, testing, and executing missions with my co-founder in real-time.',
      socials: {},
      focusAreas: ['Agency Scaling', 'Execution'],
      primaryObjective: 'Scale agency operations and execute shared client missions.',
    };

    // Check if partner code entered matches an existing founder in database
    const trimmedPartnerCode = partnerCode.trim().toUpperCase();
    let partnerStatus: 'none' | 'pending' | 'accepted' = 'none';
    let pairedUserId = '';

    if (trimmedPartnerCode) {
      partnerStatus = 'accepted';
      const matched = Object.values(appData.founders).find((f) => f.inviteCode === trimmedPartnerCode);
      if (matched) {
        pairedUserId = matched.id;
      }
    }

    const updatedData: SharedAppData = {
      ...appData,
      founders: {
        ...appData.founders,
        [newId]: newProfile,
      },
      activeFounderId: newId,
      partnerConnection: {
        partnerInviteCode: trimmedPartnerCode,
        status: partnerStatus,
        pairedUserId,
        pairedAt: trimmedPartnerCode ? new Date().toISOString() : undefined,
      },
    };

    saveAppData(updatedData);
    onUpdateData(updatedData);
  };

  const handleSelectExisting = (founderId: string) => {
    const updated = {
      ...appData,
      activeFounderId: founderId,
    };
    saveAppData(updated);
    onUpdateData(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-light-pattern flex items-center justify-center p-4 sm:p-6 text-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md space-y-5"
      >
        {/* App Logo & Welcome Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 mb-1">
            <span className="font-mono font-black text-xl tracking-wider">AH</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            AIMS.H Hub
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Empowering Co-Founders. Testing Ideas. Executing Missions.
          </p>
        </div>

        {/* Existing Accounts Quick Switch if any */}
        {existingFoundersList.length > 0 && (
          <div className="app-card p-4 space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Continue as Existing Founder:
            </span>
            <div className="space-y-2">
              {existingFoundersList.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectExisting(f.id)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500/50 hover:bg-indigo-50/50 transition flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <img src={f.avatar} alt={f.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{f.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Code: {f.inviteCode}</div>
                    </div>
                  </div>
                  <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                    Log In <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Create Seat Card */}
        <div className="app-card p-6 space-y-5 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {existingFoundersList.length > 0 ? 'Or Register New Co-Founder' : 'Set Up Your Founder Seat'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your name and pick an avatar. You'll receive a unique Invite Code to share with your partner.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-4">
            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                {AVATAR_OPTIONS.map((av, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedAvatar(av)}
                    className={`relative rounded-full shrink-0 transition ${
                      selectedAvatar === av
                        ? 'ring-3 ring-indigo-600 ring-offset-2 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name (আপনার নাম) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aiman S."
                className="w-full px-3.5 py-2.5 text-xs app-input"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Agency Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Tech & Systems Lead, Creative Director"
                className="w-full px-3.5 py-2.5 text-xs app-input"
              />
            </div>

            {/* Optional partner code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Partner Invite Code (Optional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Can connect later</span>
              </label>
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="e.g. AIMSH-XXXX"
                maxLength={10}
                className="w-full px-3.5 py-2.5 text-xs app-input font-mono tracking-wider"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition"
            >
              Start Fresh & Enter Hub <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Feature Highlights Card */}
        <div className="grid grid-cols-3 gap-2 text-center text-slate-600">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <span className="text-[11px] font-semibold block text-slate-800">Clean & Fresh</span>
            <span className="text-[10px] text-slate-400">Zero pre-set clutter</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <Users className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
            <span className="text-[11px] font-semibold block text-slate-800">Partner Code</span>
            <span className="text-[10px] text-slate-400">Sync with friend</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <Smartphone className="w-4 h-4 text-sky-500 mx-auto mb-1" />
            <span className="text-[11px] font-semibold block text-slate-800">Mobile Native</span>
            <span className="text-[10px] text-slate-400">Bottom tab dock</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
