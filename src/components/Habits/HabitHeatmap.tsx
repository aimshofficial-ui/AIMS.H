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
  Sparkles
} from 'lucide-react';
import { HabitItem, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';

interface HabitHeatmapProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

// Generate an array of the last 30 days
function getLast30Days(): { dateStr: string; dayNumber: number; dayName: string; isToday: boolean }[] {
  const list = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
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

  const days30 = getLast30Days();
  const todayStr = days30[days30.length - 1].dateStr;
  const foundersList = Object.values(appData.founders);

  const handleToggleDay = (habitId: string, dateStr: string) => {
    const updatedHabits = appData.habits.map((h) => {
      if (h.id !== habitId) return h;
      const currentVal = !!h.history[dateStr];
      const newHistory = { ...h.history, [dateStr]: !currentVal };

      // Calculate streak
      let streak = 0;
      for (let i = days30.length - 1; i >= 0; i--) {
        const d = days30[i].dateStr;
        if (newHistory[d]) {
          streak++;
        } else {
          // If today isn't checked yet, don't break yesterday's streak
          if (i === days30.length - 1) continue;
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

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="app-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              Daily Habit Tracker & Streak Heatmap
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              30-Day Grid
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Build compounding co-founder habits and maintain unbroken streaks together.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Habit
        </button>
      </div>

      {/* Summary Scoreboard Cards */}
      {appData.habits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="app-card p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Check-ins</span>
              <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
                {totalCompletionsToday} / {appData.habits.length}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="app-card p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Habits</span>
              <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
                {appData.habits.length}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="app-card p-3.5 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Top Streak</span>
              <div className="text-lg font-mono font-black text-amber-600 mt-0.5 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                {Math.max(0, ...appData.habits.map((h) => h.streakCount || 0))} Days
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      {appData.habits.length === 0 ? (
        <div className="app-card p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No habits tracked yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Track daily rituals like "Study 1 Hour Editing", "Daily Cold Outreach", or "Code Review".
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {appData.habits.map((habit) => {
            const isDoneToday = !!habit.history[todayStr];

            return (
              <div key={habit.id} className="app-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleDay(habit.id, todayStr)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition border ${
                        isDoneToday
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border-slate-200'
                      }`}
                      title={isDoneToday ? 'Completed today! Click to undo' : 'Mark done for today'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{habit.title}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {habit.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {habit.founderId === 'both' ? 'Shared Agency Habit' : 'Personal Habit'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{habit.streakCount || 0}d streak</span>
                    </div>

                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 30-Day Heatmap Grid */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-medium">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>

                  <div className="grid grid-cols-15 sm:grid-cols-30 gap-1">
                    {days30.map((d) => {
                      const done = !!habit.history[d.dateStr];
                      return (
                        <button
                          key={d.dateStr}
                          onClick={() => handleToggleDay(habit.id, d.dateStr)}
                          title={`${d.dateStr} (${d.dayName}): ${done ? 'Done' : 'Missed'}`}
                          className={`w-full aspect-square rounded-md transition border ${
                            done
                              ? 'bg-emerald-500 border-emerald-600 shadow-2xs'
                              : 'bg-slate-100 border-slate-200/80 hover:bg-slate-200'
                          } ${d.isToday ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
                        />
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="app-card w-full max-w-md p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                Add Daily Habit
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Habit Title</label>
                <input
                  type="text"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="e.g. Study 1 Hour High-End Editing"
                  className="w-full app-input px-3.5 py-2 text-xs"
                  required
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
                    <option value="Execution">Execution</option>
                    <option value="Skill Acquisition">Skill Acquisition</option>
                    <option value="Client Outreach">Client Outreach</option>
                    <option value="Agency Health">Agency Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={habitFounder}
                    onChange={(e) => setHabitFounder(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  >
                    <option value="both">Both Co-Founders</option>
                    {foundersList.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
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
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
