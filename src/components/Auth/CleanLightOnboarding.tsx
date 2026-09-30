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
  LogIn
} from 'lucide-react';
import { SharedAppData, UserProfile } from '../../types';
import { AVATAR_SELECTIONS, generateInviteCode, saveAppData } from '../../utils/storage';

interface CleanLightOnboardingProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

const HOBBY_OPTIONS = [
  { id: 'video_editing', label: 'Video Editing & Reels', icon: Film, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'coding', label: 'Coding & Development', icon: Code, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
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
  const [authMode, setAuthMode] = useState<'create' | 'login'>('create');
  
  // Multi-step Onboarding State
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

  // Create new account
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

    // If partner code provided, pair
    let updatedPartnerConnection = { ...appData.partnerConnection };
    const trimmedPartnerCode = partnerCode.trim().toUpperCase();
    if (trimmedPartnerCode) {
      const matched = Object.values(appData.founders).find((f) => f.inviteCode === trimmedPartnerCode);
      updatedPartnerConnection = {
        partnerInviteCode: trimmedPartnerCode,
        status: 'accepted',
        pairedUserId: matched ? matched.id : `partner_${Date.now()}`,
        pairedAt: new Date().toISOString(),
      };
    }

    const updatedData: SharedAppData = {
      ...appData,
      activeFounderId: newId,
      founders: updatedFounders,
      partnerConnection: updatedPartnerConnection,
    };

    localStorage.setItem('aimsh_active_founder_id', newId);
    localStorage.removeItem('aimsh_logged_out');
    saveAppData(updatedData);
    onUpdateData(updatedData);
  };

  // Secure Private Login (No account listing shown)
  const handlePrivateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const query = loginIdentifier.trim().toLowerCase();
    const pass = loginPassword.trim();

    if (!query) {
      setErrorMsg('Please enter your Name or Invite Code.');
      return;
    }

    // Find account by inviteCode or username or name
    const matched = Object.values(appData.founders).find((f) => 
      f.inviteCode.toLowerCase() === query ||
      f.name.toLowerCase() === query ||
      f.username.toLowerCase() === query
    );

    if (!matched) {
      setErrorMsg('No account found with this Name or Invite Code. Please check or create a new account.');
      return;
    }

    // If account has password, verify it
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

    // Successfully authenticate
    localStorage.setItem('aimsh_active_founder_id', matched.id);
    localStorage.removeItem('aimsh_logged_out');
    const updated = {
      ...appData,
      activeFounderId: matched.id,
    };
    saveAppData(updated);
    onUpdateData(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-5 selection:bg-indigo-500/20 selection:text-indigo-700">
      <div className="w-full max-w-xl">
        
        {/* Main Glass Card */}
        <div className="app-card p-5 sm:p-8 space-y-6 shadow-xl shadow-indigo-900/5">
          
          {/* Brand Logo & Switcher */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 mb-1">
              <Zap className="w-6 h-6" />
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                AIMS.H Hub
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                PRIVATE OS
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Empowering Co-Founders. Tailored Habits. 100% Private & Protected.
            </p>

            {/* Auth Mode Toggle (Create vs Private Login) */}
            <div className="w-full max-w-xs flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs font-bold mt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('create');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  authMode === 'create'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                + New Founder Seat
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Private Login</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === 'create' ? (
            /* MULTI-STEP ANIMATED ONBOARDING FLOW */
            <div>
              {/* Progress Indicator */}
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {step === 1 && 'Step 1: Identity & Avatar / নাম ও ছবি'}
                      {step === 2 && 'Step 2: Hobbies & Passions / তোমার শখ কি?'}
                      {step === 3 && 'Step 3: Daily Habits / তোমার অভ্যাস কেমন?'}
                      {step === 4 && 'Step 4: Screentime / কত ঘন্টা ফোন চালাও?'}
                      {step === 5 && 'Step 5: Security Password & Launch / পাসওয়ার্ড'}
                    </span>
                  </span>
                  <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {step} / {totalSteps}
                  </span>
                </div>
                {/* Animated Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-600 rounded-full"
                    initial={{ width: '20%' }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Step Forms with Slide Animation */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aiman"
                        className="w-full app-input px-3.5 py-2.5 text-sm"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Agency Role
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Creative Director, Lead Dev, Strategist"
                        className="w-full app-input px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    {/* Boy & Girl Avatar Selector */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Select Avatar (ছেলে / মেয়ে)
                        </label>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setAvatarGender('all')}
                            className={`px-2 py-0.5 rounded ${avatarGender === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarGender('male')}
                            className={`px-2 py-0.5 rounded ${avatarGender === 'male' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                          >
                            👦 Boy
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarGender('female')}
                            className={`px-2 py-0.5 rounded ${avatarGender === 'female' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                          >
                            👧 Girl
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200/80 rounded-2xl bg-slate-50/50">
                        {filteredAvatars.map((item) => {
                          const isSelected = selectedAvatar === item.url;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedAvatar(item.url)}
                              className={`relative p-1 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-indigo-300'
                              }`}
                            >
                              <img
                                src={item.url}
                                alt={item.label}
                                className="w-full aspect-square rounded-lg object-cover"
                              />
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                                  <Check className="w-2.5 h-2.5 stroke-3" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <span>Continue to Hobbies</span>
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
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        What Are Your Hobbies & Passions? / তোমার প্রিয় শখ কি?
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select what you love doing. This configures your agency dashboard and skill targets.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
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
                                ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 shadow-2xs'
                                : 'border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-xl ${hobby.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-800">{hobby.label}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <span>Continue to Habits ({selectedHobbies.length} selected)</span>
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
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500" />
                        What Are Your Daily Habits? / তোমার অভ্যাস কেমন?
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose the core execution habits you commit to tracking every single day.
                      </p>
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
                                ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-400 shadow-2xs'
                                : 'border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{habit.label}</h4>
                                <p className="text-[11px] text-slate-500">{habit.desc}</p>
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

                    <div className="pt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <span>Continue to Screentime</span>
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
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                        How Many Hours Do You Use Mobile Daily? / তুমি কত ঘন্টা ফোন চালাও?
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set your daily mobile screentime target to stay focused on high-leverage missions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {SCREEN_TIME_PRESETS.map((preset) => {
                        const isSelected = screenTime === preset.hours;

                        return (
                          <button
                            key={preset.hours}
                            type="button"
                            onClick={() => setScreenTime(preset.hours)}
                            className={`p-3.5 rounded-2xl border text-left space-y-1.5 transition cursor-pointer ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-slate-900">{preset.hours}</span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {preset.badge}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-indigo-700">{preset.label}</p>
                            <p className="text-[11px] text-slate-500">{preset.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-900">Current selection: {screenTime}</span>. 
                        We will help you keep agency execution ahead of doom-scrolling.
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <span>Set Security Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.form
                    key="step-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleFinalSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Lock Your Account with a Password / পাসওয়ার্ড দিন
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set a secure password or 4-digit PIN. Only you will be able to unlock and view your account.
                      </p>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Security Password / PIN <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Set a password or 4-digit PIN"
                            className="w-full app-input px-3.5 py-2.5 text-sm pr-10"
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
                          Confirm Password / PIN <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full app-input px-3.5 py-2.5 text-sm"
                          required
                        />
                      </div>

                      <div className="pt-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Partner's Invite Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={partnerCode}
                          onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                          placeholder="e.g. AIMSH-9X12 (leave blank if connecting later)"
                          className="w-full app-input px-3.5 py-2.5 text-xs font-mono tracking-wider"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Private. Other users cannot see or browse your account without your password.</span>
                    </div>

                    <div className="pt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Launch & Open My Hub</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* SECURE PRIVATE LOGIN FORM (No accounts listed!) */
            <form onSubmit={handlePrivateLogin} className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center gap-2.5 text-indigo-900 text-xs font-semibold">
                <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Enter your own Name or Invite Code and password to unlock your account.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name or Invite Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. Aiman or AIMSH-XXXX"
                  className="w-full app-input px-3.5 py-2.5 text-sm"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Security Password / PIN
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your security password or PIN"
                    className="w-full app-input px-3.5 py-2.5 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Unlock & Enter My Hub</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('create')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Need a new account? Create Founder Seat &rarr;
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
