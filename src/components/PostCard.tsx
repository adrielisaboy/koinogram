import { useState, type FormEvent } from 'react';
import { Bookmark, HeartHandshake, MessageCircle, MoreHorizontal, Play, Send, Share2, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Post } from '../types/domain';
import { useKoinogram } from '../app/AppProvider';
import { Avatar } from './Avatar';
import { SafetyDialog } from './SafetyDialog';

function ago(value: string): string {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const typeLabel: Record<Post['type'], string> = { text: 'Reflection', image: 'A moment', verse: 'Scripture', testimony: 'Testimony', prayer: 'Prayer request', video: 'A quiet moment' };

export function PostCard({ post }: { post: Post }) {
  const { snapshot, currentUser, services, run, notify } = useKoinogram();
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const author = snapshot.users.find((person) => person.id === post.authorId);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) return;
    await run(() => services.posts.addComment(post.id, comment));
    setComment('');
    notify('Your kind word was added.');
  }

  async function sharePost() {
    const url = `${window.location.origin}/app#${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: 'A moment on Koinogram', url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); notify('Post link copied to your clipboard.'); }
      else notify('This demo link is ready to share.');
    } catch { /* A dismissed native share sheet is not an error. */ }
  }

  const amen = async () => { await run(() => services.posts.toggleAmen(post.id)); notify(post.amenedByMe ? 'Amen removed.' : 'Amen — your encouragement is with them.'); };
  const save = async () => { await run(() => services.posts.toggleSaved(post.id)); notify(post.savedByMe ? 'Removed from your saved posts.' : 'Saved for a quieter moment.'); };
  const pray = async () => { await run(() => services.posts.togglePrayer(post.id)); notify(post.type === 'prayer' && post.prayedByMe ? 'Prayer response removed.' : 'You’re praying with them.'); };

  return (
    <article className={`post-card ${post.type === 'prayer' ? 'post-prayer' : ''}`} id={post.id}>
      <div className="post-head">
        <Link to={`/app/people/${author?.id ?? currentUser.id}`} className="post-author"><Avatar user={author} size="md" /><span><strong>{author?.displayName ?? 'Koinogram member'}</strong><small>@{author?.handle ?? 'member'} <span>·</span> {ago(post.createdAt)}</small></span></Link>
        <div className="post-tools"><span className={`post-kind kind-${post.type}`}>{post.type === 'prayer' && <HeartHandshake size={13} />}{typeLabel[post.type]}</span><button className="icon-button post-more" aria-label={`More actions for ${typeLabel[post.type].toLowerCase()} post`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={19} /></button>
          {menuOpen && <div className="post-menu"><button onClick={() => { setReportOpen(true); setMenuOpen(false); }}><ShieldAlert size={15} /> Report this post</button><button onClick={save}><Bookmark size={15} /> {post.savedByMe ? 'Unsave post' : 'Save post'}</button></div>}
        </div>
      </div>

      {post.type === 'prayer' && <div className="prayer-context"><span className="prayer-icon"><HeartHandshake size={16} /></span><span><strong>A request for prayer</strong><small><ShieldAlert size={12} /> Shared with {post.audienceLabel.toLowerCase()}</small></span><span className="privacy-pip"><span /> Private by choice</span></div>}
      <p className="post-copy">{post.text}</p>
      {post.type === 'verse' && <blockquote className="verse-quote"><span className="quote-mark">“</span><span><strong>Be still, and know that I am God.</strong><small>{post.reference} <span>·</span> {post.translation}</small></span><span className="verse-flourish">✳</span></blockquote>}
      {post.type === 'testimony' && post.topic && <span className="testimony-topic"><Sparkles size={13} /> {post.topic}</span>}
      {post.type === 'image' && <figure className="post-media"><img src={post.imageUrl} alt={post.imageAlt} loading="lazy" /><figcaption>{post.imageAlt}</figcaption></figure>}
      {post.type === 'verse' && post.imageUrl && <figure className="post-media verse-media"><img src={post.imageUrl} alt="A quiet morning Bible-reading moment" loading="lazy" /></figure>}
      {post.type === 'video' && <button className="post-media video-preview" onClick={() => notify('This sample video is a preview; connect a media service to enable playback.')} aria-label={`Play preview, ${post.duration}`}><img src={post.thumbnailUrl} alt="Peaceful community moment video thumbnail" loading="lazy" /><span className="video-play"><Play size={21} fill="currentColor" /></span><span className="video-duration">{post.duration}</span><span className="video-caption">Video preview</span></button>}

      <div className="post-metrics"><span>{post.type === 'prayer' ? <><HeartHandshake size={14} /> {post.responseCount} praying</> : <><span className="amen-dots">✳</span> {post.amenCount} Amens</>}</span><button onClick={() => setCommentOpen((open) => !open)}>{post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}</button></div>
      <div className="post-actions">
        <button className={post.amenedByMe ? 'action-on' : ''} onClick={() => void amen()} aria-pressed={post.amenedByMe}><span className="amen-icon">✳</span><span>{post.amenedByMe ? 'Amen’d' : 'Amen'}</span></button>
        {post.type === 'prayer' && <button className={post.prayedByMe ? 'action-on prayer-on' : ''} onClick={() => void pray()} aria-pressed={post.prayedByMe}><HeartHandshake size={17} /><span>{post.prayedByMe ? 'Praying' : 'I’m praying'}</span></button>}
        <button onClick={() => setCommentOpen((open) => !open)} aria-expanded={commentOpen}><MessageCircle size={17} /><span>Comment</span></button>
        <button className="action-share" onClick={() => void sharePost()}><Share2 size={16} /><span>Share</span></button>
        <button className={`action-save ${post.savedByMe ? 'action-on' : ''}`} onClick={() => void save()} aria-label={post.savedByMe ? 'Unsave post' : 'Save post'} aria-pressed={post.savedByMe}><Bookmark size={17} fill={post.savedByMe ? 'currentColor' : 'none'} /></button>
      </div>
      {commentOpen && <div className="comments-panel"><div className="comment-list">{post.comments.length === 0 ? <p className="comments-empty">A little kindness starts the conversation.</p> : post.comments.map((item) => { const commenter = snapshot.users.find((user) => user.id === item.authorId); return <div className="comment-item" key={item.id}><Avatar user={commenter} size="sm" /><p><strong>{commenter?.displayName ?? 'Community member'}</strong><span>{item.body}</span></p></div>; })}</div><form className="comment-form" onSubmit={(event) => void submitComment(event)}><Avatar user={currentUser} size="sm" /><label className="sr-only" htmlFor={`comment-${post.id}`}>Write a comment</label><input id={`comment-${post.id}`} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a thoughtful reply…" maxLength={280} /><button aria-label="Send comment" disabled={!comment.trim()}><Send size={16} /></button></form></div>}
      {reportOpen && <SafetyDialog targetId={post.id} targetType="post" onClose={() => setReportOpen(false)} />}
    </article>
  );
}
