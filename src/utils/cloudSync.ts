import { SharedAppData, UserProfile, PartnerRequest, AppNotification } from '../types';
import { saveAppData, loadAppData } from './storage';
import { db, doc, onSnapshot, setDoc, getDoc, collection, query, where, getDocs, updateDoc, addDoc } from '../firebase';

type SyncCallback = (data: SharedAppData) => void;

function sanitizeForFirestore<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (value === undefined ? null : value))
  );
}

class CloudSyncManager {
  private eventSource: EventSource | null = null;
  private listeners: Set<SyncCallback> = new Set();
  private unsubFirestore: (() => void) | null = null;

  public init(onDataUpdated: SyncCallback) {
    this.listeners.add(onDataUpdated);
    this.connectSSE();
    this.connectFirestore();
  }

  public subscribe(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(data: SharedAppData) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in sync listener', err);
      }
    });
  }

  // Connect to Firebase Firestore real-time doc listener
  private connectFirestore() {
    try {
      const docRef = doc(db, 'workspace', 'shared_state');
      this.unsubFirestore = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as SharedAppData;
          const currentLocal = loadAppData();

          const merged: SharedAppData = {
            ...cloudData,
            activeFounderId: currentLocal.activeFounderId || cloudData.activeFounderId || '',
            founders: {
              ...(currentLocal.founders || {}),
              ...(cloudData.founders || {}),
            },
          };

          saveAppData(merged, false);
          this.notify(merged);
        }
      }, (err) => {
        console.warn('Firestore onSnapshot listener fallback', err);
      });
    } catch (e) {
      console.error('Firestore init error', e);
    }
  }

  // Connect to Express Server-Sent Events (SSE)
  private connectSSE() {
    if (typeof window === 'undefined') return;
    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INITIAL_STATE' || payload.type === 'DATA_SYNC') {
            const serverData: SharedAppData = payload.data;
            const currentLocal = loadAppData();

            const merged: SharedAppData = {
              ...serverData,
              activeFounderId: currentLocal.activeFounderId || serverData.activeFounderId || '',
            };

            saveAppData(merged, false);
            this.notify(merged);
          }
        } catch (e) {
          // ignore
        }
      };

      this.eventSource.onerror = () => {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        setTimeout(() => this.connectSSE(), 4000);
      };
    } catch (err) {
      // fallback
    }
  }

  // Register real user to Firestore & server
  public async registerUser(profile: UserProfile): Promise<void> {
    try {
      // Save to Firebase Firestore
      await setDoc(doc(db, 'users', profile.id), profile, { merge: true });

      const current = loadAppData();
      const nextFounders = {
        ...current.founders,
        [profile.id]: profile,
      };

      const updated: SharedAppData = {
        ...current,
        founders: nextFounders,
        partnerStatuses: {
          ...current.partnerStatuses,
          [profile.id]: {
            userId: profile.id,
            isOnline: true,
            currentTask: 'Active in agency workspace',
            availability: 'Available for Execution',
            lastSeen: 'Active now',
            sessionMinutes: 1,
          },
        },
      };

      await this.syncState(updated);

      // Register with Express server
      await fetch('/api/register-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
    } catch (e) {
      console.error('Register profile failed', e);
    }
  }

  // Send partner connection request across devices
  public async sendPartnerInvite(fromUserId: string, targetInviteCode: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    isTargetOnline?: boolean;
    targetPartnerName?: string | null;
  }> {
    try {
      const normalizedCode = targetInviteCode.trim().toUpperCase();
      const currentData = loadAppData();
      const sender = currentData.founders[fromUserId];

      if (!sender) {
        return { success: false, error: 'User profile not found. Please log in first.' };
      }

      if (sender.inviteCode === normalizedCode) {
        return { success: false, error: 'You cannot connect to your own invite code.' };
      }

      // Check Firestore for registered user with this code
      let targetPartner: UserProfile | null = null;
      try {
        const qUsers = query(collection(db, 'users'), where('inviteCode', '==', normalizedCode));
        const snap = await getDocs(qUsers);
        if (!snap.empty) {
          targetPartner = snap.docs[0].data() as UserProfile;
        }
      } catch (err) {
        // fallback to currentData
      }

      if (!targetPartner) {
        targetPartner = Object.values(currentData.founders).find((f) => f.inviteCode === normalizedCode) || null;
      }

      const newRequest: PartnerRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fromUserId: sender.id,
        fromUserName: sender.name,
        fromUserAvatar: sender.avatar,
        fromUserRole: sender.role,
        fromInviteCode: sender.inviteCode,
        targetInviteCode: normalizedCode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
      };

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'partner',
        title: `🤝 New Partner Request from ${sender.name}`,
        message: `${sender.name} (${sender.role}) wants to connect co-founder workspaces with code ${sender.inviteCode}.`,
        senderId: sender.id,
        senderName: sender.name,
        senderAvatar: sender.avatar,
        targetUserId: targetPartner ? targetPartner.id : normalizedCode,
        actionTab: 'partners',
        timestamp: 'Just now',
        isoTime: new Date().toISOString(),
        isRead: false,
      };

      const updatedRequests = [newRequest, ...(currentData.partnerRequests || [])];
      const updatedNotifs = [newNotif, ...(currentData.notifications || [])].slice(0, 50);

      const updatedData: SharedAppData = {
        ...currentData,
        partnerRequests: updatedRequests,
        notifications: updatedNotifs,
      };

      await this.syncState(updatedData);

      // Save to Firebase collections
      await setDoc(doc(db, 'partner_requests', newRequest.id), newRequest);
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);

      // Call Express endpoint
      fetch('/api/partner/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, targetInviteCode: normalizedCode }),
      }).catch(() => {});

      return {
        success: true,
        message: `Invite sent to ${normalizedCode}!`,
        isTargetOnline: !!targetPartner,
        targetPartnerName: targetPartner ? targetPartner.name : null,
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || 'Failed to send invite request.',
      };
    }
  }

  // Send Custom Reminder / Nudge / Alert Notification to Partner
  public async sendPartnerNudge(senderId: string, title: string, message: string): Promise<boolean> {
    try {
      const currentData = loadAppData();
      const sender = currentData.founders[senderId] || { name: 'Co-Founder', avatar: '' };
      const partnerId = currentData.partnerConnection.pairedUserId;

      const newNotif: AppNotification = {
        id: `nudge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'reminder',
        title: title || `🔔 Reminder from ${sender.name}`,
        message: message,
        senderId: senderId,
        senderName: sender.name,
        senderAvatar: sender.avatar,
        targetUserId: partnerId || 'all',
        actionTab: 'partners',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isoTime: new Date().toISOString(),
        isRead: false,
      };

      const updatedNotifs = [newNotif, ...(currentData.notifications || [])].slice(0, 50);
      const updatedData: SharedAppData = {
        ...currentData,
        notifications: updatedNotifs,
      };

      await this.syncState(updatedData);
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);

      return true;
    } catch (e) {
      console.error('Failed to send partner nudge', e);
      return false;
    }
  }

  // Accept partner request
  public async acceptPartnerRequest(requestId: string, activeUserId: string): Promise<boolean> {
    try {
      const currentData = loadAppData();
      const activeUser = currentData.founders[activeUserId];
      const request = (currentData.partnerRequests || []).find((r) => r.id === requestId);

      if (!activeUser || !request) return false;

      const partnerUser: UserProfile = currentData.founders[request.fromUserId] || {
        id: request.fromUserId,
        name: request.fromUserName,
        avatar: request.fromUserAvatar,
        role: request.fromUserRole,
        inviteCode: request.fromInviteCode,
        email: `${request.fromUserName.toLowerCase().replace(/\s+/g, '_')}@aimsh.agency`,
        username: request.fromUserName.toLowerCase().replace(/\s+/g, '_'),
        bio: 'Co-Founder & Workspace Partner',
        hobbies: [],
        habitStyles: [],
        screenTimeHours: '3 - 4 Hours',
        socials: {},
        focusAreas: [],
        primaryObjective: 'Scale agency and collaborate together.',
      };

      const updatedRequests = (currentData.partnerRequests || []).map((r) =>
        r.id === requestId ? { ...r, status: 'accepted' as const } : r
      );

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'partner',
        title: '🎉 Partner Linked Successfully!',
        message: `${activeUser.name} accepted your connection request. Real-time co-founder mode is live!`,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        targetUserId: partnerUser.id,
        actionTab: 'partners',
        timestamp: 'Just now',
        isoTime: new Date().toISOString(),
        isRead: false,
      };

      const updatedFounders = {
        ...currentData.founders,
        [request.fromUserId]: partnerUser,
        [activeUser.id]: activeUser,
      };

      const updatedData: SharedAppData = {
        ...currentData,
        founders: updatedFounders,
        partnerRequests: updatedRequests,
        partnerConnection: {
          partnerInviteCode: partnerUser.inviteCode,
          status: 'accepted',
          pairedUserId: partnerUser.id,
          pairedAt: new Date().toISOString(),
        },
        partnerStatuses: {
          ...currentData.partnerStatuses,
          [activeUser.id]: {
            userId: activeUser.id,
            isOnline: true,
            currentTask: 'Connected to shared agency workspace',
            availability: 'Available for Execution',
            lastSeen: 'Active now',
            sessionMinutes: 10,
          },
          [partnerUser.id]: {
            userId: partnerUser.id,
            isOnline: true,
            currentTask: 'Connected to shared agency workspace',
            availability: 'Available for Execution',
            lastSeen: 'Active now',
            sessionMinutes: 10,
          },
        },
        notifications: [newNotif, ...(currentData.notifications || [])].slice(0, 50),
      };

      await this.syncState(updatedData);

      // Call Express server
      fetch('/api/partner/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, activeUserId }),
      }).catch(() => {});

      return true;
    } catch (e) {
      console.error('Accept partner request failed', e);
      return false;
    }
  }

  // Disconnect partner on BOTH sides
  public async disconnectPartner(): Promise<boolean> {
    try {
      const currentData = loadAppData();

      const updatedData: SharedAppData = {
        ...currentData,
        partnerConnection: {
          partnerInviteCode: '',
          status: 'none',
          pairedUserId: '',
        },
        partnerRequests: (currentData.partnerRequests || []).map((r) => ({
          ...r,
          status: r.status === 'accepted' ? ('declined' as const) : r.status,
        })),
      };

      await this.syncState(updatedData);

      fetch('/api/partner/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});

      return true;
    } catch (e) {
      console.error('Disconnect partner failed', e);
      return false;
    }
  }

  // Sync entire app state to Firestore doc and Express server
  public async syncState(data: SharedAppData): Promise<void> {
    try {
      saveAppData(data, false);
      const cleanData = sanitizeForFirestore(data);
      const docRef = doc(db, 'workspace', 'shared_state');
      await setDoc(docRef, cleanData, { merge: true });

      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to sync state to cloud', e);
    }
  }
}

export const cloudSync = new CloudSyncManager();
