import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Flame, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Trash2,
  Users,
  Film,
  Code,
  Palette,
  Target,
  Bot,
  Megaphone,
  Briefcase,
  Heart,
  Share2,
  Check,
  SlidersHorizontal,
  Search,
  Eye
} from 'lucide-react';
import { SkillItem, MasteryStage, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';
import { cloudSync } from '../../utils/cloudSync';
import { getPartnerForUser } from '../../utils/partnerHelper';

interface SkillMatrixProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

const CATEGORY_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  'Video Production': { icon: Film, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  'Web & App Development': { icon: Code, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  'Design & Figma': { icon: Palette, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  'Agency Sales & Closing': { icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  'AI & Automation': { icon: Bot, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
  'Paid Advertising': { icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  'General': { icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
};

const STAGE_CONFIG: Record<
  MasteryStage,
  { label: string; min: number; max: number; badgeColor: string; barColor: string; glowColor: string }
> = {
  Beginner: {
    label: 'Foundation',
    min: 0,
    max: 34,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
    barColor: 'from-amber-400 to-orange-500',
    glowColor: 'shadow-amber-500/20',
  },
  Intermediate: {
    label: 'Building',
    min: 35,
    max: 74,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
    barColor: 'from-sky-400 via-indigo-500 to-indigo-600',
    glowColor: 'shadow-indigo-500/20',
  },
  Expert: {
    label: 'Mastery',
    min: 75,
    max: 100,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    barColor: 'from-emerald-400 to-teal-600',
    glowColor: 'shadow-emerald-500/20',
  },
  'In Learning': {
    label: 'In Learning',
    min: 10,
    max: 40,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
    barColor: 'from-blue-400 to-indigo-600',
    glowColor: 'shadow-blue-500/20',
  },
};

const QUICK_PRESETS = [
  { title: 'Video Editing & Motion Reels', category: 'Video Production', hours: 2.5, percent: 45 },
  { title: 'React 19 & Fullstack Dev', category: 'Web & App Development', hours: 3, percent: 50 },
  { title: 'Figma UI/UX Systems & Design', category: 'Design & Figma', hours: 2, percent: 40 },
  { title: 'High-Ticket Client Sales & Outreach', category: 'Agency Sales & Closing', hours: 1.5, percent: 35 },
  { title: 'AI Automation & Agents Workflow', category: 'AI & Automation', hours: 2, percent: 30 },
];

function getStageFromPercent(pct: number): MasteryStage {
  if (pct < 35) return 'Beginner';
  if (pct < 75) return 'Intermediate';
  return 'Expert';
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({ appData, onUpdateData }) => {
  // View mode filter: 'all' = both, 'mine' = active user, 'partner' = paired partner
  const [viewFilter, setViewFilter] = useState<'all' | 'mine' | 'partner'>('all');
  const [stageFilter, setStageFilter] = useState<'all' | MasteryStage>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cheerParticleId, setCheerParticleId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Video Production');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  });
  const [initialPercent, setInitialPercent] = useState(40);
  const [dailyHours, setDailyHours] = useState(2);
  const [notes, setNotes] = useState('');

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    inviteCode: 'AIMSH-001'
  };

  // Identify partner strictly
  const partnerUser = getPartnerForUser(appData, activeUser.id);
  const isPartnerConnected = !!partnerUser;

  // Real-time update progress for a skill
  const handleUpdateProgress = (skillId: string, newPercent: number) => {
    const clamped = Math.max(0, Math.min(100, newPercent));
    const stage = getStageFromPercent(clamped);
    const updatedSkills = appData.skills.map((s) =>
      s.id === skillId ? { ...s, progressPercent: clamped, stage } : s
    );
    const updated = { ...appData, skills: updatedSkills };
    saveAppData(updated, true);
    cloudSync.syncState(updated);
    onUpdateData(updated);
  };

  // Add/Subtract daily hours
  const handleAddHours = (skillId: string, deltaHours: number) => {
    const updatedSkills = appData.skills.map((s) => {
      if (s.id !== skillId) return s;
      const updatedHrs = Math.max(0, Math.round((s.dailyEffortHours + deltaHours) * 10) / 10);
      const bonusPct = deltaHours > 0 ? Math.min(100, s.progressPercent + Math.round(deltaHours * 2)) : s.progressPercent;
      return {
        ...s,
        dailyEffortHours: updatedHrs,
        progressPercent: bonusPct,
        stage: getStageFromPercent(bonusPct),
      };
    });
    const updated = { ...appData, skills: updatedSkills };
    saveAppData(updated, true);
    cloudSync.syncState(updated);
    onUpdateData(updated);
  };

  // Send Kudos / Cheer to Partner Skill
  const handleSendCheer = (skillId: string) => {
    const updatedSkills = appData.skills.map((s) =>
      s.id === skillId ? { ...s, kudosCount: (s.kudosCount || 0) + 1 } : s
    );
    const updated = { ...appData, skills: updatedSkills };
    saveAppData(updated, true);
    cloudSync.syncState(updated);
    onUpdateData(updated);

    setCheerParticleId(skillId);
    setTimeout(() => setCheerParticleId(null), 1500);
  };

  // Delete skill
  const handleDeleteSkill = (skillId: string) => {
    const updatedSkills = appData.skills.filter((s) => s.id !== skillId);
    const updated = { ...appData, skills: updatedSkills };
    saveAppData(updated, true);
    cloudSync.syncState(updated);
    onUpdateData(updated);
  };

  // Create new skill
  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      founderId: activeUser.id,
      title: title.trim(),
      category: category.trim(),
      targetDate,
      progressPercent: initialPercent,
      stage: getStageFromPercent(initialPercent),
      dailyEffortHours: dailyHours,
      notes: notes.trim(),
      kudosCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = {
      ...appData,
      skills: [newSkill, ...appData.skills],
    };
    saveAppData(updated, true);
    cloudSync.syncState(updated);
    onUpdateData(updated);

    setTitle('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  // Filter skills based on user preference
  const filteredSkills = appData.skills.filter((s) => {
    // Stage filter
    if (stageFilter !== 'all' && s.stage !== stageFilter) return false;
    
    // View filter (mine vs partner vs all)
    if (viewFilter === 'mine' && s.founderId !== activeUser.id) return false;
    if (viewFilter === 'partner') {
      if (partnerUser) {
        if (s.founderId !== partnerUser.id) return false;
      } else {
        if (s.founderId === activeUser.id) return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Calculate stats
  const mySkills = appData.skills.filter((s) => s.founderId === activeUser.id);
  const partnerSkills = partnerUser
    ? appData.skills.filter((s) => s.founderId === partnerUser.id)
    : appData.skills.filter((s) => s.founderId !== activeUser.id);

  const myAvgProgress = mySkills.length
    ? Math.round(mySkills.reduce((acc, s) => acc + s.progressPercent, 0) / mySkills.length)
    : 0;
  const partnerAvgProgress = partnerSkills.length
    ? Math.round(partnerSkills.reduce((acc, s) => acc + s.progressPercent, 0) / partnerSkills.length)
    : 0;
  
  const totalDailyHours = appData.skills.reduce((acc, s) => acc + (s.dailyEffortHours || 0), 0);

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Banner: Minimalist Bento Matrix Header & Real-time Partner Sync Bar */}
      <div className="app-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Co-Founder Skill Acquisition Matrix</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Shared Sync
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Dual visibility: Both you & your partner track mastery progress, effort, and growth together.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>Add New Skill</span>
          </button>
        </div>

        {/* Minimalist 4-Pill Live Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Total Shared Skills */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Total Active Skills
            </span>
            <div className="text-lg font-black text-slate-900">
              {appData.skills.length} <span className="text-xs font-normal text-slate-500">tracks</span>
            </div>
          </div>

          {/* My Average Mastery */}
          <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
            <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
              <img src={activeUser.avatar} alt="You" className="w-3.5 h-3.5 rounded-full object-cover" />
              My Mastery
            </span>
            <div className="text-lg font-black text-indigo-700">
              {myAvgProgress}% <span className="text-[11px] font-medium text-indigo-500">({mySkills.length} skills)</span>
            </div>
          </div>

          {/* Partner's Average Mastery */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
              {partnerUser ? (
                <img src={partnerUser.avatar} alt="Partner" className="w-3.5 h-3.5 rounded-full object-cover" />
              ) : (
                <Users className="w-3.5 h-3.5 text-emerald-600" />
              )}
              {partnerUser ? `${partnerUser.name.split(' ')[0]}'s Mastery` : 'Partner Mastery'}
            </span>
            <div className="text-lg font-black text-emerald-700">
              {partnerSkills.length ? `${partnerAvgProgress}%` : 'Synced'} 
              <span className="text-[11px] font-medium text-emerald-600/80"> ({partnerSkills.length} skills)</span>
            </div>
          </div>

          {/* Daily Effort Logged */}
          <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Daily Effort Hours
            </span>
            <div className="text-lg font-black text-amber-700">
              {totalDailyHours} <span className="text-xs font-normal text-amber-600">hrs/day</span>
            </div>
          </div>
        </div>

      </div>

      {/* Primary Navigation & Perspective Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Collaborative Perspective Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewFilter('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              viewFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Skills ({appData.skills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('mine')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              viewFilter === 'mine'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <img src={activeUser.avatar} alt="You" className="w-3.5 h-3.5 rounded-full object-cover" />
            <span>My Skills ({mySkills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('partner')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              viewFilter === 'partner'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {partnerUser ? (
              <img src={partnerUser.avatar} alt="Partner" className="w-3.5 h-3.5 rounded-full object-cover" />
            ) : (
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{partnerUser ? `${partnerUser.name.split(' ')[0]}'s Skills` : 'Partner Skills'} ({partnerSkills.length})</span>
          </button>
        </div>

        {/* Stage & Search Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full app-input pl-8 pr-3 py-1.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-[11px] font-bold">
            <button
              onClick={() => setStageFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                stageFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Stages
            </button>
            {(['Beginner', 'Intermediate', 'Expert'] as MasteryStage[]).map((stg) => (
              <button
                key={stg}
                onClick={() => setStageFilter(stg)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  stageFilter === stg ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {stg === 'Beginner' && '🟢 Foundation'}
                {stg === 'Intermediate' && '🔵 Building'}
                {stg === 'Expert' && '🟣 Mastery'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Grid: Ultra High-End Animated Skill Cards */}
      {filteredSkills.length === 0 ? (
        <div className="app-card p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            {viewFilter === 'partner' ? 'No skills logged by partner yet' : 'No matching skills found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {viewFilter === 'partner'
              ? 'When your partner creates or updates a skill in their hub, it will appear here in real-time!'
              : 'Add custom video editing, coding, marketing, or design skills to track your mastery.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => {
              const stageInfo = STAGE_CONFIG[skill.stage];
              const founder = appData.founders[skill.founderId] || (skill.founderId === activeUser.id ? activeUser : partnerUser || activeUser);
              const isOwner = skill.founderId === activeUser.id;
              const catConfig = CATEGORY_MAP[skill.category] || CATEGORY_MAP['General'];
              const CategoryIcon = catConfig.icon;
              const isCheering = cheerParticleId === skill.id;

              return (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`app-card p-4 sm:p-4.5 space-y-3.5 relative overflow-hidden transition-all hover:shadow-md ${
                    isOwner ? 'border-slate-200/90' : 'border-indigo-200/70 bg-indigo-50/20'
                  }`}
                >
                  {/* Floating Cheer Reaction Burst Animation */}
                  {isCheering && (
                    <motion.div
                      initial={{ opacity: 1, y: 0, scale: 0.8 }}
                      animate={{ opacity: 0, y: -45, scale: 1.3 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="absolute right-6 top-8 z-30 pointer-events-none flex items-center gap-1 text-sm font-black text-rose-500 bg-white/95 px-3 py-1.5 rounded-full shadow-lg border border-rose-200"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span>+1 Cheer to {founder.name.split(' ')[0]}! 🎉</span>
                    </motion.div>
                  )}

                  {/* Top Bar: Category & Owner Avatar / Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`p-1.5 rounded-xl border ${catConfig.bg} ${catConfig.color}`}>
                        <CategoryIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200/70">
                        {skill.category}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${stageInfo.badgeColor}`}>
                        {stageInfo.label} • {skill.progressPercent}%
                      </span>
                    </div>

                    {/* Owner Tag + Quick Actions */}
                    <div className="flex items-center gap-1.5">
                      <div 
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isOwner 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                        title={isOwner ? 'Your Skill' : `${founder.name}'s Skill`}
                      >
                        <img src={founder.avatar} alt={founder.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                        <span>{isOwner ? 'You' : founder.name.split(' ')[0]}</span>
                      </div>

                      {/* Cheer / Boost Button */}
                      <button
                        type="button"
                        onClick={() => handleSendCheer(skill.id)}
                        className={`p-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs ${
                          isCheering
                            ? 'bg-rose-100 border-rose-300 text-rose-700 scale-110'
                            : 'bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border-slate-200 text-slate-600'
                        }`}
                        title="Send Kudos / Cheer on progress"
                      >
                        <Flame className={`w-3.5 h-3.5 ${skill.kudosCount > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                        <span className="font-mono font-bold text-[11px]">{skill.kudosCount || 0}</span>
                      </button>

                      {/* Delete (only for skill owner) */}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">{skill.title}</h3>
                    {skill.notes && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {skill.notes}
                      </p>
                    )}
                  </div>

                  {/* Animated Mastery Progress Bar with Spring Motion */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                        Mastery Level
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {skill.progressPercent < 100 ? `${100 - skill.progressPercent}% to Goal` : 'Target Achieved 🎉'}
                        </span>
                        <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {skill.progressPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${stageInfo.barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Interactive Controls for Owner (Slider + Quick Boost Pills) / Viewer Mode for Partner */}
                  {isOwner ? (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      {/* Slider Control */}
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.progressPercent}
                          onChange={(e) => handleUpdateProgress(skill.id, Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* 1-Tap Quick Progress Buttons */}
                      <div className="flex items-center justify-between gap-1 flex-wrap text-[10px] font-bold">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateProgress(skill.id, skill.progressPercent + 5)}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition cursor-pointer"
                          >
                            +5%
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateProgress(skill.id, skill.progressPercent + 10)}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition cursor-pointer"
                          >
                            +10%
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateProgress(skill.id, 100)}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                          >
                            100% Complete
                          </button>
                        </div>

                        {/* Daily Effort Tracker */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddHours(skill.id, -0.5)}
                            className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer"
                            title="Minus 0.5 hours"
                          >
                            -0.5h
                          </button>
                          <span className="font-mono text-[11px] text-slate-700 font-bold px-1">
                            {skill.dailyEffortHours}h/day
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddHours(skill.id, 1)}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                          >
                            +1h Log
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Partner View Mode: Clean Live Monitoring & Direct Cheer Callout */
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{founder.name.split(' ')[0]} spends <strong>{skill.dailyEffortHours}h/day</strong> practicing</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendCheer(skill.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3 text-emerald-600" />
                        <span>Cheer on Partner</span>
                      </button>
                    </div>
                  )}

                  {/* Target Date Footer */}
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Target Date: <strong className="text-slate-600">{skill.targetDate}</strong>
                    </span>
                    <span className="font-mono">
                      {isOwner ? 'Your Active Track' : `Linked with ${founder.name.split(' ')[0]}`}
                    </span>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add New Skill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="app-card w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-3" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Skill Objective</h3>
                  <p className="text-xs text-slate-500">Visible to you & your connected partner in real-time.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick 1-Tap Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick Presets (এক ক্লিকে যোগ করুন):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(preset.title);
                      setCategory(preset.category);
                      setDailyHours(preset.hours);
                      setInitialPercent(preset.percent);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                  >
                    + {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateSkill} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skill Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Video Editing (Premiere / After Effects)"
                  className="w-full app-input px-3.5 py-2.5 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  >
                    <option value="Video Production">Video Production & Reels</option>
                    <option value="Web & App Development">Web & App Development</option>
                    <option value="Design & Figma">Design & Figma UI/UX</option>
                    <option value="Agency Sales & Closing">Agency Sales & Closing</option>
                    <option value="AI & Automation">AI & Automation Workflows</option>
                    <option value="Paid Advertising">Paid Advertising & Media</option>
                    <option value="General">General Mastery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Milestone Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Practice Hours: <strong className="text-indigo-600">{dailyHours} hrs/day</strong>
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full app-input px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Mastery Level: <strong className="text-indigo-600">{initialPercent}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={initialPercent}
                    onChange={(e) => setInitialPercent(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes & Milestones (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key deliverables, courses, client projects where this skill will be executed..."
                  className="w-full app-input px-3.5 py-2 text-xs h-18 resize-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-2 text-indigo-900 text-[11px] font-semibold">
                <Share2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>This skill will be immediately synced and visible to your agency partner.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  Save & Publish Skill
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
