import { seedSnapshot } from './seed';
import type { AppSnapshot, Comment, CreatePostInput, Id, Post, PostBase, Report, User } from '../types/domain';
import type { KoinogramServices, Session } from '../services/contracts';

const STORAGE_KEY = 'koinogram_mock_snapshot_v1';
const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

function safeLoad(): AppSnapshot {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const snapshot = JSON.parse(stored) as AppSnapshot;
      const users = snapshot.users.map((user) => user.avatarUrl?.startsWith('/manus-storage/') ? { ...user, avatarUrl: undefined } : user);
      const posts = snapshot.posts.map((post) => {
        if (post.type === 'image' && post.imageUrl.startsWith('/manus-storage/')) return { ...post, imageUrl: '/assets/outdoor-discussion.jpg', imageAlt: 'Friends in conversation outdoors' };
        if (post.type === 'verse' && post.imageUrl?.startsWith('/manus-storage/')) return { ...post, imageUrl: undefined };
        if (post.type === 'video' && post.thumbnailUrl.startsWith('/manus-storage/')) return { ...post, thumbnailUrl: '/assets/friends-by-water.jpg' };
        return post;
      });
      return { ...snapshot, users, posts, appearance: snapshot.appearance === 'dark' ? 'dark' : 'light' };
    }
  } catch {
    // A blocked or invalid demo store should fall back to the safe in-memory seed.
  }
  return structuredClone(seedSnapshot);
}

export class MockKoinogramServices implements KoinogramServices {
  private data: AppSnapshot;
  private session: Session | null = null;

  constructor() {
    this.data = safeLoad();
  }

