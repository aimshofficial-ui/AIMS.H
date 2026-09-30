import React, { useState } from 'react';
import { 
  Tv, 
  Plus, 
  Youtube, 
  Instagram, 
  Video, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  ListPlus, 
  Maximize2,
  X,
  Play,
  Film,
  Users,
  Search,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaVideoItem, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';

interface SmartMediaHubProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

// 3D Geometric Torus & Sphere SVG Art
const Torus3DArt: React.FC<{ color?: string; size?: string }> = ({ color = 'orange', size = 'w-16 h-16' }) => {
  return (
    <svg className={`${size} opacity-85 select-none drop-shadow-md pointer-events-none`} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`media3d-${color}`} cx="35%" cy="35%" r="65%">
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
        <radialGradient id={`mediaSphere-${color}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      
      <circle cx="50" cy="50" r="32" stroke={`url(#media3d-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="50" cy="50" r="32" stroke={`url(#mediaSphere-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="72" cy="28" r="8" fill={`url(#media3d-${color})`} />
      <circle cx="72" cy="28" r="8" fill={`url(#mediaSphere-${color})`} />
      <circle cx="28" cy="68" r="5" fill={`url(#media3d-${color})`} />
    </svg>
  );
};

function getYouTubeVideoId(url: string): string | null {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  } catch (e) {
    return null;
  }
}

function detectPlatform(url: string): MediaVideoItem['platform'] {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  return 'other';
}

export const SmartMediaHub: React.FC<SmartMediaHubProps> = ({ appData, onUpdateData }) => {
  const [selectedSector, setSelectedSector] = useState<string | 'all'>('all');
  const [viewFilter, setViewFilter] = useState<'all' | 'mine' | 'partner'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePlayerVideo, setActivePlayerVideo] = useState<MediaVideoItem | null>(null);
  const [editingNoteVideoId, setEditingNoteVideoId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // New Video Form State
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoSector, setVideoSector] = useState<MediaVideoItem['sector']>('Agency Growth');
  const [initialNotes, setInitialNotes] = useState('');

  const sectors: MediaVideoItem['sector'][] = [
    'IT Sector',
    'AI Tools',
    'Marketing',
    'Agency Growth',
    'Creative & Design',
  ];

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const partnerUser = foundersList.find((f) => f.id !== activeUser.id);

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;

    const notes = initialNotes
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    const platform = detectPlatform(videoUrl.trim());

    const newVideo: MediaVideoItem = {
      id: `mv-${Date.now()}`,
      title: videoTitle.trim(),
      url: videoUrl.trim(),
      platform,
      sector: videoSector,
      addedBy: activeUser.name,
      addedAt: new Date().toISOString().split('T')[0],
      actionableNotes: notes.length ? notes : ['Key hook and pacing takeaway.'],
    };

    const updated = {
      ...appData,
      mediaVideos: [newVideo, ...appData.mediaVideos],
    };
    saveAppData(updated);
    onUpdateData(updated);

    setVideoTitle('');
    setVideoUrl('');
    setInitialNotes('');
    setIsAddModalOpen(false);
  };

  const handleDeleteVideo = (videoId: string) => {
    const updatedList = appData.mediaVideos.filter((v) => v.id !== videoId);
    const updated = { ...appData, mediaVideos: updatedList };
    saveAppData(updated);
    onUpdateData(updated);
    if (activePlayerVideo?.id === videoId) {
      setActivePlayerVideo(null);
    }
  };

  const handleAddNoteToVideo = (videoId: string) => {
    if (!newNoteText.trim()) return;
    const updatedList = appData.mediaVideos.map((v) => {
      if (v.id !== videoId) return v;
      return {
        ...v,
        actionableNotes: [...v.actionableNotes, newNoteText.trim()],
      };
    });
    const updated = { ...appData, mediaVideos: updatedList };
    saveAppData(updated);
    onUpdateData(updated);

    setNewNoteText('');
    setEditingNoteVideoId(null);
  };

  const filteredVideos = appData.mediaVideos.filter((v) => {
    if (selectedSector !== 'all' && v.sector !== selectedSector) return false;
    if (viewFilter === 'mine' && v.addedBy !== activeUser.name) return false;
    if (viewFilter === 'partner') {
      if (partnerUser) {
        if (v.addedBy !== partnerUser.name) return false;
      } else {
        if (v.addedBy === activeUser.name) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.url.toLowerCase().includes(q) ||
        v.sector.toLowerCase().includes(q) ||
        v.actionableNotes.some((n) => n.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans pb-12">
      
      {/* 1. HERO BANNER: 3D Minimalist Video & Media Vault */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-700 to-indigo-900 text-white p-5 sm:p-6 shadow-xl shadow-indigo-500/20"
      >
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
          <Torus3DArt color="pink" size="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 border border-white/20 flex items-center gap-1.5">
              <Tv className="w-3 h-3 text-amber-300" />
              Co-Founder Video Hub & Smart Player
            </span>

            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
              ● Live Synced Video Vault
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Share, watch & break down high-ticket videos together.
            </h2>
            <p className="text-xs text-indigo-100/90 mt-1 max-w-md">
              Embed YouTube videos, Reels, and client walkthroughs directly inside the hub with actionable timestamp notes.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-2">
                <img src={activeUser.avatar} alt="You" className="w-8 h-8 rounded-full border-2 border-indigo-700 object-cover" />
                {partnerUser && (
                  <img src={partnerUser.avatar} alt="Partner" className="w-8 h-8 rounded-full border-2 border-indigo-700 object-cover" />
                )}
              </div>
              <span className="text-xs font-bold text-indigo-200">
                {partnerUser ? `Shared with ${partnerUser.name.split(' ')[0]}` : 'Dual Access Active'}
              </span>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-3" />
              <span>Add Video Link</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. FILTER & PERSPECTIVE TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
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
            <span>All Videos ({appData.mediaVideos.length})</span>
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
            <span>My Shares</span>
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
            <span>{partnerUser ? `${partnerUser.name.split(' ')[0]}'s Shares` : 'Partner Shares'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search video titles or notes..."
            className="w-full app-input pl-8.5 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* 3. SECTOR PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedSector('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
            selectedSector === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          All Sectors ({appData.mediaVideos.length})
        </button>
        {sectors.map((sec) => {
          const count = appData.mediaVideos.filter((v) => v.sector === sec).length;
          return (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                selectedSector === sec
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {sec} ({count})
            </button>
          );
        })}
      </div>

      {/* 4. THEATER PLAYER VIEW (When a video is playing) */}
      {activePlayerVideo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="app-card p-4 space-y-3 border-indigo-200 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 truncate flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              Now Playing: {activePlayerVideo.title}
            </h4>
            <button
              onClick={() => setActivePlayerVideo(null)}
              className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
            {getYouTubeVideoId(activePlayerVideo.url) ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(activePlayerVideo.url)}?autoplay=1&rel=0`}
                title={activePlayerVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-2">
                <Video className="w-10 h-10 text-indigo-400" />
                <p className="text-xs">Social Video Link ({activePlayerVideo.platform})</p>
                <a
                  href={activePlayerVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Open in Video App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 5. 3D PASTEL VIDEO CARDS GRID */}
      {filteredVideos.length === 0 ? (
        <div className="app-card p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Tv className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-slate-900">No videos saved yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save YouTube or social video links to watch and share actionable takeaways with your partner.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Video Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video, idx) => {
              const youtubeId = getYouTubeVideoId(video.url);
              const isPlaying = activePlayerVideo?.id === video.id;

              // Rotating 3D Pastel Palette
              const colorVariant = idx % 3 === 0 ? 'orange' : idx % 3 === 1 ? 'blue' : 'pink';
              const cardClass = 
                colorVariant === 'orange' ? 'card-pastel-orange' :
                colorVariant === 'blue' ? 'card-pastel-blue' : 'card-pastel-pink';

              return (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative overflow-hidden p-4 rounded-3xl ${cardClass} shadow-sm transition-all hover:shadow-md space-y-3`}
                >
                  <div className="absolute right-2 top-2 pointer-events-none">
                    <Torus3DArt color={colorVariant} size="w-16 h-16" />
                  </div>

                  {/* Top Bar */}
                  <div className="relative z-10 flex items-start justify-between gap-2 max-w-[80%]">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-slate-800 border border-slate-200">
                          {video.sector}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200">
                          Shared by {video.addedBy}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{video.title}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                      title="Delete video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Video Thumbnail / In-App Play button */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-2xs group">
                    {youtubeId ? (
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
                        <Video className="w-8 h-8 text-indigo-400 mb-1" />
                        <span className="text-[11px] font-bold text-slate-300 capitalize">{video.platform} Link</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setActivePlayerVideo(video)}
                      className="absolute inset-0 bg-black/35 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
                      </div>
                    </button>
                  </div>

                  {/* Actionable Agency Takeaways */}
                  <div className="space-y-1 bg-white/80 p-2.5 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-black uppercase text-slate-600 block">
                      Key Takeaways:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {video.actionableNotes.map((note, nIdx) => (
                        <li key={nIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-indigo-600 font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Original Link</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setActivePlayerVideo(video)}
                      className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                    >
                      Watch Video
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ADD VIDEO MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="app-card w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-3" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Video Link</h3>
                  <p className="text-xs text-slate-500">Shared directly with your co-founder.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Iman Gadzhi Agency Breakdown / High-Hook Reel"
                  className="w-full app-input px-3.5 py-2 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video URL (YouTube, Reels, TikTok, Loom) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full app-input px-3.5 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sector</label>
                <select
                  value={videoSector}
                  onChange={(e) => setVideoSector(e.target.value as MediaVideoItem['sector'])}
                  className="w-full app-input px-3 py-2 text-xs"
                >
                  {sectors.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Takeaways / Bullet Notes (One per line)
                </label>
                <textarea
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  placeholder="00:15 - Fast pacing hook&#10;01:30 - Client pitch script"
                  className="w-full app-input px-3.5 py-2 text-xs h-20 resize-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center gap-2 text-indigo-900 text-[11px] font-semibold">
                <Share2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Both you and your partner can watch this video inside the app.</span>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Save & Share Video
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
