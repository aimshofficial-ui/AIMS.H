import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Award, 
  Flame, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Trash2,
  Layers,
  ArrowRight,
  Filter,
  Users
} from 'lucide-react';
import { SkillItem, MasteryStage, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';

interface SkillMatrixProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

// Stage configuration with clean light badges & colors
const STAGE_CONFIG: Record<
  MasteryStage,
  { label: string; min: number; max: number; badgeColor: string; barColor: string; textColor: string }
> = {
  Beginner: {
    label: 'Beginner',
    min: 0,
    max: 34,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    barColor: 'from-amber-400 to-amber-500',
    textColor: 'text-amber-700',
  },
  Intermediate: {
    label: 'Intermediate',
    min: 35,
    max: 74,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    barColor: 'from-sky-400 to-indigo-500',
    textColor: 'text-sky-700',
  },
  Expert: {
    label: 'Expert',
    min: 75,
    max: 100,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barColor: 'from-emerald-400 to-teal-500',
    textColor: 'text-emerald-700',
  },
};

function getStageFromPercent(pct: number): MasteryStage {
  if (pct < 35) return 'Beginner';
  if (pct < 75) return 'Intermediate';
  return 'Expert';
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({ appData, onUpdateData }) => {
  const [stageFilter, setStageFilter] = useState<'all' | MasteryStage>('all');
  const [selectedFounderFilter, setSelectedFounderFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [boostedId, setBoostedId] = useState<string | null>(null);

  // New Skill form state
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
  const [assigneeFounder, setAssigneeFounder] = useState(appData.activeFounderId);

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const handleUpdateProgress = (skillId: string, newPercent: number) => {
    const stage = getStageFromPercent(newPercent);
    const updatedSkills = appData.skills.map((s) =>
      s.id === skillId ? { ...s, progressPercent: newPercent, stage } : s
    );
    const updated = { ...appData, skills: updatedSkills };
    saveAppData(updated);
    onUpdateData(updated);
  };

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
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleSendBoost = (skillId: string) => {
    const updatedSkills = appData.skills.map((s) =>
      s.id === skillId ? { ...s, kudosCount: (s.kudosCount || 0) + 1 } : s
    );
    const updated = { ...appData, skills: updatedSkills };
    saveAppData(updated);
    onUpdateData(updated);

    setBoostedId(skillId);
    setTimeout(() => setBoostedId(null), 1800);
  };

  const handleDeleteSkill = (skillId: string) => {
    const updatedSkills = appData.skills.filter((s) => s.id !== skillId);
    const updated = { ...appData, skills: updatedSkills };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      founderId: assigneeFounder || appData.activeFounderId,
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
    saveAppData(updated);
    onUpdateData(updated);

    setTitle('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const filteredSkills = appData.skills.filter((s) => {
    if (stageFilter !== 'all' && s.stage !== stageFilter) return false;
    if (selectedFounderFilter !== 'all' && s.founderId !== selectedFounderFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="app-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Skill Acquisition & Mastery Tracker
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {appData.skills.length} Skills
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor daily mastery growth, effort hours, and stage progression.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add New Skill
        </button>
      </div>

      {/* Filter Tabs & Founder Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Stage Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setStageFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              stageFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Stages
          </button>
          {(['Beginner', 'Intermediate', 'Expert'] as MasteryStage[]).map((stg) => (
            <button
              key={stg}
              onClick={() => setStageFilter(stg)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                stageFilter === stg ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>

        {/* Founder filter if multiple founders exist */}
        {foundersList.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setSelectedFounderFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedFounderFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Founders
            </button>
            {foundersList.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFounderFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                  selectedFounderFilter === f.id ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <img src={f.avatar} alt={f.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                <span>{f.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="app-card p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No active skills in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Track daily practice and mastery milestones for you and your co-founder.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSkills.map((skill) => {
            const stageInfo = STAGE_CONFIG[skill.stage];
            const founder = appData.founders[skill.founderId] || activeUser;
            const isBoosted = boostedId === skill.id;

            return (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="app-card p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                        {skill.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${stageInfo.badgeColor}`}>
                        {skill.stage}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{skill.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendBoost(skill.id)}
                      className={`p-1.5 rounded-lg border transition text-xs flex items-center gap-1 ${
                        isBoosted
                          ? 'bg-amber-100 border-amber-300 text-amber-800 scale-110'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                      title="Send kudos to partner"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-[11px]">{skill.kudosCount || 0}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                      Mastery Progress
                    </span>
                    <span className="font-mono font-bold text-slate-900">{skill.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${stageInfo.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progressPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Interactive Slider & Quick Hour Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.progressPercent}
                      onChange={(e) => handleUpdateProgress(skill.id, Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleAddHours(skill.id, 1)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 font-semibold text-[11px] transition"
                    >
                      +1h Log
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <img src={founder.avatar} alt={founder.name} className="w-4 h-4 rounded-full object-cover" />
                    <span className="font-medium text-slate-700">{founder.name.split(' ')[0]}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {skill.dailyEffortHours}h/day
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Target: {skill.targetDate}</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Skill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="app-card w-full max-w-md p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add New Skill Objective
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSkill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Video Editing (After Effects / Premiere)"
                  className="w-full app-input px-3.5 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  >
                    <option value="Video Production">Video Production</option>
                    <option value="Web & App Development">Web & App Dev</option>
                    <option value="Paid Advertising">Paid Advertising</option>
                    <option value="Design & Figma">Design & Figma</option>
                    <option value="Agency Sales & Closing">Agency Sales</option>
                    <option value="AI & Automation">AI & Automation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Founder</label>
                  <select
                    value={assigneeFounder}
                    onChange={(e) => setAssigneeFounder(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  >
                    {foundersList.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Target Hours</label>
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Starting Progress: <strong className="text-indigo-600">{initialPercent}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={initialPercent}
                  onChange={(e) => setInitialPercent(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
