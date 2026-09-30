import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Users, 
  Zap, 
  Flame, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { SharedAppData } from '../../types';

interface ZigzagAnalyticsTabProps {
  appData: SharedAppData;
}

export const ZigzagAnalyticsTab: React.FC<ZigzagAnalyticsTabProps> = ({ appData }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');

  const totalMissions = appData.missions.length;
  const completedMissions = appData.missions.filter((m) => m.status === 'Completed').length;
  const inProgressMissions = appData.missions.filter((m) => m.status === 'In Progress').length;
  const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  const totalHabits = appData.habits.length;
  const averageHabitStreak = totalHabits > 0 
    ? Math.round(appData.habits.reduce((acc, h) => acc + (h.streakCount || 0), 0) / totalHabits) 
    : 0;

  // Generate dynamic data points for the zigzag motion wave
  const dataPointsMap: Record<'7d' | '14d' | '30d', { label: string; value: number }[]> = {
    '7d': [
      { label: 'Mon', value: 20 },
      { label: 'Tue', value: 75 },
      { label: 'Wed', value: 40 },
      { label: 'Thu', value: 90 },
      { label: 'Fri', value: 55 },
      { label: 'Sat', value: 95 },
      { label: 'Sun', value: 70 },
    ],
    '14d': [
      { label: 'D1', value: 25 },
      { label: 'D3', value: 80 },
      { label: 'D5', value: 35 },
      { label: 'D7', value: 90 },
      { label: 'D9', value: 50 },
      { label: 'D11', value: 95 },
      { label: 'D14', value: 85 },
    ],
    '30d': [
      { label: 'W1', value: 30 },
      { label: 'W2', value: 85 },
      { label: 'W3', value: 45 },
      { label: 'W4', value: 100 },
      { label: 'W5', value: 75 },
    ],
  };

  const points = dataPointsMap[timeRange];
  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const stepX = (width - paddingX * 2) / (points.length - 1);
  const minVal = 0;
  const maxVal = 100;

  // Calculate coordinates for SVG zigzag line
  const coordinates = points.map((p, idx) => {
    const x = paddingX + idx * stepX;
    const y = height - paddingY - ((p.value - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, label: p.label, value: p.value };
  });

  const zigzagPath = coordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${zigzagPath} L ${coordinates[coordinates.length - 1].x} ${height} L ${coordinates[0].x} ${height} Z`;

  const foundersList = Object.values(appData.founders);

  return (
    <div className="space-y-4">
      
      {/* Header Card */}
      <div className="app-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Agency Motion Analytics & Velocity
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              Live Wave
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time execution velocity, zigzag momentum graph & co-founder productivity.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
          {(['7d', '14d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg transition uppercase text-[11px] ${
                timeRange === r
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Zigzag Velocity Wave Chart Card */}
      <div className="app-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Momentum Curve
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-black text-slate-900">
                {completionRate}%
              </h3>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> High Leverage
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total Missions</span>
            <p className="text-sm font-bold text-slate-800">{completedMissions} of {totalMissions} Done</p>
          </div>
        </div>

        {/* SVG Zigzag Graph */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 sm:h-52 overflow-visible"
          >
            <defs>
              <linearGradient id="zigzagGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal grid lines */}
            {[0.25, 0.5, 0.75].map((pct, idx) => (
              <line
                key={idx}
                x1={paddingX}
                y1={height * pct}
                x2={width - paddingX}
                y2={height * pct}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Area Fill */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              d={areaPath}
              fill="url(#zigzagGradient)"
            />

            {/* Zigzag Motion Path */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              d={zigzagPath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Zigzag Coordinate Points */}
            {coordinates.map((pt, i) => (
              <g key={i}>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  className="cursor-pointer hover:r-6 transition-all"
                />

                <text
                  x={pt.x}
                  y={height - 5}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-slate-400 font-semibold"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* KPI 3-Box Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="app-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active In-Progress</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-black text-slate-900">{inProgressMissions}</p>
          <span className="text-[11px] text-slate-500 font-medium">Currently on Kanban deck</span>
        </div>

        <div className="app-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Habit Consistency</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-900">{averageHabitStreak} Days</p>
          <span className="text-[11px] text-slate-500 font-medium">Average unbroken streak</span>
        </div>

        <div className="app-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Skills Tracked</span>
            <Zap className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-xl font-black text-slate-900">{appData.skills.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Agency mastery points</span>
        </div>
      </div>

      {/* Co-Founder Workload Breakdown Card */}
      <div className="app-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Partner Workload Split
        </h4>

        <div className="space-y-3">
          {foundersList.map((f) => {
            const assignedMissions = appData.missions.filter((m) => m.assignee === f.id || m.assignee === 'both');
            const doneMissions = assignedMissions.filter((m) => m.status === 'Completed').length;
            const pct = assignedMissions.length > 0 ? Math.round((doneMissions / assignedMissions.length) * 100) : 0;

            return (
              <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={f.avatar} alt={f.name} className="w-6 h-6 rounded-lg object-cover" />
                    <span className="text-xs font-bold text-slate-800">{f.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600">{doneMissions}/{assignedMissions.length} ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
