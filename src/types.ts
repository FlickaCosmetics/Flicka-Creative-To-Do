export type TaskStatus = 'not_started' | 'in_progress' | 'in_review' | 'done';

export type TeamRole = 'performance_marketer' | 'graphic_designer' | 'video_editor' | 'team_lead' | 'copywriter' | 'ugc_creator' | 'admin';

export type UserAccountStatus = 'pending' | 'approved' | 'rejected';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: TeamRole;
  roleTitle: string;
  department: string;
  status: UserAccountStatus;
  isAdmin: boolean;
  initials: string;
  avatarBg: string;
  avatarText: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export type FunnelStage = 'None' | 'TOF' | 'MOF' | 'BOF' | 'Retention';

export type PlatformType = 
  | 'None'
  | 'Meta (Instagram / FB)'
  | 'Google Ads'
  | 'YouTube Shorts'
  | 'TikTok'
  | 'Amazon Ads'
  | 'Website / Shopify'
  | 'Print / Catalog'
  | 'Other';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: TeamRole;
  roleTitle: string;
  avatarBg: string;
  avatarText: string;
  email?: string;
}

export interface TagCategory {
  id: string;
  name: string;
  bg: string;
  text: string;
  border?: string;
  dotColor?: string;
}

export type DeliverableFormat = 
  | '1080x1920 (9:16 Reel/Story)'
  | '1080x1080 (1:1 Feed)'
  | '1080x1350 (4:5 Portrait)'
  | '1920x1080 (16:9 YouTube/Hero)'
  | 'Catalog Spread (PDF/PNG)'
  | 'Vector / Motion Sting'
  | 'Custom';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ReviewComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
  statusChange?: TaskStatus;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'url';
  url: string;
  name: string;
  dataUrl?: string; // base64 or object url for preview
  driveFileId?: string;
  driveWebViewLink?: string;
  driveFolder?: 'reference' | 'finish';
  driveUploadStatus?: 'synced' | 'uploading' | 'failed' | 'local';
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
  user?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  status: TaskStatus;
  tagIds: string[];
  assigneeId?: string;
  createdById: string;
  createdByName: string;
  product?: string;
  funnel?: FunnelStage;
  persona?: string;
  concept?: string;
  platform?: PlatformType;
  deliverableFormat?: DeliverableFormat | string;
  driveLink?: string;
  figmaLink?: string;
  referenceUrl?: string;
  refImages?: MediaItem[];
  createdImages?: MediaItem[];
  activity?: ActivityItem[];
  priority: TaskPriority;
  dueDate?: string;
  monthKey: string; // e.g. "2026-08"
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  reviewComments?: ReviewComment[];
  checklist?: ChecklistItem[];
}

export type AnalyticsTab = 'daily' | 'funnel' | 'people' | 'tags' | 'products' | 'months';

export interface FilterState {
  monthKey: string;
  assigneeId: string; // "everyone" or member id
  selectedTag: string; // "all" or tag name/id
  searchQuery: string;
  priorityFilter: string; // "all" | 'high' | 'medium' | 'low' | 'urgent'
  funnelFilter: string; // "all" | 'TOF' | 'MOF' | 'BOF' | 'Retention'
  personaFilter: string; // "all" | specific persona
}
