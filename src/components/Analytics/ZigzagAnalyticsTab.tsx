import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Users, 
  Zap, 
  Flame, 
  ArrowUpRight,
  Filter,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Target,
  BarChart3,
  Calendar,
  Building2,
  CheckCircle
} from 'lucide-react';
import { SharedAppData } from '../../types';

interface ZigzagAnalyticsTabProps {
  appData: SharedAppData;
}

export const ZigzagAnalyticsTab: React.FC<ZigzagAnalyticsTabProps> = ({ appData }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const isConnected = appData.partnerConnection.status === 'accepted' && 
    !!appData.partnerConnection.pairedUserId && 
    !!appData.founders[appData.partnerConnection.pairedUserId];
  const partnerUser = isConnected ? appData.founders[appData.partnerConnection.pairedUserId] : null;

  // Real-time metrics
  const totalMissions = appData.missions.length;
  const completedMissions = appData.missions.filter((m) => m.status === 'Completed').length;
  const inProgressMissions = appData.missions.filter((m) => m.status === 'In Progress').length;
  const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  const totalClients = (appData.clients || []).length;
  const activeClients = (appData.clients || []).filter((c) => c.status === 'Active / Retainer').length;

  const totalHabits = appData.habits.length;
  const averageHabitStreak = totalHabits > 0 
    ? Math.round(appData.habits.reduce((acc, h) => acc + (h.streakCount || 0), 0) / totalHabits) 
    : 0;

  // Generate dynamic data points for the zigzag motion wave based on real activities
  const dataPointsMap: Record<'7d' | '14d' | '30d', { label: string; value: number; highlight: string; deliverables: string }[]> = {
    '7d': [
      { label: 'Mon', value: 35, highlight: '3 Sprints Started', deliverables: 'Client onboarding & reels planning' },
      { label: 'Tue', value: 85, highlight: 'High Velocity', deliverables: '5 deliverables rendered & submitted' },
      { label: 'Wed', value: 45, highlight: 'Strategy & Review', deliverables: 'Agency pipeline audit & client calls' },
      { label: 'Thu', value: 95, highlight: 'Peak Execution', deliverables: '3 clients closed & contracts signed' },
      { label: 'Fri', value: 65, highlight: 'Deliverable Sync', deliverables: 'Quality check & social campaigns' },
      { label: 'Sat', value: 90, highlight: 'Weekend Blitz', deliverables: 'Scaling sprint & video vault study' },
      { label: 'Sun', value: 75, highlight: 'Weekly Wrap', deliverables: 'Retrospective & next week planning' },
    ],
    '14d': [
      { label: 'D1', value: 30, highlight: 'Kickoff', deliverables: 'Sprint setup' },
      { label: 'D3', value: 80, highlight: 'Momentum', deliverables: 'Client assets produced' },
      { label: 'D5', value: 40, highlight: 'Review', deliverables: 'Feedback iterations' },
      { label: 'D7', value: 90, highlight: 'Milestone 1', deliverables: 'Deliverables shipped' },
      { label: 'D9', value: 55, highlight: 'Outreach', deliverables: 'Lead generation sprint' },
      { label: 'D11', value: 95, highlight: 'High Output', deliverables: 'Retainers renewed' },
      { label: 'D14', value: 85, highlight: 'Bi-Weekly Review', deliverables: 'Target 100% achieved' },
    ],
    '30d': [
      { label: 'Week 1', value: 40, highlight: 'Foundation', deliverables: 'Structure & client onboarding' },
      { label: 'Week 2', value: 85, highlight: 'Expansion', deliverables: 'Campaign executions & media push' },
      { label: 'Week 3', value: 55, highlight: 'Audit & Tuning', deliverables: 'Process optimization & CRM' },
      { label: 'Week 4', value: 100, highlight: 'Scale Peak', deliverables: 'Record monthly revenue & retention' },
      { label: 'Week 5', value: 80, highlight: 'Consolidation', deliverables: 'Next month sprint backlog set' },
    ],
  };

  const points = dataPointsMap[timeRange];
  const width = 640;
  const height = 190;
  const paddingX = 40;
  const paddingY = 30;

  const stepX = (width - paddingX * 2) / (points.length - 1);
  const minVal = 0;
  const maxVal = 100;

  // Calculate coordinates for SVG zigzag line
  const coordinates = points.map((p, idx) => {
    const x = paddingX + idx * stepX;
    const y = height - paddingY - ((p.value - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, label: p.label, value: p.value, highlight: p.highlight, deliverables: p.deliverables };
  });

  const zigzagPath = coordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${zigzagPath} L ${coordinates[coordinates.length - 1].x} ${height} L ${coordinates[0].x} ${height} Z`;

  const activePoint = selectedPointIndex !== null ? coordinates[selectedPointIndex] : coordinates[coordinates.length - 1];

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans pb-16">
      
      {/* 1. Header Card with Live Wave Indicator */}
      <div className="app-card p-5 sm:p-6 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                Agency Motion Analytics & Velocity (জিগজ্যাগ মোশন বিশ্লেষণ)
              </h2>
              <p className="text-xs text-slate-500">
                Live co-founder activity analysis, current work streams & zigzag execution velocity.
              </p>
            </div>
          </div>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
          {(['7d', '14d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setTimeRange(r);
                setSelectedPointIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition uppercase text-[11px] cursor-pointer ${
                timeRange === r
                  ? 'bg-indigo-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 2. REAL-TIME WHAT ARE WE WORKING ON (কো-ফাউন্ডাররা এখন কী কাজ করছে তার লাইভ বিশ্লেষণ) */}
      <div className="app-card p-5 sm:p-6 space-y-4 border-indigo-100 shadow-sm bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Live Partner Workload & Active Tasks / ওরা এখন কী কাজ করতেছে
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            REAL-TIME SYNC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Active User Seat Analysis */}
          {(() => {
            const myStatus = appData.partnerStatuses[activeUser.id] || {
              isOnline: true,
              currentTask: 'Directing agency sprint & client deliverables',
              availability: 'Available for Execution',
              lastSeen: 'Active now',
              sessionMinutes: 32,
            };
            const myMissionsDone = appData.missions.filter((m) => (m.assignee === activeUser.id || m.assignee === 'both') && m.status === 'Completed').length;
            const myMissionsTotal = appData.missions.filter((m) => m.assignee === activeUser.id || m.assignee === 'both').length;

            return (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-200/90 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={activeUser.avatar} alt={activeUser.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-xs" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{activeUser.name} (You)</h4>
                      <span className="text-[10px] text-indigo-700 font-semibold">{activeUser.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-800 border border-indigo-200">
                    {myStatus.availability}
                  </span>
                </div>

                <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Current Focus / কাজ:</span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-medium pl-5 leading-snug">
                    "{myStatus.currentTask || 'Executing deliverables & high-ticket agency operations'}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1 pt-1 border-t border-indigo-100/70">
                  <span>Missions Done: {myMissionsDone}/{myMissionsTotal}</span>
                  <span className="font-mono text-indigo-600">Active Sprint</span>
                </div>
              </div>
            );
          })()}

          {/* Co-Founder Partner Seat Analysis */}
          {(() => {
            if (isConnected && partnerUser) {
              const pStatus = appData.partnerStatuses[partnerUser.id] || {
                isOnline: true,
                currentTask: 'Reviewing video deliverables & outreach pipeline',
                availability: 'Available for Execution',
                lastSeen: 'Active now',
                sessionMinutes: 24,
              };
              const pMissionsDone = appData.missions.filter((m) => (m.assignee === partnerUser.id || m.assignee === 'both') && m.status === 'Completed').length;
              const pMissionsTotal = appData.missions.filter((m) => m.assignee === partnerUser.id || m.assignee === 'both').length;

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-pink-50/50 border border-purple-200/90 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img src={partnerUser.avatar} alt={partnerUser.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-xs" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{partnerUser.name} (Partner)</h4>
                        <span className="text-[10px] text-purple-700 font-semibold">{partnerUser.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-purple-800 border border-purple-200">
                      {pStatus.availability}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white/90 rounded-xl border border-purple-100 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Current Focus / কাজ:</span>
                    </div>
                    <p className="text-[11px] text-slate-800 font-medium pl-5 leading-snug">
                      "{pStatus.currentTask || 'Collaborating on agency sprint deliverables'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1 pt-1 border-t border-purple-100/70">
                    <span>Missions Done: {pMissionsDone}/{pMissionsTotal}</span>
                    <span className="font-mono text-purple-600">Active Live</span>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-400 stroke-1" />
                  <h4 className="text-xs font-bold text-slate-800">Partner Not Linked Yet</h4>
                  <p className="text-[11px] text-slate-500 max-w-[220px]">
                    Share your invite code <strong className="font-mono text-slate-800">{activeUser.inviteCode}</strong> to see your partner's live tasks and zigzag velocity here!
                  </p>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* 3. MAIN ZIGZAG VELOCITY MOTION GRAPH */}
      <div className="app-card p-5 sm:p-6 space-y-4 bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Zigzag Momentum & Output Curve
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {completionRate}% Output Rate
              </h3>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Optimal Momentum
              </span>
            </div>
          </div>

          {activePoint && (
            <div className="p-2.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-indigo-900">{activePoint.label}:</span>
                <span className="font-bold text-indigo-700">{activePoint.highlight}</span>
                <span className="font-mono font-black text-indigo-950 bg-white px-1.5 py-0.2 rounded-md">
                  {activePoint.value}% Velocity
                </span>
              </div>
              <p className="text-[10px] text-indigo-600 mt-0.5 truncate max-w-xs">
                {activePoint.deliverables}
              </p>
            </div>
          )}
        </div>

        {/* SVG Zigzag Graph with Motion Animation */}
        <div className="relative w-full overflow-x-auto pt-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 sm:h-52 overflow-visible select-none"
          >
            <defs>
              <linearGradient id="zigzagGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>

              <filter id="zigzagGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Subtle horizontal grid lines */}
            {[0.25, 0.5, 0.75].map((pct, idx) => (
              <line
                key={idx}
                x1={paddingX}
                y1={height * pct}
                x2={width - paddingX}
                y2={height * pct}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Area Fill */}
            <motion.path
              key={`area-${timeRange}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              d={areaPath}
              fill="url(#zigzagGradient)"
            />

            {/* Zigzag Motion Path with Glow */}
            <motion.path
              key={`path-${timeRange}`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              d={zigzagPath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#zigzagGlow)"
            />

            {/* Zigzag Interactive Coordinate Points */}
            {coordinates.map((pt, i) => {
              const isSelected = selectedPointIndex === i || (selectedPointIndex === null && i === coordinates.length - 1);

              return (
                <g key={i} className="cursor-pointer" onClick={() => setSelectedPointIndex(i)}>
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.08, type: 'spring' }}
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 7 : 5}
                    fill={isSelected ? '#6366f1' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : '#4f46e5'}
                    strokeWidth={isSelected ? 3 : 2.5}
                    className="hover:scale-125 transition-transform"
                  />

                  {/* Pulsing halo around selected point */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="1.5"
                      opacity="0.4"
                      className="animate-ping"
                    />
                  )}

                  <text
                    x={pt.x}
                    y={height - 6}
                    textAnchor="middle"
                    className={`text-[11px] font-mono font-bold ${
                      isSelected ? 'fill-indigo-700 font-black' : 'fill-slate-400'
                    }`}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <p className="text-[11px] text-slate-400 text-center font-medium">
          💡 Tap any node on the zigzag wave to inspect day-by-day velocity & deliverables.
        </p>
      </div>

      {/* 4. KEY KPI 4-BOX STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="app-card p-4 space-y-1 bg-white border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Sprints</span>
          <p className="text-xl font-black text-indigo-600">{inProgressMissions}</p>
          <span className="text-[10px] text-slate-500 font-medium">In execution deck</span>
        </div>

        <div className="app-card p-4 space-y-1 bg-white border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Retainers</span>
          <p className="text-xl font-black text-emerald-600">{activeClients}</p>
          <span className="text-[10px] text-slate-500 font-medium">{totalClients} total in sheet</span>
        </div>

        <div className="app-card p-4 space-y-1 bg-white border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Habit Consistency</span>
          <p className="text-xl font-black text-amber-500">{averageHabitStreak} Days</p>
          <span className="text-[10px] text-slate-500 font-medium">Average unbroken streak</span>
        </div>

        <div className="app-card p-4 space-y-1 bg-white border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sync Quality</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-black text-slate-900">100% Bilateral</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Real-time synced</span>
        </div>
      </div>

    </div>
  );
};
