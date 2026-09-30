import { SharedAppData, UserProfile, DriveFolder } from '../types';

const STORAGE_KEY = 'aimsh_clean_agency_v4';
const BACKUP_RECOVERY_KEY = 'aimsh_recovery_snapshot_v4';
const SYNC_CHANNEL_NAME = 'aimsh_sync_broadcast_v4';

// Fresh modern avatar options with diverse clean illustrations & portraits (Male & Female)
export interface AvatarItem {
  id: string;
  url: string;
  gender: 'male' | 'female';
  label: string;
}

export const AVATAR_SELECTIONS: AvatarItem[] = [
  // Male (ছেলে - Boy/Male Avatars)
  {
    id: 'male-1',
    label: 'Executive Partner (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-2',
    label: 'Creative Director (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-3',
    label: 'Tech Founder (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-4',
    label: 'Lead Developer (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-5',
    label: 'Modern Strategist (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-6',
    label: 'Agency Director (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-7',
    label: 'Growth Lead (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-8',
    label: 'Operations Head (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-9',
    label: 'Senior Consultant (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'male-10',
    label: 'Media Producer (Boy)',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=300&q=80',
  },

  // Female (মেয়ে - Girl/Female Avatars)
  {
    id: 'female-1',
    label: 'Creative Founder (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-2',
    label: 'Agency Strategist (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-3',
    label: 'Creative Designer (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-4',
    label: 'Chief Operations (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-5',
    label: 'Studio Founder (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-6',
    label: 'Client Director (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-7',
    label: 'Brand Stylist (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-8',
    label: 'Video & Art Lead (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-9',
    label: 'Product Architect (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'female-10',
    label: 'Marketing Lead (Girl)',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80',
  },
];

export const AVATAR_OPTIONS = AVATAR_SELECTIONS.map((a) => a.url);

// 100% Clean, Fresh Empty App State - Zero Hardcoded Dummy Items
export const FRESH_EMPTY_DATA: SharedAppData = {
  activeFounderId: '',
  partnerConnection: {
    partnerInviteCode: '',
    status: 'none',
    pairedUserId: '',
  },
  founders: {},
  missions: [],
  folders: [
    {
      id: 'f-1',
      name: 'Client Assets & Deliverables',
      color: 'orange',
      iconName: 'FolderLock',
      description: 'Active client materials, raw footage & deliverables',
    },
    {
      id: 'f-2',
      name: 'Video Vault & Reels',
      color: 'blue',
      iconName: 'Film',
      description: 'Study references, editing styles & hooks',
    },
    {
      id: 'f-3',
      name: 'Agency SOPs & Design',
      color: 'pink',
      iconName: 'FileSpreadsheet',
      description: 'Workflows, proposals & system templates',
    },
  ],
  resources: [],
  vaultVideos: [],
  mediaVideos: [],
  skills: [],
  brandingTasks: [],
  habits: [],
  meetings: [],
  clients: [],
  messages: [],
  partnerRequests: [],
  partnerStatuses: {},
  sharedScratchpad: '',
  scratchpadLastUpdated: new Date().toISOString(),
  lastSyncTimestamp: Date.now(),
};

// Security: XSS and Injection Sanitizer
function sanitizeInput(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

// Storage helper functions
export function loadAppData(): SharedAppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const explicitlyLoggedOut = localStorage.getItem('aimsh_logged_out') === 'true';

    if (!raw) {
      return FRESH_EMPTY_DATA;
    }

    const parsed = JSON.parse(raw);
    const founders = parsed.founders || {};
    const founderKeys = Object.keys(founders);

    // Prioritize tab-specific session user, then localStorage, then parsed data
    const sessionUserId = typeof window !== 'undefined' ? sessionStorage.getItem('aimsh_session_user_id') : null;
    const persistentId = localStorage.getItem('aimsh_active_founder_id');

    let activeFounderId = '';

    if (explicitlyLoggedOut) {
      activeFounderId = '';
    } else if (sessionUserId && founders[sessionUserId]) {
      activeFounderId = sessionUserId;
    } else if (persistentId && founders[persistentId]) {
      activeFounderId = persistentId;
    } else if (parsed.activeFounderId && founders[parsed.activeFounderId]) {
      activeFounderId = parsed.activeFounderId;
    } else if (founderKeys.length > 0) {
      activeFounderId = founderKeys[0];
    }

    if (activeFounderId && founders[activeFounderId]) {
      try {
        localStorage.setItem('aimsh_active_founder_id', activeFounderId);
        sessionStorage.setItem('aimsh_session_user_id', activeFounderId);
        localStorage.removeItem('aimsh_logged_out');
      } catch (err) {
        // ignore
      }
    }

    return {
      ...FRESH_EMPTY_DATA,
      ...parsed,
      activeFounderId,
      founders,
      agencySettings: parsed.agencySettings || undefined,
      missions: Array.isArray(parsed.missions) ? parsed.missions : [],
      folders: Array.isArray(parsed.folders) && parsed.folders.length ? parsed.folders : FRESH_EMPTY_DATA.folders,
      resources: Array.isArray(parsed.resources) ? parsed.resources : [],
      vaultVideos: Array.isArray(parsed.vaultVideos) ? parsed.vaultVideos : [],
      mediaVideos: Array.isArray(parsed.mediaVideos) ? parsed.mediaVideos : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      brandingTasks: Array.isArray(parsed.brandingTasks) ? parsed.brandingTasks : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      partnerRequests: Array.isArray(parsed.partnerRequests) ? parsed.partnerRequests : [],
      partnerStatuses: typeof parsed.partnerStatuses === 'object' && parsed.partnerStatuses ? parsed.partnerStatuses : {},
      partnerConnection: parsed.partnerConnection || FRESH_EMPTY_DATA.partnerConnection,
    };
  } catch (e) {
    console.error('Error loading app data from localStorage, recovering from shadow snapshot if available', e);
    const backup = localStorage.getItem(BACKUP_RECOVERY_KEY);
    if (backup) {
      try {
        return JSON.parse(backup);
      } catch (err) {
        // fallback
      }
    }
    return FRESH_EMPTY_DATA;
  }
}

