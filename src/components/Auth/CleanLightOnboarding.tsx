import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  Heart, 
  Flame, 
  Clock, 
  Film, 
  Code, 
  Dumbbell, 
  BookOpen, 
  Gamepad2, 
  Palette, 
  TrendingUp, 
  Mic, 
  Sunrise, 
  Droplet, 
  CheckCircle2,
  KeyRound,
  LogIn,
  User,
  ShieldAlert,
  HelpCircle,
  X
} from 'lucide-react';
import { SharedAppData, UserProfile } from '../../types';
import { AVATAR_SELECTIONS, generateInviteCode, saveAppData } from '../../utils/storage';
import { cloudSync } from '../../utils/cloudSync';

interface CleanLightOnboardingProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

// 1. Cute Modern Security Mascot & Blue Padlock Vector Illustration
const SecurityMascotIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg className={`${className} select-none drop-shadow-md`} viewBox="0 0 160 160" fill="none">
      <defs>
        <radialGradient id="secPadlockGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
        <radialGradient id="secMascotFace" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </radialGradient>
        <linearGradient id="secKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3B82F6" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Ambient background glow ring */}
      <circle cx="80" cy="80" r="70" fill="#EFF6FF" />
      <circle cx="80" cy="80" r="56" fill="#DBEAFE" opacity="0.6" />

      {/* Blue Padlock Body */}
      <rect x="76" y="70" width="60" height="52" rx="16" fill="url(#secPadlockGrad)" filter="url(#softGlow)" />
      {/* Padlock Shackle */}
      <path d="M88 70 V52 C88 42 124 42 124 52 V70" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" />
      {/* Keyhole */}
      <circle cx="106" cy="92" r="5" fill="#1E3A8A" />
      <path d="M104 94 L103 105 H109 L108 94 Z" fill="#1E3A8A" />

      {/* Cute Mascot Character */}
      {/* Body / Head */}
      <circle cx="56" cy="78" r="32" fill="url(#secMascotFace)" stroke="#CBD5E1" strokeWidth="3" filter="url(#softGlow)" />
      {/* Friendly Eyes */}
      <circle cx="48" cy="74" r="3.5" fill="#0F172A" />
      <circle cx="64" cy="74" r="3.5" fill="#0F172A" />
      {/* Eye Sparkles */}
      <circle cx="49" cy="73" r="1.2" fill="#FFFFFF" />
      <circle cx="65" cy="73" r="1.2" fill="#FFFFFF" />
      {/* Rosy Cheeks */}
      <ellipse cx="44" cy="82" rx="3.5" ry="2" fill="#F472B6" opacity="0.7" />
      <ellipse cx="68" cy="82" rx="3.5" ry="2" fill="#F472B6" opacity="0.7" />
      {/* Smiling Mouth */}
      <path d="M52 82 Q56 87 60 82" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Mascot Little Hand holding Golden Key */}
      <circle cx="34" cy="94" r="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
      {/* Golden Key */}
      <g transform="translate(18, 86) rotate(-25)">
        <circle cx="12" cy="12" r="7" stroke="url(#secKeyGrad)" strokeWidth="3.5" fill="none" />
        <rect x="18" y="10" width="22" height="4" rx="2" fill="url(#secKeyGrad)" />
        <rect x="32" y="14" width="4" height="6" rx="1.5" fill="url(#secKeyGrad)" />
        <rect x="26" y="14" width="3" height="4" rx="1" fill="url(#secKeyGrad)" />
      </g>

      {/* Sparkles */}
      <path d="M138 34 L140 40 L146 42 L140 44 L138 50 L136 44 L130 42 L136 40 Z" fill="#F59E0B" />
      <path d="M26 44 L27 48 L31 49 L27 50 L26 54 L25 50 L21 49 L25 48 Z" fill="#60A5FA" />
    </svg>
  );
};

// 2. Success Badge Illustration (OK Hand Gesture & Green Checkmark Starburst)
const SuccessBadgeIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg className={`${className} select-none drop-shadow-lg`} viewBox="0 0 140 140" fill="none">
      <defs>
        <radialGradient id="successGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#BBF7D0" />
          <stop offset="60%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>
      </defs>

      {/* Outer Starburst / Radial Aura */}
      <circle cx="70" cy="70" r="62" fill="#F0FDF4" />
      <circle cx="70" cy="70" r="50" fill="#DCFCE7" />

      {/* Green Starburst Badge */}
      <circle cx="70" cy="70" r="38" fill="url(#successGrad)" />

      {/* Crisp White Checkmark & OK Symbol */}
      <path
        d="M54 71 L65 82 L88 56"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Little Starburst accents */}
      <circle cx="34" cy="38" r="3" fill="#22C55E" />
      <circle cx="108" cy="42" r="3.5" fill="#3B82F6" />
      <circle cx="104" cy="98" r="2.5" fill="#F59E0B" />
      <circle cx="38" cy="96" r="3" fill="#A855F7" />
    </svg>
  );
};

