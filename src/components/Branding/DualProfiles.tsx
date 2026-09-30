import React, { useState } from 'react';
import { 
  UserCheck, 
  Linkedin, 
  Twitter, 
  Globe, 
  Youtube, 
  Github, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  Target, 
  TrendingUp,
  Trash2
} from 'lucide-react';
import { BrandingTask, SharedAppData, UserProfile } from '../../types';
import { saveAppData } from '../../utils/storage';

interface DualProfilesProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

export const DualProfiles: React.FC<DualProfilesProps> = ({ appData, onUpdateData }) => {
  const [selectedFounderFilter, setSelectedFounderFilter] = useState<'both' | 'founder_1' | 'founder_2'>('both');
  const [isAddChecklistOpen, setIsAddChecklistOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<string | null>(null);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<BrandingTask['category']>('LinkedIn');
  const [taskFounder, setTaskFounder] = useState<'founder_1' | 'founder_2'>('founder_1');
  const [taskNotes, setTaskNotes] = useState('');

  // Edit profile form state
  const [editBio, setEditBio] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editObjective, setEditObjective] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [editYoutube, setEditYoutube] = useState('');

  const founder1 = appData.founders.founder_1 || { name: 'Aiman S.' };
  const founder2 = appData.founders.founder_2 || { name: 'Hamza K.' };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = appData.brandingTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updated = { ...appData, brandingTasks: updatedTasks };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = appData.brandingTasks.filter((t) => t.id !== taskId);
    const updated = { ...appData, brandingTasks: updatedTasks };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: BrandingTask = {
      id: `bt-${Date.now()}`,
      founderId: taskFounder,
      title: taskTitle.trim(),
      category: taskCategory,
      completed: false,
      notes: taskNotes.trim(),
    };

    const updated = {
      ...appData,
      brandingTasks: [...appData.brandingTasks, newTask],
    };
    saveAppData(updated);
    onUpdateData(updated);

    setTaskTitle('');
    setTaskNotes('');
    setIsAddChecklistOpen(false);
  };

  const openEditModal = (founderId: string) => {
    const founder = appData.founders[founderId];
    if (!founder) return;
    setEditRole(founder.role);
    setEditBio(founder.bio);
    setEditObjective(founder.primaryObjective);
    setEditLinkedin(founder.socials.linkedin || '');
    setEditTwitter(founder.socials.twitter || '');
    setEditPortfolio(founder.socials.portfolio || '');
    setEditYoutube(founder.socials.youtube || '');
    setIsEditProfileOpen(founderId);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditProfileOpen) return;

    const current = appData.founders[isEditProfileOpen];
    if (!current) return;

    const updatedProfile: UserProfile = {
      ...current,
      role: editRole.trim(),
      bio: editBio.trim(),
      primaryObjective: editObjective.trim(),
      socials: {
        ...current.socials,
        linkedin: editLinkedin.trim(),
        twitter: editTwitter.trim(),
        portfolio: editPortfolio.trim(),
        youtube: editYoutube.trim(),
      },
    };

    const updatedFounders = {
      ...appData.founders,
      [isEditProfileOpen]: updatedProfile,
    };

    const updated = {
      ...appData,
      founders: updatedFounders,
    };
    saveAppData(updated);
    onUpdateData(updated);
    setIsEditProfileOpen(null);
  };

  const founder1Tasks = appData.brandingTasks.filter((t) => t.founderId === 'founder_1');
  const founder2Tasks = appData.brandingTasks.filter((t) => t.founderId === 'founder_2');

  const f1Completed = founder1Tasks.filter((t) => t.completed).length;
  const f1Pct = founder1Tasks.length > 0 ? Math.round((f1Completed / founder1Tasks.length) * 100) : 0;

  const f2Completed = founder2Tasks.filter((t) => t.completed).length;
  const f2Pct = founder2Tasks.length > 0 ? Math.round((f2Completed / founder2Tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-pink-400" />
              Dual Founder Profiles & Personal Branding Hub
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Authority Synergy
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Align personal founder distribution (YouTube, X, LinkedIn, Case Studies) to build inbound deal flow for AIMS.H Agency.
          </p>
        </div>

        <button
          onClick={() => setIsAddChecklistOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Branding Objective
        </button>
      </div>

      {/* Dual Founder Profile Cards Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Founder 1 Card */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={founder1.avatar}
                alt={founder1.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{founder1.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    @{founder1.username}
                  </span>
                </div>
                <p className="text-xs text-cyan-400 font-medium">{founder1.role}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">Invite Code: {founder1.inviteCode}</p>
              </div>
            </div>

            <button
              onClick={() => openEditModal('founder_1')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-white/5">
            "{founder1.bio}"
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-2 pt-1">
            {founder1.socials.linkedin && (
              <a
                href={founder1.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-white/5 transition"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {founder1.socials.twitter && (
              <a
                href={founder1.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-white/5 transition"
                title="Twitter/X"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {founder1.socials.portfolio && (
              <a
                href={founder1.socials.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-white/5 transition"
                title="Portfolio"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {founder1.socials.github && (
              <a
                href={founder1.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-white/5 transition"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Primary Objective */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1 font-semibold">
              <Target className="w-3 h-3" />
              Primary Mission Objective:
            </span>
            <p className="text-xs text-white leading-relaxed">{founder1.primaryObjective}</p>
          </div>

          {/* Branding Progress */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Branding Checklist Velocity</span>
              <span className="font-mono text-cyan-300 font-bold">{f1Completed}/{founder1Tasks.length} ({f1Pct}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${f1Pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Founder 2 Card */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={founder2.avatar}
                alt={founder2.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-400 shadow-lg shadow-purple-500/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{founder2.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    @{founder2.username}
                  </span>
                </div>
                <p className="text-xs text-purple-400 font-medium">{founder2.role}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">Invite Code: {founder2.inviteCode}</p>
              </div>
            </div>

            <button
              onClick={() => openEditModal('founder_2')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-white/5">
            "{founder2.bio}"
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-2 pt-1">
            {founder2.socials.linkedin && (
              <a
                href={founder2.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 border border-white/5 transition"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {founder2.socials.twitter && (
              <a
                href={founder2.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 border border-white/5 transition"
                title="Twitter/X"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {founder2.socials.portfolio && (
              <a
                href={founder2.socials.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 border border-white/5 transition"
                title="Portfolio"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {founder2.socials.youtube && (
              <a
                href={founder2.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 border border-white/5 transition"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Primary Objective */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 flex items-center gap-1 font-semibold">
              <Target className="w-3 h-3" />
              Primary Mission Objective:
            </span>
            <p className="text-xs text-white leading-relaxed">{founder2.primaryObjective}</p>
          </div>

          {/* Branding Progress */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Branding Checklist Velocity</span>
              <span className="font-mono text-purple-300 font-bold">{f2Completed}/{founder2Tasks.length} ({f2Pct}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${f2Pct}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Personal Branding Checklist Tasks Section */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Founder Personal Branding Action Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted action items for content distribution, audience building, and agency proof.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setSelectedFounderFilter('both')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedFounderFilter === 'both' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-slate-400'
              }`}
            >
              All Co-Founders
            </button>
            <button
              onClick={() => setSelectedFounderFilter('founder_1')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedFounderFilter === 'founder_1' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
              }`}
            >
              {founder1.name}
            </button>
            <button
              onClick={() => setSelectedFounderFilter('founder_2')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedFounderFilter === 'founder_2' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'
              }`}
            >
              {founder2.name}
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {appData.brandingTasks
            .filter((t) => selectedFounderFilter === 'both' || t.founderId === selectedFounderFilter)
            .map((task) => {
              const assigned = appData.founders[task.founderId] || { name: 'Founder' };

              const categoryBadge = {
                LinkedIn: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
                Twitter: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
                YouTube: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
                Outreach: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
                General: 'bg-slate-800/80 text-slate-300 border-white/10',
              }[task.category];

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-900/40 border-white/5 opacity-70'
                      : 'glass-card border-white/10 hover:border-pink-500/40'
                  }`}
                >
                  <div
                    onClick={() => handleToggleTask(task.id)}
                    className="flex items-start gap-3 cursor-pointer flex-1"
                  >
                    <div className="mt-0.5">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 hover:text-pink-400 shrink-0 transition" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded border ${categoryBadge}`}>
                          {task.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {assigned.name.split(' ')[0]}
                        </span>
                      </div>

                      <p
                        className={`text-xs font-medium leading-snug ${
                          task.completed ? 'text-slate-500 line-through' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          "{task.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddChecklistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel-glow border border-pink-500/30 p-6 text-slate-100 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Add Branding Task</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a public authority milestone to your founder roadmap.
            </p>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Publish breakdown of our video retention framework"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assign To
                  </label>
                  <select
                    value={taskFounder}
                    onChange={(e) => setTaskFounder(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="founder_1">{founder1.name}</option>
                    <option value="founder_2">{founder2.name}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Channel / Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter/X</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Outreach">Outreach</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Success Metric
                </label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Target 10K+ impressions or 3 high-intent DMs..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddChecklistOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl glass-panel-glow border border-cyan-500/30 p-6 text-slate-100 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Edit Founder Profile</h3>
            <p className="text-xs text-slate-400 mb-4">
              Update your agency title, personal bio, and primary mission focus.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Agency Role Title
                </label>
                <input
                  type="text"
                  required
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bio / Strategic Focus
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Mission Objective
                </label>
                <textarea
                  rows={2}
                  value={editObjective}
                  onChange={(e) => setEditObjective(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Twitter / X URL
                  </label>
                  <input
                    type="url"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    value={editPortfolio}
                    onChange={(e) => setEditPortfolio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    value={editYoutube}
                    onChange={(e) => setEditYoutube(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
