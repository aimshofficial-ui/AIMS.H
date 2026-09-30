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
  Clock
} from 'lucide-react';
import { DriveFolder, ResourceLink, CuratedVaultVideo, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';

interface DriveHubProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Film,
  FolderLock,
  FileSpreadsheet,
  GraduationCap,
  Cpu,
  Folder,
};

export const DriveHub: React.FC<DriveHubProps> = ({ appData, onUpdateData }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'resources' | 'vault'>('resources');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [isAddVaultOpen, setIsAddVaultOpen] = useState(false);

  // New Resource form state
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resFolder, setResFolder] = useState(appData.folders[0]?.id || 'f-1');
  const [resCategory, setResCategory] = useState('Google Drive');

  // New Folder form state
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [folderColor, setFolderColor] = useState('#6366f1');
  const [folderIcon, setFolderIcon] = useState('Folder');

  // New Vault form state
  const [vaultTitle, setVaultTitle] = useState('');
  const [vaultStyle, setVaultStyle] = useState('Video Style Breakdown');
  const [vaultCreator, setVaultCreator] = useState('');
  const [vaultUrl, setVaultUrl] = useState('');
  const [vaultDuration, setVaultDuration] = useState('10:00');
  const [vaultBreakdown, setVaultBreakdown] = useState('');

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

  const handleDeleteVault = (vaultId: string) => {
    const updated = {
      ...appData,
      vaultVideos: appData.vaultVideos.filter((v) => v.id !== vaultId),
    };
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
      authorId: appData.activeFounderId,
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
      iconName: folderIcon,
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

  const handleCreateVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultTitle.trim() || !vaultUrl.trim()) return;

    const newVault: CuratedVaultVideo = {
      id: `v-${Date.now()}`,
      title: vaultTitle.trim(),
      styleTag: vaultStyle.trim(),
      creator: vaultCreator.trim() || 'Reference Creator',
      videoUrl: vaultUrl.trim(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
      duration: vaultDuration.trim() || '10:00',
      breakdown: vaultBreakdown.trim(),
    };

    const updated = {
      ...appData,
      vaultVideos: [newVault, ...appData.vaultVideos],
    };
    saveAppData(updated);
    onUpdateData(updated);

    setVaultTitle('');
    setVaultUrl('');
    setVaultBreakdown('');
    setIsAddVaultOpen(false);
  };

  const filteredResources = appData.resources.filter((r) => {
    if (selectedFolderId !== 'all' && r.folderId !== selectedFolderId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner Card */}
      <div className="app-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600" />
              Shared Drive & Asset Library Hub
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {appData.resources.length} Links Saved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Store Google Drive folders, Notion documents, Dropbox assets, and study videos in clean boxes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'resources' ? (
            <>
              <button
                onClick={() => setIsAddFolderOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Folder
              </button>
              <button
                onClick={() => setIsAddResourceOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add Resource Link
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAddVaultOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Vault Reference
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Pill */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 w-fit text-xs">
        <button
          onClick={() => setActiveSubTab('resources')}
          className={`px-3.5 py-1.5 font-bold rounded-lg transition flex items-center gap-2 ${
            activeSubTab === 'resources'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Drive & Asset Manager ({appData.resources.length})
        </button>
        <button
          onClick={() => setActiveSubTab('vault')}
          className={`px-3.5 py-1.5 font-bold rounded-lg transition flex items-center gap-2 ${
            activeSubTab === 'vault'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          Video Reference Vault ({appData.vaultVideos.length})
        </button>
      </div>

      {activeSubTab === 'resources' ? (
        <>
          {/* Folders Row */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setSelectedFolderId('all')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition space-y-1.5 ${
                  selectedFolderId === 'all'
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                    <Folder className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    {appData.resources.length}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">All Resources</h4>
                <p className="text-[10px] text-slate-500 truncate">Entire agency repository</p>
              </div>

              {appData.folders.map((folder) => {
                const FolderIconComponent = ICON_MAP[folder.iconName] || Folder;
                const isSelected = selectedFolderId === folder.id;
                const count = appData.resources.filter((r) => r.folderId === folder.id).length;

                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition space-y-1.5 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="p-2 rounded-xl"
                        style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
                      >
                        <FolderIconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-600">{count}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{folder.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{folder.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search bar */}
          {appData.resources.length > 0 && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-500">
                Showing <strong className="text-slate-800">{filteredResources.length}</strong> items
              </div>
              <div className="w-full sm:w-60">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved links..."
                  className="w-full px-3 py-1.5 rounded-lg app-input text-xs"
                />
              </div>
            </div>
          )}

          {/* Empty state when 0 resources */}
          {appData.resources.length === 0 ? (
            <div className="app-card p-10 text-center space-y-4 border-dashed border-2 border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <FolderKanban className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Your Asset Library is Clean & Ready</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Save your shared Google Drive folders, client deliverables, Notion databases, or Figma links here.
                </p>
              </div>
              <button
                onClick={() => setIsAddResourceOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add First Resource Link
              </button>
            </div>
          ) : (
            /* Resource Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredResources.map((res) => {
                const parentFolder = appData.folders.find((f) => f.id === res.folderId);

                return (
                  <div
                    key={res.id}
                    className="app-card p-4 space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold"
                          style={{
                            backgroundColor: parentFolder ? `${parentFolder.color}15` : '#f1f5f9',
                            color: parentFolder ? parentFolder.color : '#475569',
                          }}
                        >
                          {parentFolder ? parentFolder.name : res.category}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(res.id)}
                            className="p-1 rounded text-slate-400 hover:text-amber-500 transition"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                res.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</h4>
                      {res.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {res.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[10px] font-mono text-slate-500 truncate bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {res.url}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{res.addedAt}</span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyLink(res.url, res.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="Copy URL"
                          >
                            {copiedId === res.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Video Vault Section */
        <div className="space-y-4">
          {appData.vaultVideos.length === 0 ? (
            <div className="app-card p-10 text-center space-y-4 border-dashed border-2 border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <Film className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Video Vault is Clean & Fresh</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add benchmark video editing styles, motion design trends, and retention breakdowns to study together.
                </p>
              </div>
              <button
                onClick={() => setIsAddVaultOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add First Reference Style
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {appData.vaultVideos.map((video) => (
                <div
                  key={video.id}
                  className="app-card rounded-2xl overflow-hidden space-y-3 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                        {video.styleTag}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{video.duration}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{video.title}</h4>
                    <p className="text-xs text-slate-500">{video.creator}</p>
                    
                    {video.breakdown && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                        {video.breakdown}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteVault(video.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Delete reference"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      Watch Reference <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Resource Modal */}
      {isAddResourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-800 shadow-2xl relative border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Add Resource Link
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Save Google Drive folders, Dropbox links, Notion boards, or assets.
            </p>

            <form onSubmit={handleCreateResource} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Master Proposal Deck & Case Studies"
                  className="w-full px-3.5 py-2.5 text-xs app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full px-3.5 py-2.5 text-xs app-input font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign to Folder
                  </label>
                  <select
                    value={resFolder}
                    onChange={(e) => setResFolder(e.target.value)}
                    className="w-full px-3 py-2 text-xs app-input"
                  >
                    {appData.folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value)}
                    placeholder="Drive, Notion, Asset"
                    className="w-full px-3 py-2 text-xs app-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Access Description
                </label>
                <textarea
                  rows={2}
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  placeholder="Contains high-res client deliverables and assets..."
                  className="w-full px-3 py-2 text-xs app-input resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddResourceOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {isAddFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-800 shadow-2xl relative border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Folder</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new bucket to categorize your resources.</p>

            <form onSubmit={handleCreateFolder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Sales Funnels & Cold DMs"
                  className="w-full px-3.5 py-2.5 text-xs app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  placeholder="Short note on what goes in here"
                  className="w-full px-3.5 py-2 text-xs app-input"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFolderOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vault Reference Modal */}
      {isAddVaultOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-800 shadow-2xl relative border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Vault Reference</h3>
            <p className="text-xs text-slate-500 mb-4">Save reference editing styles or timelines.</p>

            <form onSubmit={handleCreateVault} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={vaultTitle}
                  onChange={(e) => setVaultTitle(e.target.value)}
                  placeholder="e.g. Vox Kinetic Graphics Style"
                  className="w-full px-3.5 py-2 text-xs app-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Video URL *</label>
                <input
                  type="url"
                  required
                  value={vaultUrl}
                  onChange={(e) => setVaultUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 text-xs app-input font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVaultOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
                >
                  Save Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
