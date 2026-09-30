import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Clock, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Trash2, 
  Filter,
  Sparkles,
  ArrowRight,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MissionItem, MissionPriority, MissionStatus, AssigneeId, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';
import { MissionAnalytics } from './MissionAnalytics';

interface MissionBoardProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

// Calculate remaining time for countdown
function calculateTimeLeft(targetDateStr: string) {
  const diff = new Date(targetDateStr).getTime() - Date.now();
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { expired: false, days, hours, minutes, seconds };
}

// Clean Light Countdown component
const MissionCountdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1 font-semibold">
        <Clock className="w-3 h-3" /> Target Passed
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 font-mono text-[11px] text-indigo-700 bg-indigo-50/80 border border-indigo-200/80 px-2 py-0.5 rounded-lg shadow-2xs font-semibold">
      <Clock className="w-3 h-3 text-indigo-600" />
      <span>{timeLeft.days}d</span>
      <span className="text-slate-400">:</span>
      <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
      <span className="text-slate-400">:</span>
      <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
      <span className="text-slate-400">:</span>
      <span className="text-indigo-600">{String(timeLeft.seconds).padStart(2, '0')}s</span>
    </div>
  );
};

export const MissionBoard: React.FC<MissionBoardProps> = ({ appData, onUpdateData }) => {
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | AssigneeId>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | MissionPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Mission form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0] + 'T18:00';
  });
  const [newPriority, setNewPriority] = useState<MissionPriority>('High');
  const [newStatus, setNewStatus] = useState<MissionStatus>('To-Do');
  const [newAssignee, setNewAssignee] = useState<AssigneeId>('both');
  const [newTags, setNewTags] = useState('Agency');
  const [newSubtasksInput, setNewSubtasksInput] = useState('');

  const columns: MissionStatus[] = ['To-Do', 'In Progress', 'Completed'];

  const handleUpdateStatus = (missionId: string, newStatus: MissionStatus) => {
    const updatedMissions = appData.missions.map((m) =>
      m.id === missionId ? { ...m, status: newStatus } : m
    );
    const updated = { ...appData, missions: updatedMissions };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleToggleSubtask = (missionId: string, subtaskId: string) => {
    const updatedMissions = appData.missions.map((m) => {
      if (m.id !== missionId) return m;
      const updatedSubtasks = m.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
      return {
        ...m,
        subtasks: updatedSubtasks,
        status: allDone ? ('Completed' as MissionStatus) : m.status,
      };
    });
    const updated = { ...appData, missions: updatedMissions };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleDeleteMission = (missionId: string) => {
    const updatedMissions = appData.missions.filter((m) => m.id !== missionId);
    const updated = { ...appData, missions: updatedMissions };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subtasks = newSubtasksInput
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title,
        completed: false,
      }));

    const tags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const safeTargetDate = newDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] + 'T18:00';

    const createdMission: MissionItem = {
      id: `m-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      targetDate: safeTargetDate,
      status: newStatus,
      priority: newPriority,
      assignee: newAssignee,
      tags: tags.length ? tags : ['Agency'],
      subtasks,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...appData,
      missions: [createdMission, ...appData.missions],
    };
    saveAppData(updated);
    onUpdateData(updated);

    setNewTitle('');
    setNewDesc('');
    setNewSubtasksInput('');
    setIsAddModalOpen(false);
  };

  const foundersList = Object.values(appData.founders);

  const filteredMissions = appData.missions.filter((m) => {
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'both' && m.assignee !== 'both') return false;
      if (assigneeFilter !== 'both' && m.assignee !== assigneeFilter && m.assignee !== 'both') return false;
    }
    if (priorityFilter !== 'all' && m.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchTag = m.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const activeUser = appData.founders[appData.activeFounderId] || { name: 'Founder' };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner Card */}
      <div className="app-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Mission Control & Agency Sprints
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {appData.missions.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Set sprint target dates, live countdowns, and synchronized checklist milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Launch New Mission
        </button>
      </div>

      {/* Analytics visualization if missions exist */}
      {appData.missions.length > 0 && (
        <MissionAnalytics missions={appData.missions} appData={appData} />
      )}

      {/* Filters Bar */}
      {appData.missions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg app-input text-xs"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {foundersList.length > 0 && (
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg app-input text-xs"
              >
                <option value="all">All Assignees</option>
                <option value="both">Shared (Both)</option>
                {foundersList.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search missions..."
              className="w-full px-3 py-1.5 rounded-lg app-input text-xs"
            />
          </div>
        </div>
      )}

      {/* Empty State when zero missions exist */}
      {appData.missions.length === 0 ? (
        <div className="app-card p-10 text-center space-y-4 border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Target className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Your Mission Board is Clean & Ready</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No clutter or pre-set dummy tasks. Launch your first agency mission or sprint milestone together with your co-founder!
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Launch First Mission
          </button>
        </div>
      ) : (
        /* Kanban Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((status) => {
            const columnMissions = filteredMissions.filter((m) => m.status === status);

            return (
              <div
                key={status}
                className="app-card p-4 space-y-3 flex flex-col justify-between min-h-[380px]"
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        status === 'In Progress' ? 'bg-indigo-600 animate-pulse' : status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{status}</h4>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {columnMissions.length}
                    </span>
                  </div>

                  {/* Cards list */}
                  <div className="space-y-3 pt-3">
                    {columnMissions.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        No missions in {status}
                      </div>
                    ) : (
                      columnMissions.map((mission) => {
                        const completedSubtasks = mission.subtasks.filter((st) => st.completed).length;
                        const totalSubtasks = mission.subtasks.length;
                        const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                        const priorityBadge = {
                          High: 'bg-rose-50 text-rose-700 border-rose-200',
                          Medium: 'bg-amber-50 text-amber-700 border-amber-200',
                          Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        }[mission.priority];

                        const assignedFounder = appData.founders[mission.assignee];

                        return (
                          <div
                            key={mission.id}
                            className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-400/50 hover:shadow-xs transition space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${priorityBadge}`}>
                                {mission.priority} Priority
                              </span>
                              <MissionCountdown targetDate={mission.targetDate} />
                            </div>

                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                  {mission.title}
                                </h5>
                              </div>
                              {assignedFounder ? (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                                  <img src={assignedFounder.avatar} alt={assignedFounder.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                                  <span className="font-medium text-slate-700">{assignedFounder.name.split(' ')[0]}</span>
                                </div>
                              ) : (
                                <div className="inline-block text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 mb-1">
                                  Shared (Both)
                                </div>
                              )}
                              {mission.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2">
                                  {mission.description}
                                </p>
                              )}
                            </div>

                            {/* Subtasks Progress */}
                            {totalSubtasks > 0 && (
                              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                  <span>Checklist</span>
                                  <span className="font-bold text-slate-700">{completedSubtasks}/{totalSubtasks}</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>

                                <div className="space-y-1 pt-1 max-h-28 overflow-y-auto">
                                  {mission.subtasks.map((st) => (
                                    <div
                                      key={st.id}
                                      onClick={() => handleToggleSubtask(mission.id, st.id)}
                                      className="flex items-start gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-[11px] transition"
                                    >
                                      {st.completed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                      )}
                                      <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                                        {st.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Status mover */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1">
                                {status !== 'To-Do' && (
                                  <button
                                    onClick={() => handleUpdateStatus(mission.id, 'To-Do')}
                                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  >
                                    To-Do
                                  </button>
                                )}
                                {status !== 'In Progress' && (
                                  <button
                                    onClick={() => handleUpdateStatus(mission.id, 'In Progress')}
                                    className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold"
                                  >
                                    In Progress
                                  </button>
                                )}
                                {status !== 'Completed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(mission.id, 'Completed')}
                                    className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                                  >
                                    Done ✓
                                  </button>
                                )}
                              </div>

                              <button
                                onClick={() => handleDeleteMission(mission.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Mission Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-800 shadow-2xl relative border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Launch New Mission
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set sprint target dates and checklist milestones for you and your partner.
            </p>

            <form onSubmit={handleCreateMission} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mission Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Close 3 SaaS Retainers at $5,000/mo"
                  className="w-full px-3.5 py-2.5 text-xs app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Deliverables
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Specific scope, requirements, or client deliverables..."
                  className="w-full px-3.5 py-2 text-xs app-input resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs app-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as MissionStatus)}
                    className="w-full px-2.5 py-2 text-xs app-input"
                  >
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as MissionPriority)}
                    className="w-full px-2.5 py-2 text-xs app-input"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assignee
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs app-input"
                  >
                    <option value="both">Both</option>
                    {foundersList.map((f) => (
                      <option key={f.id} value={f.id}>{f.name.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Checklist Milestones (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={newSubtasksInput}
                  onChange={(e) => setNewSubtasksInput(e.target.value)}
                  placeholder="Record 10 Loom audits&#10;Audit contracts&#10;Onboard client"
                  className="w-full px-3.5 py-2 text-xs app-input"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs"
                >
                  Create Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