export function saveAppData(data: SharedAppData, notifySync = true): void {
  try {
    const toSave: SharedAppData = {
      ...data,
      lastSyncTimestamp: Date.now(),
    };
    const serialized = JSON.stringify(toSave);
    
    // Save to primary storage
    localStorage.setItem(STORAGE_KEY, serialized);

    // Maintain recovery shadow snapshot for resilience
    try {
      localStorage.setItem(BACKUP_RECOVERY_KEY, serialized);
    } catch (e) {
      // quota safeguard
    }

    if (data.activeFounderId) {
      localStorage.setItem('aimsh_active_founder_id', data.activeFounderId);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('aimsh_session_user_id', data.activeFounderId);
      }
      localStorage.removeItem('aimsh_logged_out');
    }

    if (notifySync && typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
        bc.postMessage({ type: 'DATA_UPDATED', timestamp: toSave.lastSyncTimestamp });
        bc.close();
      } catch (err) {
        // fallback
      }

      window.dispatchEvent(new CustomEvent('aimsh-local-data-changed', { detail: toSave }));
    }
  } catch (e) {
    console.error('Error saving app data', e);
  }
}

// Subscribe to real-time updates across tabs and windows
export function subscribeToDataSync(callback: (newData: SharedAppData) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data?.type === 'DATA_UPDATED') {
        const current = loadAppData();
        callback(current);
      }
    };
  } catch (e) {
    // BroadcastChannel unsupported
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const updated = loadAppData();
        callback(updated);
      } catch (e) {
        // ignore
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  const handleCustom = () => {
    const updated = loadAppData();
    callback(updated);
  };
  window.addEventListener('aimsh-local-data-changed', handleCustom);

  return () => {
    if (bc) {
      bc.close();
    }
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('aimsh-local-data-changed', handleCustom);
  };
}

// Generate unique 4-character invite code
export function generateInviteCode(prefix = 'AIMSH'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

// Clear all data completely
export function resetToFreshData(): SharedAppData {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(BACKUP_RECOVERY_KEY);
  localStorage.removeItem('aimsh_active_founder_id');
  sessionStorage.removeItem('aimsh_session_user_id');
  saveAppData(FRESH_EMPTY_DATA, true);
  return FRESH_EMPTY_DATA;
}

// One-Time Instant Download / Full Agency Data Backup & Export
export function downloadOneTimeBackup(data: SharedAppData): { success: boolean; filename: string } {
  try {
    const exportBundle = {
      _meta: {
        app: 'AIMS.H Agency Workspace OS',
        version: '4.2.0',
        exportedAt: new Date().toISOString(),
        totalFounders: Object.keys(data.founders || {}).length,
        totalMissions: (data.missions || []).length,
        totalClients: (data.clients || []).length,
        totalResources: (data.resources || []).length,
        totalMeetings: (data.meetings || []).length,
        totalMessages: (data.messages || []).length,
      },
      ...data,
    };

    const formattedJson = JSON.stringify(exportBundle, null, 2);
    const blob = new Blob([formattedJson], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `aimsh-agency-backup-${dateStr}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true, filename };
  } catch (err) {
    console.error('Backup download failed', err);
    return { success: false, filename: '' };
  }
}

export function exportAppDataJson(data: SharedAppData): void {
  downloadOneTimeBackup(data);
}

export function importAppDataJson(jsonString: string): { success: boolean; data?: SharedAppData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON file structure.' };
    }

    // Clean and validate schema
    const restoredData: SharedAppData = {
      ...FRESH_EMPTY_DATA,
      ...parsed,
      founders: parsed.founders || {},
      agencySettings: parsed.agencySettings || undefined,
      missions: Array.isArray(parsed.missions) ? parsed.missions : [],
      folders: Array.isArray(parsed.folders) && parsed.folders.length ? parsed.folders : FRESH_EMPTY_DATA.folders,
      resources: Array.isArray(parsed.resources) ? parsed.resources : [],
      vaultVideos: Array.isArray(parsed.vaultVideos) ? parsed.vaultVideos : [],
      mediaVideos: Array.isArray(parsed.mediaVideos) ? parsed.mediaVideos : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      brandingTasks: Array.isArray(parsed.brandingTasks) ? parsed.brandingTasks : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      partnerRequests: Array.isArray(parsed.partnerRequests) ? parsed.partnerRequests : [],
      partnerStatuses: typeof parsed.partnerStatuses === 'object' && parsed.partnerStatuses ? parsed.partnerStatuses : {},
      partnerConnection: parsed.partnerConnection || FRESH_EMPTY_DATA.partnerConnection,
      lastSyncTimestamp: Date.now(),
    };

    saveAppData(restoredData, true);
    return { success: true, data: restoredData };
  } catch (e: any) {
    console.error('Import failed', e);
    return { success: false, error: e?.message || 'Corrupted file.' };
  }
}
