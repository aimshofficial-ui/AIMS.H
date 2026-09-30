import React, { useState, useRef } from 'react';
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
  UserPlus,
  Building2,
  Upload,
  Trash2
} from 'lucide-react';
import { SharedAppData, UserProfile, AgencySettings } from '../../types';
import { cloudSync } from '../../utils/cloudSync';
import { 
  AVATAR_SELECTIONS, 
  saveAppData, 
  resetToFreshData, 
  exportAppDataJson, 
  downloadOneTimeBackup, 
  importAppDataJson 
} from '../../utils/storage';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PartnerProfileTabProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onOpenPWAGuide: () => void;
}

// Preset modern 3D agency logos / emblems
const PRESET_AGENCY_LOGOS = [
  {
    id: 'emblem-1',
    label: 'Apex Neon Orbit',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'emblem-2',
    label: 'Cyber Violet Core',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'emblem-3',
    label: 'Prism Geometry',
    url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'emblem-4',
    label: 'Sunset Minimalist',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'emblem-5',
    label: 'Studio Black & Silver',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  },
];

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

  // Agency Branding State
  const [agencyName, setAgencyName] = useState(appData.agencySettings?.agencyName || 'AIMS.H Workspace');
  const [agencyTagline, setAgencyTagline] = useState(appData.agencySettings?.agencyTagline || 'Co-Founder Digital Growth Agency');
  const [customLogoUrl, setCustomLogoUrl] = useState(appData.agencySettings?.agencyLogoUrl || '');
  const [isEditingAgency, setIsEditingAgency] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

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
    saveAppData(updatedData, true);
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

  // Agency Logo File Upload (reads to base64 Data URL)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Image size should be under 3MB.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      if (base64Data) {
        setCustomLogoUrl(base64Data);
        const updatedAgency: AgencySettings = {
          agencyName: agencyName.trim() || 'AIMS.H Workspace',
          agencyTagline: agencyTagline.trim(),
          agencyLogoUrl: base64Data,
        };
        const updatedData: SharedAppData = {
          ...appData,
          agencySettings: updatedAgency,
        };
        saveAppData(updatedData, true);
        onUpdateData(updatedData);
        setSuccessMsg('🎉 Agency Logo uploaded and applied across entire app!');
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply preset emblem
  const handleSelectPresetLogo = (logoUrl: string) => {
    setCustomLogoUrl(logoUrl);
    const updatedAgency: AgencySettings = {
      agencyName: agencyName.trim() || 'AIMS.H Workspace',
      agencyTagline: agencyTagline.trim(),
      agencyLogoUrl: logoUrl,
    };
    const updatedData: SharedAppData = {
      ...appData,
      agencySettings: updatedAgency,
    };
    saveAppData(updatedData, true);
    onUpdateData(updatedData);
    setSuccessMsg('Agency Logo updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Save Agency Branding Form
  const handleSaveAgencyBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAgency: AgencySettings = {
      agencyName: agencyName.trim() || 'AIMS.H Workspace',
      agencyTagline: agencyTagline.trim(),
      agencyLogoUrl: customLogoUrl.trim(),
    };
    const updatedData: SharedAppData = {
      ...appData,
      agencySettings: updatedAgency,
    };
    saveAppData(updatedData, true);
    onUpdateData(updatedData);
    setIsEditingAgency(false);
    setSuccessMsg('Agency Brand settings saved!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Remove Agency Logo
  const handleRemoveLogo = () => {
    setCustomLogoUrl('');
    const updatedAgency: AgencySettings = {
      agencyName: agencyName.trim() || 'AIMS.H Workspace',
      agencyTagline: agencyTagline.trim(),
      agencyLogoUrl: '',
    };
    const updatedData: SharedAppData = {
      ...appData,
      agencySettings: updatedAgency,
    };
    saveAppData(updatedData, true);
    onUpdateData(updatedData);
    setSuccessMsg('Agency logo removed.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleConnectPartner = async (e: React.FormEvent) => {
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

    const res = await cloudSync.sendPartnerInvite(activeUser.id, trimmed);
    if (res.success) {
      setSuccessMsg(
        res.isTargetOnline
          ? `🎉 Connection request sent to ${res.targetPartnerName || trimmed}! They will see the alert immediately.`
          : `✅ Invite registered for code ${trimmed}. Once your partner opens the app with this code, you will connect!`
      );
      setInputCode('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setErrorMsg(res.error || 'Failed to send invite request.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from your co-founder partner?')) return;
    await cloudSync.disconnectPartner(activeUser.id);
    setSuccessMsg('Partner disconnected cleanly on both sides.');
    setTimeout(() => setSuccessMsg(''), 3000);
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

    saveAppData(updatedData, true);
    onUpdateData(updatedData);
    setIsEditingProfile(false);
    setSuccessMsg('Profile details saved!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLogOut = () => {
    localStorage.removeItem('aimsh_active_founder_id');
    localStorage.setItem('aimsh_logged_out', 'true');
    const updated = {
      ...appData,
      activeFounderId: '',
    };
    saveAppData(updated, true);
    onUpdateData(updated);
  };

  const handleResetApp = () => {
    if (!confirm('Are you sure you want to reset everything to fresh state?')) return;
    const fresh = resetToFreshData();
    onUpdateData(fresh);
  };

  return (
    <div className="space-y-5 pb-16 font-sans">
      
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
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700 font-bold text-xs cursor-pointer">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. AGENCY BRANDING & LOGO CUSTOMIZER (লোগো পরিবর্তন ও ব্র্যান্ডিং) */}
      <div className="app-card p-5 sm:p-6 space-y-4 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 border-indigo-200 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Agency Logo & Branding / এজেন্সির লোগো
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                  Live Customizer
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload your agency logo or choose an emblem. It displays in the top header and syncs with your partner.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingAgency(!isEditingAgency)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingAgency ? 'Close Editor' : 'Edit Brand Name'}</span>
          </button>
        </div>

        {/* Logo Preview & Upload Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Left: Active Logo Display */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-3 shadow-2xs">
            <div className="relative w-16 h-16 rounded-2xl bg-slate-100 border-2 border-indigo-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {customLogoUrl ? (
                <img
                  src={customLogoUrl}
                  alt="Agency Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400 stroke-1" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">
                {agencyName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {agencyTagline || 'Workspace Active'}
              </p>
              {customLogoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold mt-1 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>
          </div>

          {/* Center: File Upload from Phone / PC */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="file"
              ref={logoFileInputRef}
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleLogoFileUpload}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => logoFileInputRef.current?.click()}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>📁 Upload Logo from Device (ফোন/পিসি থেকে আপলোড)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-3.5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Link className="w-3.5 h-3.5 text-blue-600" />
              <span>Paste URL</span>
            </button>
          </div>
        </div>

        {/* Direct URL Input if opened */}
        {showCustomInput && (
          <form onSubmit={handleSaveAgencyBranding} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              Paste Direct Image URL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={customLogoUrl}
                onChange={(e) => setCustomLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3 py-2 text-xs app-input"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                Apply Logo URL
              </button>
            </div>
          </form>
        )}

        {/* Agency Presets */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Or Pick a Ready 3D Agency Emblem
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PRESET_AGENCY_LOGOS.map((emblem) => (
              <button
                key={emblem.id}
                type="button"
                onClick={() => handleSelectPresetLogo(emblem.url)}
                className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                  customLogoUrl === emblem.url
                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <img
                  src={emblem.url}
                  alt={emblem.label}
                  className="w-8 h-8 rounded-lg object-cover shadow-2xs"
                />
                <span className="text-[11px] font-bold text-slate-800 line-clamp-1 text-left">
                  {emblem.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Agency Name & Tagline Edit Form */}
        {isEditingAgency && (
          <form onSubmit={handleSaveAgencyBranding} className="pt-3 border-t border-indigo-100 space-y-3 bg-white/80 p-4 rounded-2xl">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Agency Name & Subtitle
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agency Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. AIMS.H Agency, Velocity Digital"
                  className="w-full px-3 py-2 text-xs app-input font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agency Tagline</label>
                <input
                  type="text"
                  value={agencyTagline}
                  onChange={(e) => setAgencyTagline(e.target.value)}
                  placeholder="e.g. Full-Stack Scaling & Client Growth"
                  className="w-full px-3 py-2 text-xs app-input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingAgency(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Save Branding
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. ACTIVE FOUNDER PROFILE CARD */}
      <div className="app-card p-5 sm:p-6 space-y-4 bg-gradient-to-br from-white via-white to-indigo-50/20 border-indigo-100">
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
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
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

      {/* 3. DEDICATED AVATAR SELECTOR (Boy & Girl Avatar Presets) */}
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
              type="button"
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
              type="button"
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
              type="button"
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

      {/* 4. CO-FOUNDER PARTNER STATUS & PAIRING CARD */}
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

      {/* 5. APP CONTROLS, ONE-TIME BACKUP & ACCOUNT ACTIONS */}
      <div className="app-card p-5 sm:p-6 space-y-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-black text-slate-900 tracking-tight">
              One-Time Download & Database Backup / ডাটাবেজ ব্যাকআপ ও ডাউনলোড
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
            Encrypted JSON
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Download One-Time Backup */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/50 border border-indigo-200 space-y-2">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600" />
              <h5 className="text-xs font-black text-slate-900">One-Time Instant Download</h5>
            </div>
            <p className="text-[11px] text-slate-600">
              Download your full workspace: clients, missions, chat history, meetings, and agency settings in 1 secure file.
            </p>
            <button
              type="button"
              onClick={() => {
                const res = downloadOneTimeBackup(appData);
                if (res.success) {
                  setSuccessMsg(`✅ One-time backup downloaded: ${res.filename}`);
                  setTimeout(() => setSuccessMsg(''), 4000);
                }
              }}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/15 cursor-pointer transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All Data (ডাউনলোড করুন)</span>
            </button>
          </div>

          {/* Restore / Import Backup */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-700" />
              <h5 className="text-xs font-black text-slate-900">Restore from Backup</h5>
            </div>
            <p className="text-[11px] text-slate-600">
              Import a previously downloaded backup JSON file to restore your entire agency workspace instantly.
            </p>
            <label className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Select Backup File (.json)</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    if (text) {
                      const res = importAppDataJson(text);
                      if (res.success && res.data) {
                        onUpdateData(res.data);
                        setSuccessMsg('✅ Backup restored successfully!');
                        setTimeout(() => setSuccessMsg(''), 4000);
                      } else {
                        setErrorMsg(res.error || 'Failed to parse backup file.');
                        setTimeout(() => setErrorMsg(''), 4000);
                      }
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={install}
              className="w-full p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-between hover:bg-emerald-100 transition cursor-pointer"
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
              <Smartphone className="w-4 h-4 text-slate-500" /> PWA Mobile Installation Guide
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
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
