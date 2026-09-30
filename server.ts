import express, { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SharedAppData, UserProfile, PartnerRequest, ChatMessage, AppNotification } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database storage directory & file
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'agency_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial clean state - ZERO fake dummy users
const INITIAL_CLEAN_DATA: SharedAppData = {
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
  notifications: [],
  sharedScratchpad: '',
  scratchpadLastUpdated: new Date().toISOString(),
  lastSyncTimestamp: Date.now(),
};

// Load database from disk or initialize
function readDatabase(): SharedAppData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_CLEAN_DATA,
        ...parsed,
        founders: parsed.founders || {},
        missions: Array.isArray(parsed.missions) ? parsed.missions : [],
        clients: Array.isArray(parsed.clients) ? parsed.clients : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        partnerRequests: Array.isArray(parsed.partnerRequests) ? parsed.partnerRequests : [],
        partnerStatuses: parsed.partnerStatuses || {},
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      };
    }
  } catch (err) {
    console.error('Error reading agency database, using initial clean data', err);
  }
  return INITIAL_CLEAN_DATA;
}

let inMemoryDb: SharedAppData = readDatabase();

function writeDatabase(data: SharedAppData) {
  inMemoryDb = {
    ...data,
    lastSyncTimestamp: Date.now(),
  };
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing agency database to disk', err);
  }
  broadcastSse({ type: 'DATA_SYNC', data: inMemoryDb });
}

// Server-Sent Events (SSE) subscribers for real-time live push to all devices
type SseClient = {
  id: string;
  res: Response;
};

let sseClients: SseClient[] = [];

function broadcastSse(payload: { type: string; data: any }) {
  const dataString = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(dataString);
    } catch (e) {
      // client disconnected
    }
  });
}

// 1. SSE Real-time Stream Endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newClient: SseClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial data immediately
  res.write(`data: ${JSON.stringify({ type: 'INITIAL_STATE', data: inMemoryDb })}\n\n`);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// 2. Fetch shared workspace state
app.get('/api/data', (_req, res) => {
  res.json({ success: true, data: inMemoryDb });
});

// 3. Full sync / update shared workspace state
app.post('/api/data', (req, res) => {
  const updatedData = req.body;
  if (!updatedData || typeof updatedData !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid data format' });
  }

  // Preserve all registered founders
  const mergedFounders = {
    ...inMemoryDb.founders,
    ...(updatedData.founders || {}),
  };

  const nextState: SharedAppData = {
    ...inMemoryDb,
    ...updatedData,
    founders: mergedFounders,
    lastSyncTimestamp: Date.now(),
  };

  writeDatabase(nextState);
  res.json({ success: true, data: inMemoryDb });
});

// 4. Register / Update Real User Profile
app.post('/api/register-profile', (req, res) => {
  const { profile } = req.body as { profile: UserProfile };
  if (!profile || !profile.id || !profile.inviteCode) {
    return res.status(400).json({ success: false, error: 'User profile with invite code is required' });
  }

  const updatedFounders = {
    ...inMemoryDb.founders,
    [profile.id]: profile,
  };

  const nextState: SharedAppData = {
    ...inMemoryDb,
    founders: updatedFounders,
    partnerStatuses: {
      ...inMemoryDb.partnerStatuses,
      [profile.id]: {
        userId: profile.id,
        isOnline: true,
        currentTask: 'Active in shared workspace',
        availability: 'Available for Execution',
        lastSeen: 'Active now',
        sessionMinutes: 1,
      },
    },
  };

  writeDatabase(nextState);
  res.json({ success: true, user: profile, data: inMemoryDb });
});

