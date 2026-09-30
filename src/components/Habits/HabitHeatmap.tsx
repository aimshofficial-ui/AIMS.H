import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  Check, 
  Calendar, 
  Trash2, 
  TrendingUp, 
  CheckCircle2, 
  Award,
  Sparkles,
  Users,
  CheckCircle,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HabitItem, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';

interface HabitHeatmapProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

// 3D Geometric Torus & Sphere SVG Art
const Torus3DArt: React.FC<{ color?: string; size?: string }> = ({ color = 'orange', size = 'w-16 h-16' }) => {
  return (
    <svg className={`${size} opacity-85 select-none drop-shadow-md pointer-events-none`} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`habit3d-${color}`} cx="35%" cy="35%" r="65%">
          {color === 'orange' && (
            <>
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="40%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#c2410c" />
            </>
          )}
          {color === 'blue' && (
            <>
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </>
          )}
          {color === 'pink' && (
            <>
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="40%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#be185d" />
            </>
          )}
          {color === 'purple' && (
            <>
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="40%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </>
          )}
        </radialGradient>
        <radialGradient id={`habitSphere-${color}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      
      <circle cx="50" cy="50" r="32" stroke={`url(#habit3d-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="50" cy="50" r="32" stroke={`url(#habitSphere-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="72" cy="28" r="8" fill={`url(#habit3d-${color})`} />
      <circle cx="72" cy="28" r="8" fill={`url(#habitSphere-${color})`} />
      <circle cx="28" cy="68" r="5" fill={`url(#habit3d-${color})`} />
    </svg>
  );
};

// Generate an array of the last 14 days for mobile-friendly view
function getLast14Days(): { dateStr: string; dayNumber: number; dayName: string; isToday: boolean }[] {
  const list = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNumber = d.getDate();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isToday = i === 0;
    list.push({ dateStr, dayNumber, dayName, isToday });
  }
  return list;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ appData, onUpdateData }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState('Execution');
  const [habitFounder, setHabitFounder] = useState<'both' | string>('both');

  const days14 = getLast14Days();
  const todayStr = days14[days14.length - 1].dateStr;
  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0];
  const partnerUser = foundersList.find((f) => f.id !== activeUser.id);

  const handleToggleDay = (habitId: string, dateStr: string) => {
    const updatedHabits = appData.habits.map((h) => {
      if (h.id !== habitId) return h;
      const currentVal = !!h.history[dateStr];
      const newHistory = { ...h.history, [dateStr]: !currentVal };

      let streak = 0;
      for (let i = days14.length - 1; i >= 0; i--) {
        const d = days14[i].dateStr;
        if (newHistory[d]) {
          streak++;
        } else {
          if (i === days14.length - 1) continue;
          break;
        }
      }

      return {
        ...h,
        history: newHistory,
        streakCount: streak,
      };
    });

    const updated = { ...appData, habits: updatedHabits };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleDeleteHabit = (habitId: string) => {
    const updated = {
      ...appData,
      habits: appData.habits.filter((h) => h.id !== habitId),
    };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    const newHabit: HabitItem = {
      id: `hb-${Date.now()}`,
      founderId: habitFounder as any,
      title: habitTitle.trim(),
      category: habitCategory,
      streakCount: 0,
      history: {},
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = {
      ...appData,
      habits: [newHabit, ...appData.habits],
    };
    saveAppData(updated);
    onUpdateData(updated);

    setHabitTitle('');
    setIsAddModalOpen(false);
  };

  const totalCompletionsToday = appData.habits.filter((h) => h.history[todayStr]).length;
  const topStreak = Math.max(0, ...appData.habits.map((h) => h.streakCount || 0));

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans pb-12">
      
      {/* 1. HERO BANNER: 3D Minimalist Habits & Streaks */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 text-white p-5 sm:p-6 shadow-xl shadow-orange-500/20"
      >
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
          <Torus3DArt color="pink" size="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              Shared Habit Tracker & Rituals
            </span>

            <span className="text-xs font-mono font-bold text-white bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
              ● Mutual Accountability
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Unbroken Daily Execution Streaks.
            </h2>
            <p className="text-xs text-orange-100 mt-1 max-w-md">
              Maintain compounding habits across video editing, outreach, and development with live partner check-ins.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-100">
                Today: <strong>{totalCompletionsToday} of {appData.habits.length} Done</strong> • Top Streak: <strong>{topStreak} Days</strong>
              </span>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-orange-50 text-orange-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-3" />
              <span>Create Habit</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. 3D PASTEL HABIT CARDS */}
      <div className="space-y-3">
        {appData.habits.length === 0 ? (
          <div className="app-card p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Flame className="w-6 h-6 fill-amber-500" />
            </div>
            <h4 className="text-sm font-black text-slate-900">No habits tracked yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create daily habits like "Study 1 Hour Video Editing" or "Send 10 Client DMs".
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Habit
            </button>
          </div>
        ) : (
          appData.habits.map((habit, idx) => {
            const isDoneToday = !!habit.history[todayStr];

            // Rotating 3D Pastel Palette
            const colorVariant = idx % 3 === 0 ? 'orange' : idx % 3 === 1 ? 'blue' : 'pink';
            const cardClass = 
              colorVariant === 'orange' ? 'card-pastel-orange' :
              colorVariant === 'blue' ? 'card-pastel-blue' : 'card-pastel-pink';

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden p-4 sm:p-5 rounded-3xl ${cardClass} shadow-sm transition-all hover:shadow-md space-y-3.5`}
              >
                <div className="absolute right-2 top-2 pointer-events-none">
                  <Torus3DArt color={colorVariant} size="w-16 h-16" />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between gap-2 max-w-[82%]">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(habit.id, todayStr)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition cursor-pointer shadow-sm ${
                        isDoneToday
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                          : 'bg-white hover:bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                      title={isDoneToday ? 'Completed today! Click to undo' : 'Mark done for today'}
                    >
                      <Check className="w-5 h-5 stroke-3" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-slate-800 border border-slate-200">
                          {habit.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-white/90 px-2 py-0.5 rounded-full border border-amber-200">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{habit.streakCount || 0}d streak</span>
                        </div>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1 leading-snug">{habit.title}</h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 14-Day Micro-Heatmap Circles */}
                <div className="relative z-10 pt-1">
                  <span className="text-[10px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                    Last 14 Days Heatmap:
                  </span>
                  <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                    {days14.map((day) => {
                      const done = !!habit.history[day.dateStr];
                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          onClick={() => handleToggleDay(habit.id, day.dateStr)}
                          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center transition cursor-pointer border ${
                            done
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                              : day.isToday
                              ? 'bg-white border-indigo-400 text-slate-800'
                              : 'bg-white/60 hover:bg-white border-slate-200 text-slate-400'
                          }`}
                          title={`${day.dateStr}: ${done ? 'Completed' : 'Missed'}`}
                        >
                          <span className="text-[9px] font-bold uppercase leading-none opacity-80">{day.dayName}</span>
                          <span className="text-[11px] font-black leading-none mt-1">{day.dayNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* CREATE HABIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="app-card w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                Add Daily Habit
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Habit Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="e.g. Study 1 Hour Premiere Pro / 15 Client Outreach"
                  className="w-full app-input px-3.5 py-2 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  >
                    <option value="Execution">Execution & Coding</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Outreach">Client Outreach</option>
                    <option value="Fitness">Fitness & Health</option>
                    <option value="Mindset">Deep Focus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Accountability</label>
                  <select
                    value={habitFounder}
                    onChange={(e) => setHabitFounder(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  >
                    <option value="both">Both Co-Founders</option>
                    <option value={activeUser.id}>Just Me</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
