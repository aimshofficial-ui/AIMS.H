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
  X
} from 'lucide-react';
import { MediaVideoItem, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';

interface SmartMediaHubProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

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

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;

    const notes = initialNotes
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    const platform = detectPlatform(videoUrl.trim());
    const author = appData.founders[appData.activeFounderId] || { name: 'Founder' };

    const newVideo: MediaVideoItem = {
      id: `mv-${Date.now()}`,
      title: videoTitle.trim(),
      url: videoUrl.trim(),
      platform,
      sector: videoSector,
      addedBy: author.name,
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

  const handleDeleteNote = (videoId: string, noteIndex: number) => {
    const updatedList = appData.mediaVideos.map((v) => {
      if (v.id !== videoId) return v;
      return {
        ...v,
        actionableNotes: v.actionableNotes.filter((_, idx) => idx !== noteIndex),
      };
    });
    const updated = { ...appData, mediaVideos: updatedList };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const filteredVideos = appData.mediaVideos.filter((v) => {
    if (selectedSector !== 'all' && v.sector !== selectedSector) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner Card */}
      <div className="app-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Tv className="w-5 h-5 text-indigo-600" />
              Smart Media Hub & Native Player
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              YouTube • Reels • TikTok
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Embed YouTube videos directly, bookmark Reels, and log bullet-point agency takeaways.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Quick Add Video Link
        </button>
      </div>

      {/* Sector Category Filters */}
      {appData.mediaVideos.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedSector('all')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
              selectedSector === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
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
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedSector === sec
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Spotlight Theater Player if clicked */}
      {activePlayerVideo && (
        <div className="app-card p-4 space-y-3 shadow-md border-indigo-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              Now Playing: {activePlayerVideo.title}
            </h4>
            <button
              onClick={() => setActivePlayerVideo(null)}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-sm">
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
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {appData.mediaVideos.length === 0 ? (
        <div className="app-card p-10 text-center space-y-4 border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Tv className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Your Media Library is Clean & Ready</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save study videos from YouTube, Instagram Reels, or TikTok with actionable execution notes for your agency.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add First Video Link
          </button>
        </div>
      ) : (
        /* Video Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVideos.map((video) => {
            const ytId = getYouTubeVideoId(video.url);

            return (
              <div
                key={video.id}
                className="app-card rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Player Embed */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    {ytId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                        title={video.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-800 text-white space-y-2">
                        <Video className="w-8 h-8 text-indigo-400" />
                        <span className="text-xs font-semibold">{video.platform.toUpperCase()}</span>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-300 underline flex items-center gap-1 font-mono"
                        >
                          Watch on {video.platform} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Details & Notes */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {video.sector}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                          {video.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Actionable Notes */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" /> Actionable Notes:
                        </span>
                        <button
                          onClick={() => setEditingNoteVideoId(editingNoteVideoId === video.id ? null : video.id)}
                          className="text-[10px] text-indigo-600 hover:underline font-semibold"
                        >
                          + Add Note
                        </button>
                      </div>

                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {video.actionableNotes.map((note, idx) => (
                          <li key={idx} className="flex items-start justify-between gap-1 group/note">
                            <span className="leading-snug">• {note}</span>
                            <button
                              onClick={() => handleDeleteNote(video.id, idx)}
                              className="opacity-0 group-hover/note:opacity-100 text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>

                      {editingNoteVideoId === video.id && (
                        <div className="pt-1.5 flex items-center gap-1.5 border-t border-slate-200">
                          <input
                            type="text"
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Add takeaway..."
                            className="flex-1 px-2 py-1 text-xs app-input"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddNoteToVideo(video.id);
                            }}
                          />
                          <button
                            onClick={() => handleAddNoteToVideo(video.id)}
                            className="px-2 py-1 rounded bg-indigo-600 text-white font-bold text-xs"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Saved by {video.addedBy}</span>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Open Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Video Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-800 shadow-2xl relative border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Tv className="w-5 h-5 text-indigo-600" />
              Add Video Reference
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste YouTube or social video link with study takeaways.
            </p>

            <form onSubmit={handleAddVideo} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Iman Gadzhi Agency Masterclass"
                  className="w-full px-3.5 py-2.5 text-xs app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL (YouTube / Reel / TikTok) *</label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 text-xs app-input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Sector</label>
                <select
                  value={videoSector}
                  onChange={(e) => setVideoSector(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs app-input"
                >
                  {sectors.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Actionable Notes (1 per line)</label>
                <textarea
                  rows={2}
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  placeholder="Analyze hook pacing&#10;Implement 3-tier pricing"
                  className="w-full px-3.5 py-2 text-xs app-input resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
                >
                  Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
