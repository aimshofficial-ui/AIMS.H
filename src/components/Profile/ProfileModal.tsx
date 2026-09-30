import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Copy, 
  Radio, 
  LogOut, 
  RotateCcw, 
  Download, 
  ExternalLink, 
  User, 
  Sparkles,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { SharedAppData, UserProfile } from '../../types';
import { AVATAR_SELECTIONS, saveAppData, resetToFreshData, exportAppDataJson } from '../../utils/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onOpenPWAGuide: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  appData,
  onUpdateData,
  onOpenPWAGuide,
}) => {
  const activeUser = appData.founders[appData.activeFounderId] || {
    id: 'user_1',
    name: 'Co-Founder',
    username: 'founder',
    email: 'founder@aimsh.hub',
    avatar: AVATAR_SELECTIONS[0].url,
    role: 'Agency Co-Founder',
    inviteCode: 'AIMSH-MINE',
    bio: 'Executing high-leverage agency missions.',
    socials: { portfolio: '', linkedin: '', twitter: '', youtube: '' },
    focusAreas: ['Agency Scaling'],
    primaryObjective: 'Execute and scale.',
  };

  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [selectedAvatar, setSelectedAvatar] = useState(activeUser.avatar);
  const [name, setName] = useState(activeUser.name);
  const [role, setRole] = useState(activeUser.role);
  const [bio, setBio] = useState(activeUser.bio || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);

  const filteredAvatars = AVATAR_SELECTIONS.filter((a) => {
    if (genderFilter === 'all') return true;
    return a.gender === genderFilter;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeUser.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedProfile: UserProfile = {
      ...activeUser,
      name: name.trim(),
      role: role.trim() || 'Co-Founder',
      bio: bio.trim(),
      avatar: selectedAvatar,
    };

    const updatedData: SharedAppData = {
      ...appData,
      founders: {
        ...appData.founders,
        [activeUser.id]: updatedProfile,
      },
    };

    saveAppData(updatedData);
    onUpdateData(updatedData);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2500);
  };

  const handleLogOut = () => {
    localStorage.removeItem('aimsh_active_founder_id');
    localStorage.setItem('aimsh_logged_out', 'true');
    const updated = {
      ...appData,
      activeFounderId: '',
    };
    saveAppData(updated);
    onUpdateData(updated);
    onClose();
  };

  const handleResetApp = () => {
    const fresh = resetToFreshData();
    onUpdateData(fresh);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 my-6"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-linear-to-r from-slate-50 to-indigo-50/30 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Your Co-Founder Profile</h3>
                  <p className="text-[11px] text-slate-500">Manage identity, avatar, seat, and workspace controls</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Profile Overview Card with Selected Avatar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedAvatar}
                    alt={activeUser.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-600 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 truncate">{name || activeUser.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate">{role || activeUser.role}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">Code: {activeUser.inviteCode}</p>
                </div>
              </div>

              {/* Avatar Selector with Male (ছেলে) and Female (মেয়ে) Tabs */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Avatar (ছেলে / মেয়ে)
                  </label>

                  {/* Gender Filter Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setGenderFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        genderFilter === 'all'
                          ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenderFilter('male')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        genderFilter === 'male'
                          ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Male (ছেলে)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenderFilter('female')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        genderFilter === 'female'
                          ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Female (মেয়ে)
                    </button>
                  </div>
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-4 gap-2.5">
                  {filteredAvatars.map((item) => {
                    const isSelected = selectedAvatar === item.url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedAvatar(item.url)}
                        className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-102 shadow-sm'
                            : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                        }`}
                      >
                        <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/60 backdrop-blur-2xs text-[9px] text-white py-0.5 text-center truncate px-1">
                          {item.gender === 'male' ? 'Male' : 'Female'}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Edit Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs app-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Role / Focus</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs app-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Mission Statement</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 text-xs app-input"
                    placeholder="Short bio about your role in this agency..."
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {saveNotice ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Profile updated successfully!
                    </span>
                  ) : <div />}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Unique Invite Code Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                  Your Unique Invite Code:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-indigo-700 tracking-wider">
                    {activeUser.inviteCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* App Controls, PWA & Logout Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={onOpenPWAGuide}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-500" /> PWA Installation & Native Export
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => exportAppDataJson(appData)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-slate-500" /> Backup Data (JSON)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Download</span>
                </button>

                {/* Explicit Log Out & Reset Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={handleLogOut}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out</span>
                  </button>

                  <button
                    onClick={handleResetApp}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Blank</span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
