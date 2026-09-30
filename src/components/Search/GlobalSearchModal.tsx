import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  FolderKanban, 
  FileText, 
  ExternalLink, 
  Users, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  Building2, 
  Film, 
  Zap, 
  ArrowRight,
  Link,
  Clock,
  Briefcase
} from 'lucide-react';
import { SharedAppData } from '../../types';
import { BottomTabId } from '../BottomNavBar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: SharedAppData;
  onNavigateToTab: (tab: BottomTabId) => void;
}

type SearchCategory = 'all' | 'files' | 'clients' | 'missions' | 'meetings' | 'media' | 'messages';

interface SearchResultItem {
  id: string;
  category: 'file' | 'client' | 'mission' | 'meeting' | 'media' | 'message' | 'skill';
  title: string;
  subtitle: string;
  badge: string;
  targetTab: BottomTabId;
  url?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  appData,
  onNavigateToTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search indexing
  const q = query.trim().toLowerCase();

  const results: SearchResultItem[] = [];

  // 1. Files & Drive Resources
  (appData.resources || []).forEach((res) => {
    if (!q || res.title.toLowerCase().includes(q) || res.description.toLowerCase().includes(q) || res.category.toLowerCase().includes(q) || res.url.toLowerCase().includes(q)) {
      results.push({
        id: `res-${res.id}`,
        category: 'file',
        title: res.title,
        subtitle: res.description || res.url,
        badge: res.category || 'File / Resource',
        targetTab: 'drive',
        url: res.url,
      });
    }
  });

  // Folders
  (appData.folders || []).forEach((f) => {
    if (!q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
      results.push({
        id: `f-${f.id}`,
        category: 'file',
        title: f.name,
        subtitle: f.description,
        badge: 'Drive Folder',
        targetTab: 'drive',
      });
    }
  });

  // 2. Clients & Deals
  (appData.clients || []).forEach((c) => {
    if (!q || c.name.toLowerCase().includes(q) || c.service.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q) || c.dealValue.toLowerCase().includes(q)) {
      results.push({
        id: `client-${c.id}`,
        category: 'client',
        title: `${c.name} (${c.dealValue})`,
        subtitle: `${c.service} • ${c.nextAction}`,
        badge: c.status,
        targetTab: 'clients',
      });
    }
  });

  // 3. Missions & Tasks
  (appData.missions || []).forEach((m) => {
    if (!q || m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || (m.tags || []).some((t) => t.toLowerCase().includes(q))) {
      results.push({
        id: `m-${m.id}`,
        category: 'mission',
        title: m.title,
        subtitle: m.description || `Priority: ${m.priority}`,
        badge: m.status,
        targetTab: 'missions',
      });
    }
  });

  // 4. Meetings
  (appData.meetings || []).forEach((meet) => {
    if (!q || meet.title.toLowerCase().includes(q) || meet.agenda.toLowerCase().includes(q) || meet.scheduledTime.toLowerCase().includes(q)) {
      results.push({
        id: `meet-${meet.id}`,
        category: 'meeting',
        title: meet.title,
        subtitle: `${meet.scheduledTime} • ${meet.agenda.slice(0, 50)}...`,
        badge: meet.status,
        targetTab: 'meetings',
        url: meet.meetUrl,
      });
    }
  });

  // 5. Media & Videos
  (appData.vaultVideos || []).forEach((v) => {
    if (!q || v.title.toLowerCase().includes(q) || v.creator.toLowerCase().includes(q) || v.styleTag.toLowerCase().includes(q)) {
      results.push({
        id: `vault-${v.id}`,
        category: 'media',
        title: v.title,
        subtitle: `By ${v.creator} • ${v.styleTag}`,
        badge: 'Vault Reel',
        targetTab: 'media',
        url: v.videoUrl,
      });
    }
  });

  (appData.mediaVideos || []).forEach((mv) => {
    if (!q || mv.title.toLowerCase().includes(q) || mv.sector.toLowerCase().includes(q)) {
      results.push({
        id: `media-${mv.id}`,
        category: 'media',
        title: mv.title,
        subtitle: `${mv.platform} • ${mv.sector}`,
        badge: 'Media Hub',
        targetTab: 'media',
        url: mv.url,
      });
    }
  });

  // 6. Skills
  (appData.skills || []).forEach((sk) => {
    if (!q || sk.title.toLowerCase().includes(q) || sk.category.toLowerCase().includes(q) || sk.notes.toLowerCase().includes(q)) {
      results.push({
        id: `sk-${sk.id}`,
        category: 'skill',
        title: sk.title,
        subtitle: `${sk.category} • Stage: ${sk.stage} (${sk.progressPercent}%)`,
        badge: 'Skill Matrix',
        targetTab: 'skills',
      });
    }
  });

  // 7. Messages
  (appData.messages || []).forEach((msg) => {
    if (q && msg.content.toLowerCase().includes(q)) {
      results.push({
        id: `msg-${msg.id}`,
        category: 'message',
        title: msg.content,
        subtitle: `${msg.senderName} • ${msg.timestamp}`,
        badge: 'Chat Message',
        targetTab: 'search',
      });
    }
  });

  // Filter by category
  const filteredResults = results.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'files') return item.category === 'file';
    if (selectedCategory === 'clients') return item.category === 'client';
    if (selectedCategory === 'missions') return item.category === 'mission';
    if (selectedCategory === 'meetings') return item.category === 'meeting';
    if (selectedCategory === 'media') return item.category === 'media';
    if (selectedCategory === 'messages') return item.category === 'message';
    return true;
  });

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.url && item.category === 'file') {
      window.open(item.url, '_blank');
    }
    onNavigateToTab(item.targetTab);
    onClose();
  };

  const getCategoryIcon = (cat: SearchResultItem['category']) => {
    switch (cat) {
      case 'file':
        return <FolderKanban className="w-4 h-4 text-orange-600" />;
      case 'client':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'mission':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'media':
        return <Film className="w-4 h-4 text-rose-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'skill':
        return <Zap className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 font-sans">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Search Box Dialog */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col z-10"
          >
            {/* Input Bar */}
            <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-indigo-600 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files, clients, tasks, meetings, links, or messages... (সার্চ করুন)"
                className="w-full text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              {[
                { id: 'all', label: 'All Results' },
                { id: 'files', label: '📁 Files & Drive' },
                { id: 'clients', label: '🤝 Clients' },
                { id: 'missions', label: '🚀 Missions' },
                { id: 'meetings', label: '📅 Meetings' },
                { id: 'media', label: '🎬 Videos' },
                { id: 'messages', label: '💬 Messages' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as SearchCategory)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white font-black shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[220px]">
              {filteredResults.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Search className="w-6 h-6 stroke-1" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No matching items found</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Try typing the name of a file, client, meeting, video reel, or mission.
                  </p>
                </div>
              ) : (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 truncate leading-tight group-hover:text-indigo-700">
                            {item.title}
                          </h4>
                          <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-indigo-600 transition">
                      <span className="text-[10px] font-bold hidden sm:inline">Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Quick Search across entire agency workspace</span>
              <span className="font-mono font-bold text-slate-700">{filteredResults.length} Results</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
