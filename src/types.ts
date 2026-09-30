export type MasteryStage = 'Beginner' | 'Intermediate' | 'Expert' | 'In Learning';
export type MissionPriority = 'High' | 'Medium' | 'Low';
export type MissionStatus = 'To-Do' | 'In Progress' | 'Completed';
export type AssigneeId = 'founder_1' | 'founder_2' | 'both';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  inviteCode: string;
  bio: string;
  password?: string;
  hobbies?: string[];
  habitStyles?: string[];
  screenTimeHours?: number | string;
  socials: {
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
    youtube?: string;
    github?: string;
  };
  focusAreas: string[];
  primaryObjective: string;
}

export interface BrandingTask {
  id: string;
  founderId: string;
  title: string;
  category: 'LinkedIn' | 'Twitter' | 'YouTube' | 'Outreach' | 'General';
  completed: boolean;
  dueDate?: string;
  notes?: string;
}

export interface SkillItem {
  id: string;
  founderId: string;
  title: string;
  category: string;
  targetDate: string;
  progressPercent: number; // 0 - 100
  dailyEffortHours: number;
  stage: MasteryStage;
  notes: string;
  kudosCount: number;
  createdAt?: string;
}

export interface MissionItem {
  id: string;
  title: string;
  description: string;
  targetDate: string; // ISO string or YYYY-MM-DDTHH:mm
  status: MissionStatus;
  priority: MissionPriority;
  assignee: AssigneeId;
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
  createdAt: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  color: string;
  iconName: string;
  description: string;
}

export interface ResourceLink {
  id: string;
  folderId: string;
  title: string;
  description: string;
  url: string;
  category: string;
  authorId: string;
  addedAt: string;
  isFavorite?: boolean;
}

export interface CuratedVaultVideo {
  id: string;
  title: string;
  styleTag: string;
  creator: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  breakdown: string;
}

export interface MediaVideoItem {
  id: string;
  title: string;
  url: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'other';
  sector: 'IT Sector' | 'AI Tools' | 'Marketing' | 'Agency Growth' | 'Creative & Design';
  addedBy: string;
  addedAt: string;
  actionableNotes: string[];
}

export interface HabitItem {
  id: string;
  founderId: string; // or 'both'
  title: string;
  category: string;
  streak?: number;
  streakCount?: number;
  createdAt?: string;
  // Map date string 'YYYY-MM-DD' -> boolean
  history: Record<string, boolean>;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId?: string; // 'all' or specific partner userId
  content: string;
  timestamp: string;
  reactions: Record<string, string[]>; // emoji -> array of userIds
  isVoiceMock?: boolean;
  attachmentUrl?: string;
  attachmentTitle?: string;
}

export interface PartnerRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  fromUserRole: string;
  fromInviteCode: string;
  targetInviteCode: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export type PartnerAvailability = 
  | 'Available' 
  | 'Available for Execution' 
  | 'In Strategy Call' 
  | 'Reviewing Deliverables' 
  | 'Client Meeting' 
  | 'Focus Mode / Do Not Disturb' 
  | 'Offline';

export interface PartnerActivityStatus {
  userId: string;
  isOnline: boolean;
  currentTask: string;
  availability: PartnerAvailability;
  lastSeen: string;
  sessionMinutes: number;
}

export interface PartnerConnection {
  partnerInviteCode: string;
  status: 'none' | 'pending' | 'accepted';
  pairedUserId: string;
  pairedAt?: string;
}

export interface AgencyMeeting {
  id: string;
  title: string;
  scheduledTime: string;
  meetUrl: string;
  agenda: string;
  hostId: string;
  targetPartnerId?: string;
  status: 'upcoming' | 'accepted' | 'declined' | 'live' | 'completed';
  declineReason?: string;
  participants: string[];
  createdAt: string;
}

export interface AgencyClient {
  id: string;
  name: string;
  service: string;
  dealValue: string;
  status: 'Lead' | 'Negotiation' | 'Active / Retainer' | 'Delivered' | 'Closed';
  nextAction: string;
  notes: string;
  contact?: string;
  addedBy: string;
  addedByName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  type: 'meeting' | 'schedule' | 'message' | 'partner' | 'habit' | 'file' | 'client' | 'reminder';
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  targetUserId: string;
  actionUrl?: string;
  actionTab?: string;
  timestamp: string;
  isoTime: string;
  isRead: boolean;
}

export interface AgencySettings {
  agencyName: string;
  agencyLogoUrl?: string;
  agencyTagline?: string;
}

export interface SharedAppData {
  founders: Record<string, UserProfile>;
  activeFounderId: string;
  agencySettings?: AgencySettings;
  partnerConnection: PartnerConnection;
  partnerConnections?: Record<string, PartnerConnection>;
  partnerRequests: PartnerRequest[];
  partnerStatuses: Record<string, PartnerActivityStatus>;
  missions: MissionItem[];
  folders: DriveFolder[];
  resources: ResourceLink[];
  vaultVideos: CuratedVaultVideo[];
  mediaVideos: MediaVideoItem[];
  skills: SkillItem[];
  brandingTasks: BrandingTask[];
  habits: HabitItem[];
  messages: ChatMessage[];
  meetings?: AgencyMeeting[];
  clients?: AgencyClient[];
  notifications?: AppNotification[];
  sharedScratchpad: string;
  scratchpadLastUpdated: string;
  lastSyncTimestamp: number;
}
