export type Id = string;
export type Visibility = 'public' | 'followers' | 'community' | 'private';
export type PostType = 'text' | 'image' | 'verse' | 'testimony' | 'prayer' | 'video';

export interface User {
  id: Id;
  displayName: string;
  handle: string;
  avatarUrl?: string;
  bio: string;
  location?: string;
  tradition?: string;
  interests: string[];
  following: boolean;
  isCurrentUser?: boolean;
}

export interface Comment {
  id: Id;
  authorId: Id;
  body: string;
  createdAt: string;
}

export interface PostBase {
  id: Id;
  authorId: Id;
  createdAt: string;
  visibility: Visibility;
  communityId?: Id;
  amenCount: number;
  amenedByMe: boolean;
  savedByMe: boolean;
  comments: Comment[];
}

export type PostPayload =
  | { type: 'text'; text: string }
  | { type: 'image'; text: string; imageUrl: string; imageAlt: string }
  | { type: 'verse'; text: string; reference: string; translation: string; imageUrl?: string }
  | { type: 'testimony'; text: string; topic?: string }
  | { type: 'prayer'; text: string; responseCount: number; prayedByMe: boolean; audienceLabel: string }
  | { type: 'video'; text: string; thumbnailUrl: string; duration: string };

export type Post = PostBase & PostPayload;

export interface Community {
  id: Id;
  name: string;
  description: string;
  rules: string[];
  memberCount: number;
  category: string;
  imageUrl?: string;
  joined: boolean;
}

export interface Notification {
  id: Id;
  kind: 'amen' | 'comment' | 'prayer' | 'follow' | 'community';
  actorId: Id;
  message: string;
  createdAt: string;
  read: boolean;
  href: string;
}

export interface SavedPost {
  postId: Id;
  savedAt: string;
}

export interface Report {
  id: Id;
  targetId: Id;
  targetType: 'post' | 'user' | 'community' | 'comment';
  reason: string;
  details?: string;
  createdAt: string;
  status: 'received' | 'reviewing' | 'resolved';
}

export interface UserProfile extends User {
  createdAt: string;
  website?: string;
}

export interface AppSnapshot {
  currentUserId: Id;
  users: User[];
  posts: Post[];
  communities: Community[];
  notifications: Notification[];
  blockedUserIds: Id[];
  mutedUserIds: Id[];
  reports: Report[];
  profileVisibility: 'public' | 'followers';
  emailNotifications: boolean;
  appearance: 'light' | 'dark';
  prayerDefaultVisibility: Exclude<Visibility, 'community'>;
}

export interface CreatePostInput {
  type: PostType;
  text: string;
  visibility: Visibility;
  communityId?: Id;
  reference?: string;
  translation?: string;
  imageUrl?: string;
  imageAlt?: string;
  prayerAudience?: string;
  videoDuration?: string;
}

export interface UpdateProfileInput {
  displayName: string;
  bio: string;
  tradition: string;
  interests: string[];
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: { cursor?: string | null; total?: number };
}

export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ApiErrorBody };