  private save(): void {
    const durableDemo = structuredClone(this.data);
    durableDemo.posts = durableDemo.posts.filter((post) =>
      !(post.type === 'image' && post.imageUrl.startsWith('blob:')) &&
      !(post.type === 'verse' && post.imageUrl?.startsWith('blob:')) &&
      !(post.type === 'video' && post.thumbnailUrl.startsWith('blob:')),
    );
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(durableDemo)); } catch { /* In-memory demo still works. */ }
  }

  async snapshot(): Promise<AppSnapshot> { return structuredClone(this.data); }

  auth = {
    getSession: async () => this.session,
    signIn: async (email: string, _password: string): Promise<Session> => {
      if (!email.trim()) throw new Error('Enter your email address to continue.');
      const user = this.data.users.find((item) => item.isCurrentUser) ?? this.data.users[0];
      this.session = { user, issuedAt: new Date().toISOString(), mode: 'mock' };
      return this.session;
    },
    signUp: async (name: string, email: string, _password: string): Promise<Session> => {
      const user: User = { id: makeId('u'), displayName: name.trim(), handle: email.split('@')[0] || 'newfriend', bio: '', interests: [], following: false, isCurrentUser: true };
      this.data.users = this.data.users.map((person) => ({ ...person, isCurrentUser: false }));
      this.data.users.unshift(user);
      this.data.currentUserId = user.id;
      this.save();
      this.session = { user, issuedAt: new Date().toISOString(), mode: 'mock' };
      return this.session;
    },
    requestPasswordReset: async (email: string) => { if (!email.includes('@')) throw new Error('Enter a valid email address.'); },
    signOut: async () => { this.session = null; },
  };

  profiles = {
    getProfile: async (userId: Id) => this.data.users.find((user) => user.id === userId),
    updateCurrentProfile: async (input: { displayName: string; bio: string; tradition: string; interests: string[] }) => {
      this.data.users = this.data.users.map((user) => user.id === this.data.currentUserId ? { ...user, ...input } : user);
      this.save();
      return this.data.users.find((user) => user.id === this.data.currentUserId)!;
    },
    follow: async (userId: Id) => {
      this.data.users = this.data.users.map((user) => user.id === userId ? { ...user, following: !user.following } : user);
      this.save();
    },
  };

  posts = {
    getFeed: async () => this.data.posts,
    create: async (input: CreatePostInput): Promise<Post> => {
      const base: PostBase = { id: makeId('p'), authorId: this.data.currentUserId, createdAt: new Date().toISOString(), visibility: input.visibility, communityId: input.communityId, amenCount: 0, amenedByMe: false, savedByMe: false, comments: [] };
      let post: Post;
      switch (input.type) {
        case 'image': post = { ...base, type: 'image', text: input.text, imageUrl: input.imageUrl || '/assets/outdoor-discussion.jpg', imageAlt: input.imageAlt || 'Community moment shared in the Koinogram demo' }; break;
        case 'verse': post = { ...base, type: 'verse', text: input.text, reference: input.reference || 'Psalm 46:10', translation: input.translation || 'NRSVUE', imageUrl: input.imageUrl }; break;
        case 'testimony': post = { ...base, type: 'testimony', text: input.text, topic: 'A story shared with the community' }; break;
        case 'prayer': post = { ...base, type: 'prayer', text: input.text, responseCount: 0, prayedByMe: false, audienceLabel: input.visibility === 'public' ? 'Everyone' : input.visibility === 'private' ? 'Only me' : 'Followers only' }; break;
        case 'video': post = { ...base, type: 'video', text: input.text, thumbnailUrl: input.imageUrl || '/assets/friends-by-water.jpg', duration: input.videoDuration || '0:30' }; break;
        default: post = { ...base, type: 'text', text: input.text };
      }
      this.data.posts.unshift(post);
      this.save();
      return post;
    },
    delete: async (postId: Id) => { this.data.posts = this.data.posts.filter((post) => post.id !== postId); this.save(); },
    toggleAmen: async (postId: Id) => {
      this.data.posts = this.data.posts.map((post) => post.id === postId ? { ...post, amenedByMe: !post.amenedByMe, amenCount: Math.max(0, post.amenCount + (post.amenedByMe ? -1 : 1)) } : post);
      this.save();
      return this.data.posts.find((post) => post.id === postId)!;
    },
    toggleSaved: async (postId: Id) => {
      this.data.posts = this.data.posts.map((post) => post.id === postId ? { ...post, savedByMe: !post.savedByMe } : post);
      this.save();
      return this.data.posts.find((post) => post.id === postId)!;
    },
    addComment: async (postId: Id, body: string): Promise<Comment> => {
      const comment = { id: makeId('c'), authorId: this.data.currentUserId, body: body.trim(), createdAt: new Date().toISOString() };
      this.data.posts = this.data.posts.map((post) => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post);
      this.save();
      return comment;
    },
    togglePrayer: async (postId: Id) => {
      this.data.posts = this.data.posts.map((post) => post.id === postId && post.type === 'prayer' ? { ...post, prayedByMe: !post.prayedByMe, responseCount: Math.max(0, post.responseCount + (post.prayedByMe ? -1 : 1)) } : post);
      this.save();
      return this.data.posts.find((post) => post.id === postId)!;
    },
  };

  communities = {
    getAll: async () => this.data.communities,
    toggleMembership: async (communityId: Id) => {
      this.data.communities = this.data.communities.map((community) => community.id === communityId ? { ...community, joined: !community.joined, memberCount: Math.max(0, community.memberCount + (community.joined ? -1 : 1)) } : community);
      this.save();
    },
  };

  search = {
    search: async (query: string, category: 'all' | 'people' | 'posts' | 'communities' | 'topics') => {
      const term = query.trim().toLowerCase();
      if (!term) return { users: [], posts: [], communities: [] };
      const users = category === 'all' || category === 'people' ? this.data.users.filter((user) => `${user.displayName} ${user.handle} ${user.bio} ${user.interests.join(' ')}`.toLowerCase().includes(term)) : [];
      const posts = category === 'all' || category === 'posts' || category === 'topics' ? this.data.posts.filter((post) => `${post.text} ${post.type === 'verse' ? post.reference : ''} ${post.type === 'testimony' ? post.topic : ''}`.toLowerCase().includes(term)) : [];
      const communities = category === 'all' || category === 'communities' || category === 'topics' ? this.data.communities.filter((community) => `${community.name} ${community.description} ${community.category}`.toLowerCase().includes(term)) : [];
      return { users, posts, communities };
    },
  };

  notifications = {
    list: async () => this.data.notifications,
    markRead: async (notificationId: Id) => { this.data.notifications = this.data.notifications.map((item) => item.id === notificationId ? { ...item, read: true } : item); this.save(); },
    markAllRead: async () => { this.data.notifications = this.data.notifications.map((item) => ({ ...item, read: true })); this.save(); },
  };

  saved = {
    list: async () => this.data.posts.filter((post) => post.savedByMe),
    toggle: async (postId: Id) => { await this.posts.toggleSaved(postId); },
  };

  moderation = {
    report: async (targetId: Id, targetType: Report['targetType'], reason: string, details?: string) => {
      const report: Report = { id: makeId('r'), targetId, targetType, reason, details, createdAt: new Date().toISOString(), status: 'received' };
      this.data.reports.unshift(report);
      this.save();
      return report;
    },
    block: async (userId: Id) => { if (!this.data.blockedUserIds.includes(userId)) this.data.blockedUserIds.push(userId); this.save(); },
    unblock: async (userId: Id) => { this.data.blockedUserIds = this.data.blockedUserIds.filter((id) => id !== userId); this.save(); },
    mute: async (userId: Id) => { if (!this.data.mutedUserIds.includes(userId)) this.data.mutedUserIds.push(userId); this.save(); },
    unmute: async (userId: Id) => { this.data.mutedUserIds = this.data.mutedUserIds.filter((id) => id !== userId); this.save(); },
    updateReportStatus: async (reportId: Id, status: Report['status']) => { this.data.reports = this.data.reports.map((report) => report.id === reportId ? { ...report, status } : report); this.save(); },
  };

  settings = {
    updatePrivacy: async (profileVisibility: AppSnapshot['profileVisibility'], prayerDefaultVisibility: AppSnapshot['prayerDefaultVisibility']) => { this.data.profileVisibility = profileVisibility; this.data.prayerDefaultVisibility = prayerDefaultVisibility; this.save(); },
    updateEmailNotifications: async (enabled: boolean) => { this.data.emailNotifications = enabled; this.save(); },
    updateAppearance: async (appearance: AppSnapshot['appearance']) => { this.data.appearance = appearance; this.save(); },
  };

  media = {
    upload: async (file: File) => {
      if (!file.type.startsWith('image/')) throw new Error('Choose an image file to attach.');
      return { url: URL.createObjectURL(file), alt: file.name.replace(/\.[^.]+$/, '') || 'Post image' };
    },
  };
}
