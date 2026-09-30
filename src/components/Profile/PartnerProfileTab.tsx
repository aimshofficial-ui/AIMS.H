import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  Smartphone, 
  RotateCcw, 
  CheckCircle2, 
  UserCheck, 
  Edit3, 
  ExternalLink, 
  LogOut, 
  Radio,
  Image as ImageIcon,
  Sparkles,
  Link,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { SharedAppData, UserProfile } from '../../types';
import { AVATAR_SELECTIONS, saveAppData, resetToFreshData, exportAppDataJson } from '../../utils/storage';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PartnerProfileTabProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onOpenPWAGuide: () => void;
}

export const PartnerProfileTab: React.FC<PartnerProfileTabProps> = ({
  appData,
  onUpdateData,
  onOpenPWAGuide,
}) => {
  const activeUser = appData.founders[appData.activeFounderId] || {
    id: 'founder_temp',
    name: 'You',
    username: 'founder',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'Co-Founder',
    inviteCode: 'AIMSH-XXXX',
    bio: '',
    socials: {},
    focusAreas: [],
    primaryObjective: '',
  };

  const otherFounder = Object.values(appData.founders).find((f) => f.id !== activeUser.id);
  const pairedFounder = appData.partnerConnection.pairedUserId && appData.partnerConnection.pairedUserId !== activeUser.id
    ? appData.founders[appData.partnerConnection.pairedUserId]
    : otherFounder;
  const partnerUser = pairedFounder || otherFounder;

  const [inputCode, setInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Avatar Selection states
  const [avatarGender, setAvatarGender] = useState<'all' | 'male' | 'female'>('all');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(activeUser.name);
  const [editRole, setEditRole] = useState(activeUser.role);
  const [editBio, setEditBio] = useState(activeUser.bio);

  const { isInstallable, install } = usePWAInstall();

  const isConnected = appData.partnerConnection.status === 'accepted';
  const existingSeats = Object.values(appData.founders);

  const filteredAvatars = AVATAR_SELECTIONS.filter((a) => {
    if (avatarGender === 'all') return true;
    return a.gender === avatarGender;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeUser.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSelectAvatar = (url: string) => {
    const updatedProfile: UserProfile = {
      ...activeUser,
      avatar: url,
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
    setSuccessMsg('Avatar updated instantly!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleApplyCustomAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAvatarInput.trim()) return;
    handleSelectAvatar(customAvatarInput.trim());
    setCustomAvatarInput('');
    setShowCustomInput(false);
  };

  const handleConnectPartner = (e: React.FormEvent) => {
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

    // Look for matching user in founders
    const matchedPartner = Object.values(appData.founders).find((f) => f.inviteCode === trimmed);
    const partnerId = matchedPartner ? matchedPartner.id : `partner_${Date.now()}`;

    const updatedFounders = { ...appData.founders };
    if (!matchedPartner) {
      updatedFounders[partnerId] = {
        id: partnerId,
        name: 'Co-Founder Partner',
        username: 'partner',
        email: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: 'Co-Founder',
        inviteCode: trimmed,
        bio: 'Connected via real-time invite code.',
        socials: {},
        focusAreas: ['Shared Operations'],
        primaryObjective: 'Build and scale together.',
      };
    }

    const updatedData: SharedAppData = {
      ...appData,
      founders: updatedFounders,
      partnerConnection: {
        partnerInviteCode: trimmed,
        status: 'accepted',
        pairedUserId: partnerId,
        pairedAt: new Date().toISOString(),
      },
    };

    saveAppData(updatedData);
    onUpdateData(updatedData);
    setSuccessMsg(`Partner connected! Synced mode is now live.`);
    setInputCode('');
  };

  const handleDisconnect = () => {
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
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      ...activeUser,
      name: editName.trim() || activeUser.name,
      role: editRole.trim() || activeUser.role,
      bio: editBio.trim(),
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
    setIsEditingProfile(false);
    setSuccessMsg('Profile details saved!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSwitchSeat = (targetId: string) => {
    localStorage.setItem('aimsh_active_founder_id', targetId);
    localStorage.removeItem('aimsh_logged_out');
    const updated = {
      ...appData,
      activeFounderId: targetId,
    };
    saveAppData(updated);
    onUpdateData(updated);
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
  };

  const handleResetApp = () => {
    const fresh = resetToFreshData();
    onUpdateData(fresh);
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Toast Notice */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {successMsg}
            </span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700 font-bold text-xs">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Founder Profile Card */}
      <div className="app-card p-5 sm:p-6 space-y-4 bg-linear-to-br from-white via-white to-indigo-50/20 border-indigo-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-600 shadow-md ring-4 ring-indigo-50"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-bold shadow-xs">
                Active
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {activeUser.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  MY SEAT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{activeUser.role}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  Invite Code: {activeUser.inviteCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Details'}</span>
            </button>

            <button
              onClick={handleLogOut}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-rose-200 shadow-2xs"
              title="Log Out from this device"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {activeUser.bio && (
          <p className="text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 italic">
            "{activeUser.bio}"
          </p>
        )}

        {/* Profile Edit Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="pt-3 border-t border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Edit Profile Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs app-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agency Role</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs app-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio & Execution Focus</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs app-input"
                placeholder="Describe your role or mission focus..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                Save Details
              </button>
            </div>
          </form>
        )}
      </div>

      {/* DEDICATED AVATAR SELECTOR (Boy & Girl Avatar Presets) */}
      <div className="app-card p-5 sm:p-6 space-y-4 border-indigo-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Profile Avatar Studio / ছবি নির্বাচন করুন
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                1-Tap Apply
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose from ready-to-use Boy (ছেলে) and Girl (মেয়ে) portraits. Click any photo to apply immediately.
            </p>
          </div>

          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80">
            <button
              onClick={() => setAvatarGender('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                avatarGender === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({AVATAR_SELECTIONS.length})
            </button>
            <button
              onClick={() => setAvatarGender('male')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                avatarGender === 'male'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👦 Boy (ছেলে)</span>
              <span className="text-[10px] opacity-70">
                ({AVATAR_SELECTIONS.filter((a) => a.gender === 'male').length})
              </span>
            </button>
            <button
              onClick={() => setAvatarGender('female')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                avatarGender === 'female'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👧 Girl (মেয়ে)</span>
              <span className="text-[10px] opacity-70">
                ({AVATAR_SELECTIONS.filter((a) => a.gender === 'female').length})
              </span>
            </button>
          </div>
        </div>

        {/* Avatars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
          {filteredAvatars.map((item) => {
            const isSelected = activeUser.avatar === item.url;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectAvatar(item.url)}
                className={`relative group p-2 rounded-2xl border transition-all text-left flex flex-col items-center cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600 shadow-sm'
                    : 'border-slate-200/90 bg-white hover:border-indigo-300 hover:bg-slate-50/60 shadow-2xs'
                }`}
              >
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                  <img
                    src={item.url}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-2xs flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-bold text-slate-800 text-center line-clamp-1 w-full px-1">
                  {item.label.replace(/\s*\((Boy|Girl)\)/i, '')}
                </span>

                <span className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${
                  item.gender === 'male' ? 'text-blue-600' : 'text-rose-500'
                }`}>
                  {item.gender === 'male' ? '👦 Boy' : '👧 Girl'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Image URL Option */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Link className="w-3.5 h-3.5" />
            <span>{showCustomInput ? 'Hide Custom Image URL' : 'Or Paste Custom Image Link / URL'}</span>
          </button>

          {showCustomInput && (
            <form onSubmit={handleApplyCustomAvatar} className="flex-1 w-full sm:w-auto flex items-center gap-2">
              <input
                type="url"
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                placeholder="https://example.com/your-image.jpg"
                className="flex-1 px-3 py-1.5 text-xs app-input"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
              >
                Apply Image
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Co-Founder Partner Status & Pairing Card */}
      <div className="app-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Co-Founder Sync & Connection Status
            </h4>
          </div>
          {isConnected ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE CONNECTED
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
              Standalone Mode
            </span>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {isConnected && partnerUser ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={partnerUser.avatar}
                  alt={partnerUser.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-2xs"
                />
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{partnerUser.name}</h5>
                  <p className="text-[11px] text-slate-500 font-medium">{partnerUser.role}</p>
                  <p className="text-[10px] text-emerald-600 font-mono font-bold mt-0.5">
                    Paired via code: {partnerUser.inviteCode}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Disconnect
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Missions, skills, media hub, habits, and chat messages synchronize in real time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConnectPartner} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Connect to Partner via Invite Code:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. AIMSH-9X12"
                maxLength={12}
                className="flex-1 px-3.5 py-2.5 text-xs app-input font-mono tracking-wider font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition shrink-0 cursor-pointer"
              >
                <span>Pair Partner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              When paired, both partners share live synchronized updates across all tabs.
            </p>
          </form>
        )}
      </div>

      {/* Personal Workstyle & Habits Summary */}
      <div className="app-card p-5 space-y-3 border-slate-200">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          My Personal Workstyle, Habits & Screentime
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Hobbies */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Hobbies & Interests
            </span>
            <div className="flex flex-wrap gap-1">
              {activeUser.hobbies && activeUser.hobbies.length > 0 ? (
                activeUser.hobbies.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100">
                    {h}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Not set yet</span>
              )}
            </div>
          </div>

          {/* Habits */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Daily Habits
            </span>
            <div className="flex flex-wrap gap-1">
              {activeUser.habitStyles && activeUser.habitStyles.length > 0 ? (
                activeUser.habitStyles.map((hb, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-100">
                    {hb}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Not set yet</span>
              )}
            </div>
          </div>

          {/* Screen Time */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Mobile Screentime Target
            </span>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeUser.screenTimeHours || '3-4 Hours'}</span>
            </p>
            <p className="text-[10px] text-slate-400">Personalized focus boundary</p>
          </div>
        </div>
      </div>

      {/* App Controls, PWA, Backup & Reliable Logout */}
      <div className="app-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          System & Account Actions
        </h4>

        <div className="space-y-2">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={install}
              className="w-full p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs flex items-center justify-between hover:bg-indigo-100 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Install App to Home Screen / Dock
              </span>
              <span className="font-bold">Install</span>
            </button>
          )}

          <button
            onClick={onOpenPWAGuide}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-between transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-500" /> PWA Installation & Export Guide
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => exportAppDataJson(appData)}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-between transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-500" /> Export Hub Backup (JSON)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Download</span>
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleLogOut}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Founder Seat (লগ আউট)</span>
            </button>

            <button
              onClick={handleResetApp}
              className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 transition cursor-pointer"
              title="Clear all stored data and reset to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Fresh Blank State</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
