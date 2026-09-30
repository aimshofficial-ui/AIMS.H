import React, { useState } from 'react';
import { X, User, Mail, AtSign, Lock, Sparkles, Check } from 'lucide-react';
import { SharedAppData, UserProfile } from '../../types';
import { AVATAR_OPTIONS, generateInviteCode, saveAppData } from '../../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  mode?: 'login' | 'signup' | 'switch';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  appData,
  onUpdateData,
  mode = 'switch',
}) => {
  const [currentTab, setCurrentTab] = useState<'switch' | 'signup'>('switch');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Agency Co-Founder');
  const [bio, setBio] = useState('Focusing on high-leverage execution and strategic agency growth.');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectFounder = (founderId: string) => {
    const updated: SharedAppData = {
      ...appData,
      activeFounderId: founderId,
    };
    saveAppData(updated);
    onUpdateData(updated);
    onClose();
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !username.trim() || !email.trim()) {
      setErrorMsg('Please fill in Name, Username, and Email.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const newId = `user_${Date.now()}`;
    const newInviteCode = generateInviteCode('AIMSH');

    const newProfile: UserProfile = {
      id: newId,
      name: name.trim(),
      username: cleanUsername,
      email: email.trim(),
      avatar: selectedAvatar,
      role: role.trim() || 'Co-Founder',
      inviteCode: newInviteCode,
      bio: bio.trim(),
      socials: {
        linkedin: `https://linkedin.com/in/${cleanUsername}`,
        twitter: `https://x.com/${cleanUsername}`,
      },
      focusAreas: ['Agency Systems', 'Growth Strategy'],
      primaryObjective: 'Scale operations and reach product-market mastery with partner.',
    };

    const updatedFounders = {
      ...appData.founders,
      [newId]: newProfile,
    };

    const updatedData: SharedAppData = {
      ...appData,
      founders: updatedFounders,
      activeFounderId: newId,
    };

    saveAppData(updatedData);
    onUpdateData(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl glass-panel-glow border border-cyan-500/30 p-6 text-slate-100 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Founder Profile & Authentication
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch between co-founder seats or register a new founder profile.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="mt-4 flex rounded-xl bg-slate-900/80 p-1 border border-white/10">
          <button
            onClick={() => setCurrentTab('switch')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              currentTab === 'switch'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch Existing Seat
          </button>
          <button
            onClick={() => setCurrentTab('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              currentTab === 'signup'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Register New Founder
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {currentTab === 'switch' ? (
          <div className="mt-5 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Available Co-Founder Profiles
            </span>
            <div className="space-y-2.5">
              {Object.values(appData.founders).map((founder) => {
                const isActive = appData.activeFounderId === founder.id;
                return (
                  <div
                    key={founder.id}
                    onClick={() => handleSelectFounder(founder.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={founder.avatar}
                        alt={founder.name}
                        className={`w-11 h-11 rounded-full object-cover border-2 ${
                          isActive ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-slate-700'
                        }`}
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          {founder.name}
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                              ACTIVE
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400">
                          @{founder.username} • <span className="text-slate-300">{founder.role}</span>
                        </p>
                        <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                          Code: {founder.inviteCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <div className="p-1.5 rounded-full bg-cyan-500 text-slate-950">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-xs text-cyan-400 font-medium hover:underline">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAccount} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Choose Avatar
              </label>
              <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                {AVATAR_OPTIONS.map((av, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedAvatar(av)}
                    className={`relative rounded-full shrink-0 transition ${
                      selectedAvatar === av
                        ? 'ring-2 ring-cyan-400 scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zaid M."
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="zaid_aimsh"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="zaid@aimsh-agency.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Agency Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Head of Paid Performance & Funnels"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Personal Bio / Focus
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
              />
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              A unique 6-character Invite Code will be automatically generated upon creation.
            </p>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
            >
              Create Account & Log In
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
          <span>Persistent session in LocalStorage active.</span>
          <button
            onClick={onClose}
            className="hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
