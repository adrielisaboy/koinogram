import { Bell, Bookmark, CheckCheck, Heart, HeartHandshake, MessageCircle, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKoinogram } from '../app/AppProvider';
import { Avatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { EmptyState } from '../components/EmptyState';

const notificationIcon = { amen: Heart, comment: MessageCircle, prayer: HeartHandshake, follow: Users, community: Users };
function timeLabel(value: string) { const hours = Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000); return hours < 1 ? 'Just now' : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`; }

export function NotificationsPage() {
  const { snapshot, services, run, notify } = useKoinogram();
  const unread = snapshot.notifications.filter((item) => !item.read).length;
  async function markOne(id: string) { await run(() => services.notifications.markRead(id)); }
  async function markAll() { await run(() => services.notifications.markAllRead()); notify('You’re all caught up.'); }
  return <div className="personal-page"><div className="personal-intro"><div><span className="eyebrow">LITTLE SIGNS OF LIFE</span><h2>Your community is here.</h2><p>Kind words, shared prayers, and moments that found their way to you.</p></div><span className="personal-ornament"><Bell size={22} /></span></div><div className="personal-toolbar"><span>{unread ? `${unread} new` : 'All caught up'}</span>{unread > 0 && <button className="text-action" onClick={() => void markAll()}><CheckCheck size={15} /> Mark all as read</button>}</div>{snapshot.notifications.length === 0 ? <EmptyState icon={<Bell size={23} />} title="Quiet in a good way." copy="When people share a kind word or a prayer with you, you’ll find it here." action={<Link to="/app/explore" className="button button-outline">Find a conversation</Link>} /> : <div className="notification-list">{snapshot.notifications.map((item) => { const actor = snapshot.users.find((user) => user.id === item.actorId); const Icon = notificationIcon[item.kind]; return <Link to={item.href} key={item.id} className={`notification-item ${item.read ? '' : 'notification-unread'}`} onClick={() => { if (!item.read) void markOne(item.id); }}><span className="notification-avatar"><Avatar user={actor} size="md" /><i className={`notification-type-icon type-${item.kind}`}><Icon size={12} /></i></span><span className="notification-copy"><strong>{actor?.displayName ?? 'A community member'}</strong> {item.message}<small>{timeLabel(item.createdAt)}</small></span>{!item.read && <span className="unread-dot" aria-label="Unread" />}</Link>; })}</div>}<div className="privacy-footnote"><HeartHandshake size={15} /><span>Notifications are demo data. Real alerts and delivery preferences need a connected service.</span></div></div>;
}

export function SavedPage() {
  const { snapshot } = useKoinogram();
  const saved = snapshot.posts.filter((post) => post.savedByMe);
  return <div className="personal-page"><div className="personal-intro"><div><span className="eyebrow">KEEP FOR A QUIETER MOMENT</span><h2>Your saved thoughts.</h2><p>Passages, stories, and words you want to come back to.</p></div><span className="personal-ornament"><Bookmark size={22} /></span></div>{saved.length === 0 ? <EmptyState icon={<Bookmark size={22} />} title="A small shelf for later." copy="Save a post whenever you want to return to it. It stays here in your demo profile." action={<Link to="/app" className="button button-primary">Find a moment</Link>} /> : <div className="saved-list">{saved.map((post) => <PostCard key={post.id} post={post} />)}</div>}<div className="privacy-footnote"><X size={14} /><span>Saved posts are visible only in your demo profile on this device.</span></div></div>;
}
