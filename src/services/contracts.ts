import type { AppSnapshot, Comment, CreatePostInput, Id, Notification, Post, Report, UpdateProfileInput, User } from '../types/domain';

export interface Session {
  user: User;
  issuedAt: string;
  mode: 'mock' | 'api';
}

export interface AuthService {
  getSession(): Promise<Session | null>;
  signIn(email: string, password: string): Promise<Session>;
  signUp(name: string, email: string, password: string): Promise<Session>;
  requestPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
}

export interface ProfileService {
  getProfile(userId: Id): Promise<User | undefined>;
  updateCurrentProfile(input: UpdateProfileInput): Promise<User>;
  follow(userId: Id): Promise<void>;
}

export interface PostService {
  getFeed(): Promise<Post[]>;
  create(input: CreatePostInput): Promise<Post>;
  delete(postId: Id): Promise<void>;
  toggleAmen(postId: Id): Promise<Post>;
  toggleSaved(postId: Id): Promise<Post>;
  addComment(postId: Id, body: string): Promise<Comment>;
  togglePrayer(postId: Id): Promise<Post>;
}

export interface CommunityService {
  getAll(): Promise<AppSnapshot['communities']>;
  toggleMembership(communityId: Id): Promise<void>;
}

export interface SearchService {
  search(query: string, category: 'all' | 'people' | 'posts' | 'communities' | 'topics'): Promise<{ users: User[]; posts: Post[]; communities: AppSnapshot['communities'] }>;
}

export interface NotificationService {
  list(): Promise<Notification[]>;
  markRead(notificationId: Id): Promise<void>;
  markAllRead(): Promise<void>;
}

export interface SavedPostService {
  list(): Promise<Post[]>;
  toggle(postId: Id): Promise<void>;
}

export interface ModerationService {
  report(targetId: Id, targetType: Report['targetType'], reason: string, details?: string): Promise<Report>;
  block(userId: Id): Promise<void>;
  unblock(userId: Id): Promise<void>;
  mute(userId: Id): Promise<void>;
  unmute(userId: Id): Promise<void>;
  updateReportStatus(reportId: Id, status: Report['status']): Promise<void>;
}

export interface SettingsService {
  updatePrivacy(profileVisibility: AppSnapshot['profileVisibility'], prayerDefaultVisibility: AppSnapshot['prayerDefaultVisibility']): Promise<void>;
  updateEmailNotifications(enabled: boolean): Promise<void>;
  updateAppearance(appearance: AppSnapshot['appearance']): Promise<void>;
}

export interface MediaUploadService {
  upload(file: File): Promise<{ url: string; alt: string }>;
}

export interface KoinogramServices {
  auth: AuthService;
  profiles: ProfileService;
  posts: PostService;
  communities: CommunityService;
  search: SearchService;
  notifications: NotificationService;
  saved: SavedPostService;
  moderation: ModerationService;
  settings: SettingsService;
  media: MediaUploadService;
  snapshot(): Promise<AppSnapshot>;
}