const HOBBY_OPTIONS = [
  { id: 'video_editing', label: 'Video Editing & Reels', icon: Film, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'coding', label: 'Coding & Development', icon: Code, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'gym', label: 'Gym & Fitness Training', icon: Dumbbell, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'reading', label: 'Reading & Knowledge', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'gaming', label: 'Gaming & Strategy', icon: Gamepad2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'design', label: 'UI/UX & Visual Design', icon: Palette, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { id: 'trading', label: 'Trading & Markets', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'podcasting', label: 'Podcasting & Audio', icon: Mic, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'scaling', label: 'Agency Scaling & Sales', icon: Zap, color: 'text-orange-600 bg-orange-50 border-orange-200' },
];

const HABIT_OPTIONS = [
  { id: 'early_riser', label: '5:00 AM Early Riser', icon: Sunrise, desc: 'Winning the morning before the world wakes up' },
  { id: 'deep_work', label: '4-Hour Deep Work Sprint', icon: Flame, desc: 'Uninterrupted creative and coding flow' },
  { id: 'no_phone_morning', label: 'No Phone in First 60 Mins', icon: Smartphone, desc: 'Zero dopamine trap or notifications' },
  { id: 'hydration', label: '3 Liters Daily Hydration', icon: Droplet, desc: 'Maximum brain energy and physical health' },
  { id: 'daily_workout', label: 'Daily Workout & Fitness', icon: Dumbbell, desc: 'High physical stamina and endurance' },
  { id: 'night_plan', label: 'Nightly Review & Sprints', icon: CheckCircle2, desc: 'Clear missions mapped for tomorrow' },
];

const SCREEN_TIME_PRESETS = [
  { hours: '1 - 2 Hours', label: 'Ultra Focus', desc: 'Minimal phone usage, strict execution only', badge: 'Discipline Mode' },
  { hours: '3 - 4 Hours', label: 'Productive Balance', desc: 'Balanced agency comms and mobile tasks', badge: 'Balanced' },
  { hours: '5 - 6 Hours', label: 'Heavy Operations', desc: 'Client management, Slack and deliverables', badge: 'Heavy Ops' },
  { hours: '7+ Hours', label: 'Creator & Ops', desc: 'Constant video creation, outreach and sync', badge: 'Non-Stop' },
];

export const CleanLightOnboarding: React.FC<CleanLightOnboardingProps> = ({
  appData,
  onUpdateData,
}) => {
  const [authMode, setAuthMode] = useState<'create' | 'login'>('login');
  
  // Multi-step Onboarding State for 'create' mode (Sign up)
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Profile & Avatar
  const [name, setName] = useState('');
  const [role, setRole] = useState('Agency Co-Founder');
  const [avatarGender, setAvatarGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_SELECTIONS[0].url);

  // Step 2: Hobbies
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(['Video Editing & Reels', 'Coding & Development']);

  // Step 3: Habits
  const [selectedHabits, setSelectedHabits] = useState<string[]>(['5:00 AM Early Riser', '4-Hour Deep Work Sprint']);

  // Step 4: Screentime
  const [screenTime, setScreenTime] = useState<string>('3 - 4 Hours');

  // Step 5: Password & Security
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password & Success Overlay state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingSuccessUser, setPendingSuccessUser] = useState<UserProfile | null>(null);

  const filteredAvatars = AVATAR_SELECTIONS.filter((a) => {
    if (avatarGender === 'all') return true;
    return a.gender === avatarGender;
  });

  const toggleHobby = (hobbyLabel: string) => {
    if (selectedHobbies.includes(hobbyLabel)) {
      setSelectedHobbies(selectedHobbies.filter((h) => h !== hobbyLabel));
    } else {
      setSelectedHobbies([...selectedHobbies, hobbyLabel]);
    }
  };

  const toggleHabit = (habitLabel: string) => {
    if (selectedHabits.includes(habitLabel)) {
      setSelectedHabits(selectedHabits.filter((h) => h !== habitLabel));
    } else {
      setSelectedHabits([...selectedHabits, habitLabel]);
    }
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1 && !name.trim()) {
      setErrorMsg('Please enter your name to continue.');
      return;
    }
    if (step === 2 && selectedHobbies.length === 0) {
      setErrorMsg('Please select at least 1 hobby or interest.');
      return;
    }
    if (step === 3 && selectedHabits.length === 0) {
      setErrorMsg('Please select at least 1 daily habit.');
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Create new account (Sign up)
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      setStep(1);
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please set a security password / PIN to lock your account.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please recheck.');
      return;
    }

    const cleanUsername = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const newId = `user_${Date.now()}`;
    const newInviteCode = generateInviteCode('AIMSH');

    const newProfile: UserProfile = {
      id: newId,
      name: name.trim(),
      username: cleanUsername,
      email: `${cleanUsername}@aimsh.agency`,
      avatar: selectedAvatar,
      role: role.trim() || 'Co-Founder',
      inviteCode: newInviteCode,
      bio: `Focused on ${selectedHobbies.slice(0, 2).join(' & ')}. Daily Habit: ${selectedHabits[0] || 'Execution'}.`,
      password: password.trim(),
      hobbies: selectedHobbies,
      habitStyles: selectedHabits,
      screenTimeHours: screenTime,
      socials: {},
      focusAreas: selectedHobbies,
      primaryObjective: 'Scale agency and execute missions.',
    };

    const updatedFounders = {
      ...appData.founders,
      [newId]: newProfile,
    };

    const updatedData: SharedAppData = {
      ...appData,
      activeFounderId: newId,
      founders: updatedFounders,
    };

    setPendingSuccessUser(newProfile);
    setShowSuccessModal(true);
    saveAppData(updatedData, true);

    // Register user to cloud server
    cloudSync.registerUser(newProfile);

    const trimmedPartnerCode = partnerCode.trim().toUpperCase();
    if (trimmedPartnerCode) {
      cloudSync.sendPartnerInvite(newId, trimmedPartnerCode);
    }
  };

  // Secure Private Login
  const handlePrivateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const query = loginIdentifier.trim().toLowerCase();
    const pass = loginPassword.trim();

    if (!query) {
      setErrorMsg('Please enter your Username or Invite Code.');
      return;
    }

    // Find account by inviteCode or username or name
    const matched = Object.values(appData.founders).find((f) => 
      f.inviteCode.toLowerCase() === query ||
      f.name.toLowerCase() === query ||
      f.username.toLowerCase() === query
    );

    if (!matched) {
      setErrorMsg('Account not found. Please check your username/invite code or Sign up.');
      return;
    }

    // Verify password if set
    if (matched.password) {
      if (!pass) {
        setErrorMsg('Please enter your password / PIN to unlock your seat.');
        return;
      }
      if (matched.password !== pass) {
        setErrorMsg('Incorrect password / PIN. Please try again.');
        return;
      }
    }

    setPendingSuccessUser(matched);
    setShowSuccessModal(true);
  };

  // Complete success modal and enter workspace
  const handleCompleteSuccess = () => {
    if (!pendingSuccessUser) return;
    localStorage.setItem('aimsh_active_founder_id', pendingSuccessUser.id);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aimsh_session_user_id', pendingSuccessUser.id);
    }
    localStorage.removeItem('aimsh_logged_out');
    
    const updated = {
      ...appData,
      activeFounderId: pendingSuccessUser.id,
    };
    saveAppData(updated);
    onUpdateData(updated);
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-6 font-sans relative selection:bg-blue-500/20 selection:text-blue-700">
      
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Main Clean Card (#FFFFFF, rounded-3xl, elevated drop shadow) */}
        <motion.div 
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white rounded-[28px] p-6 sm:p-8 space-y-5 shadow-xl shadow-slate-200/60 border border-slate-100"
        >
          {/* Top Header Illustration: Cute modern security vector illustration */}
          <div className="flex flex-col items-center text-center space-y-2">
            <SecurityMascotIllustration className="w-24 h-24" />
            
            {/* Welcome Header: Clean bold title with friendly wave emoji */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {authMode === 'login' ? 'Welcome back 👋' : 'Create Account 🚀'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {authMode === 'login'
                  ? 'Access your private co-founder agency workspace'
                  : 'Start your dedicated co-founder seat & bilateral sync'}
              </p>
            </div>

            {/* Segmented Toggle: Soft gray background toggle bar switching between "Login" and "Sign up" with active white pill-slider */}
            <div className="w-full max-w-xs flex rounded-full bg-slate-100 p-1 border border-slate-200/70 text-xs font-bold mt-2 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('create');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'create'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Sign up</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {authMode === 'login' ? (
            /* SCREEN 1: LOGIN FORM */
            <form onSubmit={handlePrivateLogin} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username or Invite Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter your username or code"
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition"
                    required
                    autoFocus
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password / PIN
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Forgot Password link aligned neatly to the right side below the password field */}
                <div className="flex justify-end pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Main CTA Button: Sleek, dark pill-shaped "Login" button spanning full width */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/15 transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-slate-500">
                Don't have a co-founder seat?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('create')}
                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer underline"
                >
                  Sign up
                </button>
              </div>
            </form>
          ) : (
            /* SCREEN 1: SIGN UP MULTI-STEP FLOW */
            <div>
              {/* Progress Indicator */}
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {step === 1 && 'Step 1: Identity & Avatar'}
                      {step === 2 && 'Step 2: Hobbies & Passions'}
                      {step === 3 && 'Step 3: Daily Habits'}
                      {step === 4 && 'Step 4: Screentime Goal'}
                      {step === 5 && 'Step 5: Security Password & Launch'}
                    </span>
                  </span>
                  <span className="font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 font-black">
                    {step} / {totalSteps}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: '20%' }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aiman"
                        className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Agency Role
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Creative Lead, Strategist, Dev"
                        className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition"
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Choose Avatar</label>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setAvatarGender('all')}
                            className={`px-2 py-0.5 rounded-full ${avatarGender === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarGender('male')}
                            className={`px-2 py-0.5 rounded-full ${avatarGender === 'male' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                          >
                            👦 Boy
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarGender('female')}
                            className={`px-2 py-0.5 rounded-full ${avatarGender === 'female' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                          >
                            👧 Girl
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-slate-50/50">
                        {filteredAvatars.map((item) => {
                          const isSelected = selectedAvatar === item.url;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedAvatar(item.url)}
                              className={`relative p-1 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600 shadow-sm scale-105'
                                  : 'border-slate-200 bg-white hover:border-blue-300'
                              }`}
                            >
                              <img src={item.url} alt={item.label} className="w-full aspect-square rounded-xl object-cover" />
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">
                                  <Check className="w-2.5 h-2.5 stroke-3" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Your Hobbies & Passions</h3>
                      <p className="text-xs text-slate-500">Pick what you love to do.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {HOBBY_OPTIONS.map((hobby) => {
                        const Icon = hobby.icon;
                        const isSelected = selectedHobbies.includes(hobby.label);
                        return (
                          <button
                            key={hobby.id}
                            type="button"
                            onClick={() => toggleHobby(hobby.label)}
                            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-xl ${hobby.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-800">{hobby.label}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <span>Next Step</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Choose Daily Habits</h3>
                      <p className="text-xs text-slate-500">Pick habits you want to track daily.</p>
                    </div>

                    <div className="space-y-2 pt-1">
                      {HABIT_OPTIONS.map((habit) => {
                        const Icon = habit.icon;
                        const isSelected = selectedHabits.includes(habit.label);
                        return (
                          <button
                            key={habit.id}
                            type="button"
                            onClick={() => toggleHabit(habit.label)}
                            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">{habit.label}</span>
                                <span className="text-[11px] text-slate-500">{habit.desc}</span>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <span>Next Step</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Daily Screentime Focus</h3>
                      <p className="text-xs text-slate-500">Set daily target for phone & laptop screen usage.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {SCREEN_TIME_PRESETS.map((preset) => {
                        const isSelected = screenTime === preset.hours;
                        return (
                          <button
                            key={preset.hours}
                            type="button"
                            onClick={() => setScreenTime(preset.hours)}
                            className={`p-3 rounded-2xl border text-left space-y-1 transition cursor-pointer ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-black text-slate-900">{preset.hours}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {preset.badge}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800">{preset.label}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <span>Next Step</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.form
                    key="step-5"
                    onSubmit={handleFinalSubmit}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Set Security Password</h3>
                      <p className="text-xs text-slate-500">Protect your seat and lock private missions.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Security Password / PIN <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none pr-10"
                            required
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Partner's Invite Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={partnerCode}
                          onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                          placeholder="e.g. AIMSH-XXXX"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold tracking-wider outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-slate-900/20 transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Sign up & Enter</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          )}

        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Forgot Password?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your account is 100% private. You can unlock your account using your original Partner Invite Code (e.g. AIMSH-XXXX) or ask your co-founder partner to verify your code.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Success Overlay Modal (OK Hand Gesture & Checkmark Starburst) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center relative overflow-hidden"
          >
            {/* Success Badge */}
            <div className="flex justify-center">
              <SuccessBadgeIllustration className="w-24 h-24" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Login Successful
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                Welcome back, <strong>{pendingSuccessUser?.name}</strong>! Your private workspace and bilateral sync are ready.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompleteSuccess}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-lg shadow-slate-900/20 active:scale-[0.99] transition cursor-pointer"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
