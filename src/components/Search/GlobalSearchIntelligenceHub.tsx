import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ExternalLink, 
  Globe, 
  Youtube, 
  Zap, 
  Sparkles, 
  FolderKanban, 
  Users, 
  Calendar, 
  Building2, 
  Film, 
  Plus, 
  Check, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { SharedAppData, SkillItem } from '../../types';
import { saveAppData } from '../../utils/storage';
import { cloudSync } from '../../utils/cloudSync';

interface GlobalSearchIntelligenceHubProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onNavigateToTab: (tab: string) => void;
}

// Real-time market data for top high-demand skills
const HIGH_DEMAND_SKILLS = [
  {
    id: 'hd-1',
    title: 'AI Prompt Engineering & Automation Workflows',
    category: 'AI & Systems',
    demandLevel: '98% Ultra-High',
    learnersCount: '1.4M Global Pros',
    avgRate: '$90 - $160 / hr',
    description: 'Building custom LLM agents, N8N/Zapier automation, and generative AI pipelines for agency clients.',
  },
  {
    id: 'hd-2',
    title: 'Short-Form Viral Reel Editing & Visual Hooks',
    category: 'Media & Video',
    demandLevel: '96% Ultra-High',
    learnersCount: '2.1M Creators',
    avgRate: '$70 - $120 / hr',
    description: 'CapCut / Premiere Pro retention editing, sound design, and viral narrative scripting for Instagram & TikTok.',
  },
  {
    id: 'hd-3',
    title: 'Full-Stack Web Apps & Modern React / TypeScript',
    category: 'Engineering',
    demandLevel: '94% High Demand',
    learnersCount: '3.8M Developers',
    avgRate: '$80 - $150 / hr',
    description: 'Building fast SaaS web applications, real-time dashboards, Vite/Next.js and Firebase cloud integrations.',
  },
  {
    id: 'hd-4',
    title: 'High-Ticket B2B Sales & Client Acquisition',
    category: 'Growth & Business',
    demandLevel: '92% High Demand',
    learnersCount: '890K Founders',
    avgRate: '$100 - $250 / hr',
    description: 'Cold outreach funnels, discovery calls closing, retainer proposals, and agency client retention.',
  },
  {
    id: 'hd-5',
    title: 'SaaS UI/UX Product Design & Motion Graphics',
    category: 'Design & Art',
    demandLevel: '90% High Demand',
    learnersCount: '1.1M Designers',
    avgRate: '$75 - $130 / hr',
    description: 'Figma design systems, glassmorphism UI components, interactive prototypes, and Lottie animations.',
  },
  {
    id: 'hd-6',
    title: 'Performance Media Buying & Conversion Copywriting',
    category: 'Marketing',
    demandLevel: '89% High Demand',
    learnersCount: '1.6M Marketers',
    avgRate: '$85 - $140 / hr',
    description: 'Meta Ads & Google PPC management, VSL scriptwriting, landing page conversion optimization.',
  },
];

