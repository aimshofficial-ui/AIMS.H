import React, { useState } from 'react';
import { 
  FolderKanban, 
  Folder, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Star, 
  Trash2, 
  Film, 
  FolderLock, 
  FileSpreadsheet, 
  GraduationCap, 
  Cpu, 
  Search, 
  Play, 
  Sparkles,
  Layers,
  Clock,
  Video,
  FileText,
  Share2,
  Users,
  Eye,
  X,
  Palette,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DriveFolder, ResourceLink, CuratedVaultVideo, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';

interface DriveHubProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

// 3D Geometric Torus & Sphere SVG Art for Drive Cards
const Torus3DArt: React.FC<{ color?: string; size?: string }> = ({ color = 'orange', size = 'w-16 h-16' }) => {
  return (
    <svg className={`${size} opacity-85 select-none drop-shadow-md pointer-events-none`} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`drive3d-${color}`} cx="35%" cy="35%" r="65%">
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
        <radialGradient id={`sphereGrad-${color}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      
      {/* 3D Interlocking Torus Ring */}
      <circle cx="50" cy="50" r="32" stroke={`url(#drive3d-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      <circle cx="50" cy="50" r="32" stroke={`url(#sphereGrad-${color})`} strokeWidth="15" strokeLinecap="round" strokeDasharray="160 30" />
      
      {/* 3D Floating Accent Spheres */}
      <circle cx="72" cy="28" r="8" fill={`url(#drive3d-${color})`} />
      <circle cx="72" cy="28" r="8" fill={`url(#sphereGrad-${color})`} />
      <circle cx="28" cy="68" r="5" fill={`url(#drive3d-${color})`} />
    </svg>
  );
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  } catch (e) {
    return null;
  }
}

function isVideoResource(url: string, category: string): boolean {
  const lower = url.toLowerCase();
  const lowerCat = category.toLowerCase();
  return (
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('loom.com') ||
    lower.includes('vimeo.com') ||
    lower.endsWith('.mp4') ||
    lowerCat.includes('video')
  );
}

export const DriveHub: React.FC<DriveHubProps> = ({ appData, onUpdateData }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all'>('all');
  const [viewFilter, setViewFilter] = useState<'all' | 'mine' | 'partner'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlayerUrl, setActivePlayerUrl] = useState<{ title: string; url: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);

  // New Resource form state
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resFolder, setResFolder] = useState(appData.folders[0]?.id || 'f-1');
  const [resCategory, setResCategory] = useState('Google Drive');

  // New Folder form state
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [folderColor, setFolderColor] = useState('orange');

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const partnerUser = foundersList.find((f) => f.id !== activeUser.id);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (resId: string) => {
    const updatedRes = appData.resources.map((r) =>
      r.id === resId ? { ...r, isFavorite: !r.isFavorite } : r
    );
    const updated = { ...appData, resources: updatedRes };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleDeleteResource = (resId: string) => {
    const updatedRes = appData.resources.filter((r) => r.id !== resId);
    const updated = { ...appData, resources: updatedRes };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;

    const newRes: ResourceLink = {
      id: `r-${Date.now()}`,
      folderId: resFolder,
      title: resTitle.trim(),
      description: resDesc.trim(),
      url: resUrl.trim(),
      category: resCategory.trim() || 'Asset',
      authorId: activeUser.id,
      addedAt: new Date().toISOString().split('T')[0],
      isFavorite: false,
    };

    const updated = {
      ...appData,
      resources: [newRes, ...appData.resources],
    };
    saveAppData(updated);
    onUpdateData(updated);

    setResTitle('');
    setResDesc('');
    setResUrl('');
    setIsAddResourceOpen(false);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    const newFolder: DriveFolder = {
      id: `f-${Date.now()}`,
      name: folderName.trim(),
      description: folderDesc.trim(),
      color: folderColor,
      iconName: 'Folder',
    };

    const updated = {
      ...appData,
      folders: [...appData.folders, newFolder],
    };
    saveAppData(updated);
    onUpdateData(updated);

    setFolderName('');
    setFolderDesc('');
    setIsAddFolderOpen(false);
  };

  // Filter resources
  const filteredResources = appData.resources.filter((r) => {
    if (selectedFolderId !== 'all' && r.folderId !== selectedFolderId) return false;
    if (viewFilter === 'mine' && r.authorId !== activeUser.id) return false;
    if (viewFilter === 'partner') {
      if (partnerUser) {
        if (r.authorId !== partnerUser.id) return false;
      } else {
        if (r.authorId === activeUser.id) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const myResourceCount = appData.resources.filter((r) => r.authorId === activeUser.id).length;
  const partnerResourceCount = partnerUser
    ? appData.resources.filter((r) => r.authorId === partnerUser.id).length
    : appData.resources.filter((r) => r.authorId !== activeUser.id).length;

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      
      {/* 1. HERO BANNER: 3D Minimalist Shared Drive & Video Links Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-5 sm:p-6 shadow-xl shadow-indigo-500/20"
      >
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
          <Torus3DArt color="pink" size="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 border border-white/20 flex items-center gap-1.5">
              <Share2 className="w-3 h-3 text-amber-300" />
              Shared Agency Drive & Video Vault
            </span>

            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
              ● Live Partner Sync
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Every file & video link is automatically shared with your co-founder.
            </h2>
            <p className="text-xs text-indigo-100/90 mt-1 max-w-md">
              Google Drive links, YouTube review links, Loom walkthroughs, and client assets sync instantaneously across both devices.
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
                {partnerUser ? `Synced with ${partnerUser.name.split(' ')[0]}` : 'Dual Workspace Ready'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddFolderOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md border border-white/20"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>New Folder</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddResourceOpen(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-3" />
                <span>Add File / Video Link</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. FILTER & PERSPECTIVE TABS (All vs Mine vs Partner) */}
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
            <span>All Shared ({appData.resources.length})</span>
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
            <span>My Uploads ({myResourceCount})</span>
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
            <span>{partnerUser ? `${partnerUser.name.split(' ')[0]}'s Shared` : 'Partner Shared'} ({partnerResourceCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files or video links..."
            className="w-full app-input pl-8.5 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* 3. 3D PASTEL FOLDERS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedFolderId('all')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            selectedFolderId === 'all'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
              {appData.resources.length}
            </span>
          </div>
          <p className="text-xs font-black text-slate-900">All Folders</p>
          <p className="text-[10px] text-slate-500">Master repository</p>
        </button>

        {appData.folders.map((folder, idx) => {
          const count = appData.resources.filter((r) => r.folderId === folder.id).length;
          const isSelected = selectedFolderId === folder.id;
          
          // Rotating 3D Pastel Folder Theme
          const colorVariant = idx % 3 === 0 ? 'orange' : idx % 3 === 1 ? 'blue' : 'pink';
          const cardClass = 
            colorVariant === 'orange' ? 'card-pastel-orange' :
            colorVariant === 'blue' ? 'card-pastel-blue' : 'card-pastel-pink';

          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => setSelectedFolderId(folder.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${cardClass} ${
                isSelected ? 'ring-2 ring-indigo-600 shadow-md' : 'hover:shadow-sm'
              }`}
            >
              <div className="absolute right-0 top-0 pointer-events-none opacity-40">
                <Torus3DArt color={colorVariant} size="w-14 h-14" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-white/80 text-slate-800 flex items-center justify-center shadow-2xs">
                    <Folder className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                    {count} items
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 truncate">{folder.name}</p>
                <p className="text-[10px] text-slate-600 truncate">{folder.description || 'Shared folder'}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. SHARED FILES & VIDEO LINKS GRID (3D Minimalist Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shared Links & Media Assets ({filteredResources.length})</span>
          </h3>

          <span className="text-[11px] text-slate-500 font-semibold">
            Click Watch to view videos directly
          </span>
        </div>

        {filteredResources.length === 0 ? (
          <div className="app-card p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">No resources found in this view</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Drop Google Drive, YouTube, Loom, or Figma links to share immediately with your partner.
            </p>
            <button
              type="button"
              onClick={() => setIsAddResourceOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AnimatePresence mode="popLayout">
              {filteredResources.map((res, idx) => {
                const author = appData.founders[res.authorId] || (res.authorId === activeUser.id ? activeUser : partnerUser || activeUser);
                const isOwner = res.authorId === activeUser.id;
                const isCopied = copiedId === res.id;
                const isVideo = isVideoResource(res.url, res.category);

                // Rotating 3D Pastel Palette
                const colorVariant = idx % 3 === 0 ? 'orange' : idx % 3 === 1 ? 'blue' : 'pink';
                const cardClass = 
                  colorVariant === 'orange' ? 'card-pastel-orange' :
                  colorVariant === 'blue' ? 'card-pastel-blue' : 'card-pastel-pink';

                return (
                  <motion.div
                    key={res.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative overflow-hidden p-4 rounded-3xl ${cardClass} shadow-sm transition-all hover:shadow-md flex flex-col justify-between gap-3`}
                  >
                    {/* 3D Torus Accent in Card Corner */}
                    <div className="absolute right-2 top-3 pointer-events-none">
                      <Torus3DArt color={colorVariant} size="w-16 h-16" />
                    </div>

                    <div className="relative z-10 space-y-2 max-w-[80%]">
                      {/* Category & Owner Tag */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-slate-800 border border-slate-200/80 flex items-center gap-1">
                          {isVideo ? <Film className="w-3 h-3 text-rose-500" /> : <FileText className="w-3 h-3 text-indigo-500" />}
                          {res.category}
                        </span>

                        <div 
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-slate-700 border border-slate-200/80"
                          title={`Shared by ${author.name}`}
                        >
                          <img src={author.avatar} alt={author.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                          <span>{isOwner ? 'You' : author.name.split(' ')[0]}</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">{res.title}</h4>
                        {res.description ? (
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                            {res.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="relative z-10 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {/* If it's a video, provide In-App Player button */}
                        {isVideo && (
                          <button
                            type="button"
                            onClick={() => setActivePlayerUrl({ title: res.title, url: res.url })}
                            className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Watch</span>
                          </button>
                        )}

                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-[11px] flex items-center gap-1 border border-slate-200 transition cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                          <span>Open</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(res.url, res.id)}
                          className="p-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer"
                          title="Copy Link"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        </button>
                      </div>

                      {/* Favorite & Delete Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(res.id)}
                          className="p-1 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                          title="Favorite"
                        >
                          <Star className={`w-3.5 h-3.5 ${res.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                        </button>

                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* VIDEO PLAYER MODAL (Watch inside app) */}
      {activePlayerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 text-white space-y-3 p-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-black truncate">{activePlayerUrl.title}</h3>
              <button
                type="button"
                onClick={() => setActivePlayerUrl(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
              {getYouTubeEmbedUrl(activePlayerUrl.url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activePlayerUrl.url)!}
                  title={activePlayerUrl.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activePlayerUrl.url.endsWith('.mp4') ? (
                <video src={activePlayerUrl.url} controls autoPlay className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Film className="w-10 h-10 text-indigo-400" />
                  <p className="text-xs text-slate-300">
                    This video is hosted on an external provider (Loom / Drive / Vimeo).
                  </p>
                  <a
                    href={activePlayerUrl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in External Player
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ADD FILE / VIDEO LINK MODAL */}
      {isAddResourceOpen && (
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
                  <h3 className="text-base font-black text-slate-900">Add Shared File or Video</h3>
                  <p className="text-xs text-slate-500">Instantly visible & accessible to your partner.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddResourceOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  File / Video Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Agency Client Reel / Pitch Deck / Raw Footage"
                  className="w-full app-input px-3.5 py-2 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL / Video Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://youtube.com/..."
                  className="w-full app-input px-3.5 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Folder</label>
                  <select
                    value={resFolder}
                    onChange={(e) => setResFolder(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  >
                    {appData.folders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value)}
                    className="w-full app-input px-3 py-2 text-xs"
                  >
                    <option value="Google Drive">Google Drive</option>
                    <option value="YouTube Video">YouTube Video</option>
                    <option value="Loom Video">Loom Walkthrough</option>
                    <option value="Figma Design">Figma Design</option>
                    <option value="Canva Template">Canva Template</option>
                    <option value="PDF Document">PDF Document</option>
                    <option value="Client Asset">Client Asset</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  placeholder="Brief context for your partner..."
                  className="w-full app-input px-3 py-2 text-xs h-16 resize-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center gap-2 text-indigo-900 text-[11px] font-semibold">
                <Share2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Your partner will be able to watch or open this file directly.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddResourceOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Publish & Share
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ADD FOLDER MODAL */}
      {isAddFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="app-card w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Folder className="w-4 h-4 text-indigo-600" />
                New Shared Folder
              </h3>
              <button
                type="button"
                onClick={() => setIsAddFolderOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Folder Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Reels & Short Form"
                  className="w-full app-input px-3 py-2 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color Style</label>
                <div className="flex items-center gap-2">
                  {['orange', 'blue', 'pink', 'purple'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFolderColor(col)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold capitalize cursor-pointer ${
                        folderColor === col ? 'ring-2 ring-indigo-600 shadow-2xs' : 'opacity-70'
                      } ${
                        col === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        col === 'blue' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                        col === 'pink' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                        'bg-purple-100 text-purple-800 border-purple-200'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  placeholder="Purpose of this folder"
                  className="w-full app-input px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFolderOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
