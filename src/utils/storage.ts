import { SharedAppData, UserProfile, DriveFolder } from '../types';

const STORAGE_KEY = 'aimsh_clean_light_hub_v3';
const SYNC_CHANNEL_NAME = 'aimsh_sync_broadcast';

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
    label: 'Executive Partner (Girl)',
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

// Clean, fresh empty app state - NO PRE-SET DATA
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
      color: '#6366f1',
      iconName: 'FolderLock',
      description: 'Active client materials, raw footage & deliverables',
    },
    {
      id: 'f-2',
      name: 'Inspiration & Video Vault',
      color: '#0284c7',
      iconName: 'Film',
      description: 'Study references, editing styles & hooks',
    },
    {
      id: 'f-3',
      name: 'Agency SOPs & Templates',
      color: '#059669',
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
  messages: [],
  partnerRequests: [],
  partnerStatuses: {},
  sharedScratchpad: '',
  scratchpadLastUpdated: new Date().toISOString(),
  lastSyncTimestamp: Date.now(),
};

// Storage helper functions
export function loadAppData(): SharedAppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const explicitlyLoggedOut = localStorage.getItem('aimsh_logged_out') === 'true';

    if (!raw) {
      saveAppData(FRESH_EMPTY_DATA, false);
      return FRESH_EMPTY_DATA;
    }
    const parsed = JSON.parse(raw);
    const founders = parsed.founders || {};
    const founderKeys = Object.keys(founders);

    let activeFounderId = parsed.activeFounderId;
    const persistentId = localStorage.getItem('aimsh_active_founder_id');

    // ONLY restore if user did NOT explicitly log out AND activeFounderId is valid or persistentId is valid
    if (explicitlyLoggedOut || parsed.activeFounderId === '') {
      activeFounderId = '';
    } else if (!activeFounderId || !founders[activeFounderId]) {
      if (persistentId && founders[persistentId]) {
        activeFounderId = persistentId;
      } else if (founderKeys.length > 0) {
        activeFounderId = founderKeys[0];
      }
    }

    if (activeFounderId && founders[activeFounderId]) {
      try {
        localStorage.setItem('aimsh_active_founder_id', activeFounderId);
        localStorage.removeItem('aimsh_logged_out');
      } catch (err) {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem('aimsh_active_founder_id');
      } catch (err) {
        // ignore
      }
    }

    return {
      ...FRESH_EMPTY_DATA,
      ...parsed,
      activeFounderId: activeFounderId || '',
      founders,
      missions: parsed.missions || [],
      folders: parsed.folders && parsed.folders.length ? parsed.folders : FRESH_EMPTY_DATA.folders,
      resources: parsed.resources || [],
      vaultVideos: parsed.vaultVideos || [],
      mediaVideos: parsed.mediaVideos || [],
      skills: parsed.skills || [],
      brandingTasks: parsed.brandingTasks || [],
      habits: parsed.habits || [],
      messages: parsed.messages || [],
      partnerRequests: parsed.partnerRequests || [],
      partnerStatuses: parsed.partnerStatuses || {},
    };
  } catch (e) {
    console.error('Error loading app data from localStorage', e);
    return FRESH_EMPTY_DATA;
  }
}

export function saveAppData(data: SharedAppData, notifySync = true): void {
  try {
    const toSave: SharedAppData = {
      ...data,
      lastSyncTimestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

    if (data.activeFounderId) {
      localStorage.setItem('aimsh_active_founder_id', data.activeFounderId);
      localStorage.removeItem('aimsh_logged_out');
    } else {
      localStorage.removeItem('aimsh_active_founder_id');
      localStorage.setItem('aimsh_logged_out', 'true');
    }

    if (notifySync && typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
        bc.postMessage({ type: 'DATA_UPDATED', timestamp: toSave.lastSyncTimestamp });
        bc.close();
      } catch (err) {
        // Fallback or ignore
      }

      window.dispatchEvent(new CustomEvent('aimsh-local-data-changed', { detail: toSave }));
    }
  } catch (e) {
    console.error('Error saving app data', e);
  }
}

// Subscribe to real-time updates across tabs and within page
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
        const updated = JSON.parse(event.newValue);
        callback(updated);
      } catch (e) {
        // ignore
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  const handleCustom = (event: Event) => {
    const customEvent = event as CustomEvent<SharedAppData>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
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

// Generate unique 6-character invite code
export function generateInviteCode(prefix = 'AIMSH'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

// Clear all data completely (reset to fresh start)
export function resetToFreshData(): SharedAppData {
  localStorage.removeItem(STORAGE_KEY);
  saveAppData(FRESH_EMPTY_DATA, true);
  return FRESH_EMPTY_DATA;
}

// Export / Import
export function exportAppDataJson(data: SharedAppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aimsh-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAppDataJson(jsonString: string): SharedAppData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.founders) {
      throw new Error('Invalid format');
    }
    saveAppData(parsed);
    return parsed;
  } catch (e) {
    console.error('Import failed', e);
    return null;
  }
}