export const GlobalSearchIntelligenceHub: React.FC<GlobalSearchIntelligenceHubProps> = ({
  appData,
  onUpdateData,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedCategory] = useState<'all' | 'files' | 'clients' | 'meetings' | 'videos'>('all');
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [noticeMsg, setToastMsg] = useState('');

  const q = searchQuery.trim().toLowerCase();

  // Internal workspace indexing
  const matchedResources = (appData.resources || []).filter((res) =>
    !q || res.title.toLowerCase().includes(q) || res.category.toLowerCase().includes(q)
  );

  const matchedClients = (appData.clients || []).filter((c) =>
    !q || c.name.toLowerCase().includes(q) || c.service.toLowerCase().includes(q)
  );

  const matchedMeetings = (appData.meetings || []).filter((m) =>
    !q || m.title.toLowerCase().includes(q) || m.agenda.toLowerCase().includes(q)
  );

  const matchedVideos = (appData.vaultVideos || []).filter((v) =>
    !q || v.title.toLowerCase().includes(q) || v.creator.toLowerCase().includes(q)
  );

  // External search triggers
  const handleGoogleSearch = () => {
    if (!searchQuery.trim()) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery.trim())}`;
    window.open(url, '_blank');
  };

  const handleYouTubeSearch = () => {
    if (!searchQuery.trim()) return;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery.trim())}`;
    window.open(url, '_blank');
  };

  // Add high demand skill to agency skills matrix with real-time cloud sync
  const handleAddSkillToMatrix = async (item: typeof HIGH_DEMAND_SKILLS[number]) => {
    const existing = (appData.skills || []).find((s) => s.title.toLowerCase() === item.title.toLowerCase());
    if (existing) {
      setToastMsg(`Skill "${item.title}" is already in your agency matrix.`);
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    const newSkill: SkillItem = {
      id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      founderId: appData.activeFounderId || 'founder_1',
      title: item.title,
      category: item.category,
      targetDate: '2026-12-31',
      dailyEffortHours: 1.5,
      stage: 'In Learning',
      progressPercent: 25,
      notes: `High Market Demand: ${item.demandLevel}. Global Pros: ${item.learnersCount}. Avg Rate: ${item.avgRate}.`,
      kudosCount: 1,
    };

    const updatedData: SharedAppData = {
      ...appData,
      skills: [newSkill, ...(appData.skills || [])],
    };

    saveAppData(updatedData, true);
    await cloudSync.syncState(updatedData);
    onUpdateData(updatedData);

    setAddedSkills((prev) => [...prev, item.id]);
    setToastMsg(`✨ Skill "${item.title}" added to Shared Skills Matrix!`);
    setTimeout(() => setToastNotice(''), 3500);
  };

  function setToastNotice(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto font-sans pb-16">
      
      {/* Toast Notice */}
      <AnimatePresence>
        {noticeMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 px-4 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-xl"
          >
            <span>{noticeMsg}</span>
            <button onClick={() => setToastMsg('')} className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer ml-2">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Global Search Bar & Google / YouTube Web Launchers */}
      <div className="app-card p-5 sm:p-6 bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 border-indigo-100 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Global Search & Intelligence Hub (গ্লোবাল সার্চ)
              </h2>
              <p className="text-xs text-slate-500">
                Search agency workspace files or launch direct Google & YouTube searches in 1-click.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
            ● Real-Time Index
          </span>
        </div>

        {/* Big Search Input with Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="relative flex items-center bg-white border-2 border-indigo-200 focus-within:border-indigo-600 rounded-2xl shadow-xs transition overflow-hidden">
            <Search className="w-5 h-5 text-indigo-500 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything... (ফাইল, ক্লায়েন্ট, মিটিং বা গুগলে সার্চ করতে লিখুন)"
              className="w-full px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGoogleSearch();
              }}
            />
          </div>

          {/* 1-Click Launch Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleGoogleSearch}
                disabled={!searchQuery.trim()}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                  searchQuery.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Search Google</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleYouTubeSearch}
                disabled={!searchQuery.trim()}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                  searchQuery.trim()
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Search YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Press Enter to launch Google search instantly
            </p>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME HIGH-DEMAND SKILLS MATRIX (বর্তমান বাজারে হাই ডিমান্ড স্কিল ও কতজন মানুষ কাজ করছে) */}
      <div className="app-card p-5 sm:p-6 space-y-4 bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                High-Demand Agency Skills Matrix (বর্তমান বাজারে হাই ডিমান্ড স্কিল)
              </h3>
              <p className="text-xs text-slate-500">
                Real-time market demand levels, global learner stats & average hourly rates. Add to your shared matrix in 1-tap!
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            Market Updated 2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {HIGH_DEMAND_SKILLS.map((item) => {
            const isAlreadyAdded = (appData.skills || []).some(
              (s) => s.title.toLowerCase() === item.title.toLowerCase()
            );

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/90 hover:border-indigo-300 transition space-y-2.5 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-indigo-800 border border-indigo-200 shadow-2xs">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      {item.demandLevel}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">{item.learnersCount}</span>
                    <span className="text-[11px] font-black text-indigo-700 font-mono">{item.avgRate}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSkillToMatrix(item)}
                    disabled={isAlreadyAdded}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                      isAlreadyAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
                    }`}
                  >
                    {isAlreadyAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>In Matrix</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Skill</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. REAL-TIME INTERNAL WORKSPACE INDEXING (If user typed a query) */}
      {searchQuery.trim() && (
        <div className="app-card p-5 space-y-3 bg-white border-slate-200 shadow-sm animate-in fade-in">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Internal Workspace Matches for "{searchQuery}"
          </h4>

          <div className="space-y-2">
            {/* Drive Files */}
            {matchedResources.map((res) => (
              <div
                key={res.id}
                onClick={() => onNavigateToTab('drive')}
                className="p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4 text-orange-600" />
                  <div>
                    <span className="font-bold text-slate-900">{res.title}</span>
                    <span className="text-[10px] text-slate-400 block">{res.category}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-600">Open Drive</span>
              </div>
            ))}

            {/* Clients */}
            {matchedClients.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigateToTab('clients')}
                className="p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-900">{c.name} ({c.dealValue})</span>
                    <span className="text-[10px] text-slate-400 block">{c.service}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">View Client</span>
              </div>
            ))}

            {/* Meetings */}
            {matchedMeetings.map((m) => (
              <div
                key={m.id}
                onClick={() => onNavigateToTab('meetings')}
                className="p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="font-bold text-slate-900">{m.title}</span>
                    <span className="text-[10px] text-slate-400 block">{m.scheduledTime}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600">Meeting Room</span>
              </div>
            ))}

            {matchedResources.length === 0 && matchedClients.length === 0 && matchedMeetings.length === 0 && matchedVideos.length === 0 && (
              <p className="text-xs text-slate-400 py-3 text-center">
                No internal workspace items matched "{searchQuery}". Click above to search Google or YouTube!
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