// 5. Send Partner Connection Request (Real-time bilateral matching across devices)
app.post('/api/partner/invite', (req, res) => {
  const { fromUserId, targetInviteCode } = req.body;
  if (!fromUserId || !targetInviteCode) {
    return res.status(400).json({ success: false, error: 'Missing fromUserId or targetInviteCode' });
  }

  const normalizedCode = String(targetInviteCode).trim().toUpperCase();
  const sender = inMemoryDb.founders[fromUserId];
  if (!sender) {
    return res.status(404).json({ success: false, error: 'Sender profile not registered yet on server' });
  }

  if (sender.inviteCode === normalizedCode) {
    return res.status(400).json({ success: false, error: 'You cannot connect to your own invite code.' });
  }

  // Look for real partner registered with this invite code on the cloud database
  const targetPartner = Object.values(inMemoryDb.founders).find((f: UserProfile) => f.inviteCode === normalizedCode);

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

  const newNotification: AppNotification = {
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

  const existingRequests = (inMemoryDb.partnerRequests || []).filter(
    (r: PartnerRequest) => !(r.fromUserId === sender.id && r.targetInviteCode === normalizedCode && r.status === 'pending')
  );

  const nextState: SharedAppData = {
    ...inMemoryDb,
    partnerRequests: [newRequest, ...existingRequests],
    notifications: [newNotification, ...(inMemoryDb.notifications || [])].slice(0, 50),
  };

  writeDatabase(nextState);

  res.json({
    success: true,
    message: `Invite request sent to ${normalizedCode}!`,
    request: newRequest,
    isTargetOnline: !!targetPartner,
    targetPartnerName: targetPartner ? targetPartner.name : null,
    data: inMemoryDb,
  });
});

// 6. Accept Partner Request
app.post('/api/partner/accept', (req, res) => {
  const { requestId, activeUserId } = req.body;
  if (!requestId || !activeUserId) {
    return res.status(400).json({ success: false, error: 'Missing requestId or activeUserId' });
  }

  const activeUser = inMemoryDb.founders[activeUserId];
  if (!activeUser) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const request = (inMemoryDb.partnerRequests || []).find((r: PartnerRequest) => r.id === requestId);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Request not found' });
  }

  const partnerUser = inMemoryDb.founders[request.fromUserId];
  if (!partnerUser) {
    return res.status(404).json({ success: false, error: 'Sender profile not found on server' });
  }

  const updatedRequests: PartnerRequest[] = (inMemoryDb.partnerRequests || []).map((r: PartnerRequest) =>
    r.id === requestId ? { ...r, status: 'accepted' as const } : r
  );

  const newNotification: AppNotification = {
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

  const nextState: SharedAppData = {
    ...inMemoryDb,
    partnerRequests: updatedRequests,
    partnerConnection: {
      partnerInviteCode: partnerUser.inviteCode,
      status: 'accepted',
      pairedUserId: partnerUser.id,
      pairedAt: new Date().toISOString(),
    },
    partnerStatuses: {
      ...inMemoryDb.partnerStatuses,
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
    notifications: [newNotification, ...(inMemoryDb.notifications || [])].slice(0, 50),
  };

  writeDatabase(nextState);
  res.json({ success: true, partner: partnerUser, data: inMemoryDb });
});

// 7. Disconnect Partner
app.post('/api/partner/disconnect', (_req, res) => {
  const nextState: SharedAppData = {
    ...inMemoryDb,
    partnerConnection: {
      partnerInviteCode: '',
      status: 'none',
      pairedUserId: '',
    },
    partnerRequests: (inMemoryDb.partnerRequests || []).map((r: PartnerRequest) => ({
      ...r,
      status: r.status === 'accepted' ? ('declined' as const) : r.status,
    })),
  };

  writeDatabase(nextState);
  res.json({ success: true, message: 'Partner disconnected cleanly.', data: inMemoryDb });
});

// 8. Post Chat Message
app.post('/api/messages', (req, res) => {
  const { message } = req.body as { message: ChatMessage };
  if (!message || !message.content || !message.senderId) {
    return res.status(400).json({ success: false, error: 'Invalid message payload' });
  }

  const newMsg: ChatMessage = {
    ...message,
    id: message.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'message',
    title: `💬 ${newMsg.senderName}`,
    message: newMsg.content,
    senderId: newMsg.senderId,
    senderName: newMsg.senderName,
    senderAvatar: newMsg.senderAvatar,
    targetUserId: newMsg.recipientId || 'all',
    actionTab: 'chat',
    timestamp: newMsg.timestamp,
    isoTime: new Date().toISOString(),
    isRead: false,
  };

  const nextState: SharedAppData = {
    ...inMemoryDb,
    messages: [...(inMemoryDb.messages || []), newMsg],
    notifications: [newNotif, ...(inMemoryDb.notifications || [])].slice(0, 50),
  };

  writeDatabase(nextState);
  res.json({ success: true, message: newMsg, data: inMemoryDb });
});

// 9. Delete Message
app.post('/api/messages/delete', (req, res) => {
  const { messageIds } = req.body;
  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ success: false, error: 'messageIds array required' });
  }

  const nextState: SharedAppData = {
    ...inMemoryDb,
    messages: (inMemoryDb.messages || []).filter((m: ChatMessage) => !messageIds.includes(m.id)),
  };

  writeDatabase(nextState);
  res.json({ success: true, data: inMemoryDb });
});

// 10. Clear All Messages
app.post('/api/messages/clear', (_req, res) => {
  const nextState: SharedAppData = {
    ...inMemoryDb,
    messages: [],
  };
  writeDatabase(nextState);
  res.json({ success: true, data: inMemoryDb });
});

// 11. Reset Database to Clean State
app.post('/api/reset', (_req, res) => {
  writeDatabase(INITIAL_CLEAN_DATA);
  res.json({ success: true, data: INITIAL_CLEAN_DATA });
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AIMS.H Agency Cloud Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
