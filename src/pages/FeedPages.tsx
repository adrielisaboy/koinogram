import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Camera, ChevronDown, FileImage, HeartHandshake, ImagePlus, LockKeyhole, PenLine, Play, Sparkles, UsersRound } from 'lucide-react';
import { useKoinogram } from '../app/AppProvider';
import { Avatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { EmptyState } from '../components/EmptyState';
import type { CreatePostInput, PostType, Visibility } from '../types/domain';
import { gsap } from 'gsap';

const types: { value: PostType; label: string; icon: typeof PenLine }[] = [
  { value: 'text', label: 'Thought', icon: PenLine },
  { value: 'verse', label: 'Scripture', icon: BookOpen },
  { value: 'testimony', label: 'Story', icon: Sparkles },
  { value: 'prayer', label: 'Prayer', icon: HeartHandshake },
  { value: 'image', label: 'Photo', icon: Camera },
  { value: 'video', label: 'Video', icon: Play },
];

export function FeedPage() {
  const { snapshot, currentUser, services } = useKoinogram();
  const [filter, setFilter] = useState<'all' | 'following' | 'prayer'>('all');
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const feedRoot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.fromTo('.post-card', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .42, stagger: .055, ease: 'power2.out' });
    }, feedRoot);
    return () => context.revert();
  }, []);
  const filtered = useMemo(() => snapshot.posts.filter((post) => {
    if (filter === 'prayer') return post.type === 'prayer';
    if (filter === 'following') return post.authorId === currentUser.id || snapshot.users.find((user) => user.id === post.authorId)?.following;
    return true;
  }), [snapshot.posts, snapshot.users, currentUser.id, filter]);

  async function retryFeed() {
    setLoading(true); setLoadError('');
    try { await services.posts.getFeed(); setRetry((value) => value + 1); } catch { setLoadError('Your feed couldn’t load just now. Check your connection and try again.'); }
    finally { setLoading(false); }
  }

  return <div className="feed-layout" ref={feedRoot}><div className="feed-column">
    <section className="greeting-card"><div><span className="eyebrow">A PLACE TO LAND</span><h2>Good to see you, {currentUser.displayName.split(' ')[0]}.</h2><p>What’s on your heart today?</p></div><span className="greeting-flower">✳</span></section>
    <Link to="/app/create" className="quick-compose"><Avatar user={currentUser} size="md" /><span>Share something, whenever you’re ready…</span><span className="compose-attach"><ImagePlus size={17} /><span>Share</span></span></Link>
    <div className="feed-filter-bar" role="tablist" aria-label="Feed filter">{([{ value: 'all', label: 'For you' }, { value: 'following', label: 'Following' }, { value: 'prayer', label: 'Prayer' }] as const).map(({ value, label }) => <button key={value} role="tab" aria-selected={filter === value} className={filter === value ? 'feed-filter-active' : ''} onClick={() => setFilter(value)}>{label}{value === 'prayer' && <HeartHandshake size={14} />}</button>)}</div>
    {loadError && <div className="inline-error" role="alert">{loadError}<button onClick={() => void retryFeed()}>Retry</button></div>}
    {loading && <div className="feed-loading"><span className="spinner" />Finding your community moments…</div>}
    {!loading && filtered.length === 0 && <EmptyState icon={<HeartHandshake size={24} />} title="A little space to begin." copy="No posts here yet. Share an encouraging thought or check in with a friend." action={<Link className="button button-primary" to="/app/create">Share a moment</Link>} />}
    {!loading && filtered.map((post) => <PostCard key={`${retry}-${post.id}`} post={post} />)}
    <div className="feed-endnote"><span>✳</span><p>You’re all caught up.<br /><small>Take a breath. There’s no rush here.</small></p></div>
  </div><aside className="feed-side"><section className="feed-side-card scripture-side"><span className="eyebrow">A MOMENT TO PAUSE</span><span className="side-flower">✳</span><blockquote>“Be still, and know that I am God.”</blockquote><small>Psalm 46:10 · NRSVUE</small><Link to="/app/create">Share a verse <span>↗</span></Link></section><section className="feed-side-card"><div className="side-heading"><span>Growing together</span><Link to="/app/communities">Browse</Link></div>{snapshot.communities.slice(0, 2).map((community) => <Link to={`/app/community/${community.id}`} className="feed-community-link" key={community.id}><span className="community-monogram">{community.name[0]}</span><span><strong>{community.name}</strong><small>{community.memberCount.toLocaleString()} members</small></span></Link>)}</section><div className="gentle-reminder"><HeartHandshake size={16} /><p>Your prayer requests are shared with the audience you choose.</p><Link to="/app/settings/privacy">Review privacy <span>↗</span></Link></div></aside></div>;
}

export function ComposerPage() {
  const { snapshot, currentUser, services, run, notify } = useKoinogram();
  const navigate = useNavigate();
  const [type, setType] = useState<PostType>('text');
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(snapshot.prayerDefaultVisibility);
  const [communityId, setCommunityId] = useState('');
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState('NRSVUE');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [attachment, setAttachment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const limit = type === 'prayer' ? 600 : type === 'testimony' ? 1200 : 800;
  async function pickFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choose an image file. Video uploads will be connected to a backend media service.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Choose an image smaller than 8 MB.'); return; }
    try { const result = await services.media.upload(file); setImageUrl(result.url); setImageAlt(result.alt); setAttachment(file.name); setError(''); }
    catch { setError('That image could not be attached. Try another file.'); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (!text.trim()) { setError('Add a few words before sharing.'); return; }
    if (text.length > limit) { setError(`Keep this under ${limit} characters.`); return; }
    if (type === 'verse' && !reference.trim()) { setError('Add a Scripture reference so people can find the passage.'); return; }
    if (type === 'image' && !imageUrl) { setError('Add a photo before sharing this moment.'); return; }
    if (visibility === 'community' && !communityId) { setError('Choose which community can see this post.'); return; }
    if (type === 'prayer' && visibility === 'public' && !window.confirm('You chose to share this prayer request publicly. Anyone may see it in the demo. Continue?')) return;
    const input: CreatePostInput = { type, text: text.trim(), visibility, communityId: visibility === 'community' ? communityId : undefined, reference: reference.trim(), translation, imageUrl, imageAlt };
    setSubmitting(true);
    try { await run(() => services.posts.create(input)); notify(type === 'prayer' ? 'Your prayer request was shared with the chosen audience.' : 'Your moment has been shared.'); navigate('/app'); }
    catch { setError('Your post couldn’t be shared. Please try again.'); }
    finally { setSubmitting(false); }
  }

  return <div className="composer-page"><div className="composer-main"><div className="composer-heading"><span className="eyebrow">A MOMENT TO SHARE</span><h2>Say what’s on your heart.</h2><p>There’s no perfect way to put it. Your words can make someone feel less alone.</p></div><form className="composer-card" onSubmit={(event) => void submit(event)}><div className="composer-author"><Avatar user={currentUser} size="md" /><span><strong>{currentUser.displayName}</strong><small>Sharing with care</small></span></div><label className="field-label" id="post-kind-label">What would you like to share?</label><div className="post-kind-picker" role="group" aria-labelledby="post-kind-label">{types.map(({ value, label, icon: Icon }) => <button type="button" className={type === value ? 'kind-choice selected' : 'kind-choice'} key={value} aria-pressed={type === value} onClick={() => { setType(value); setError(''); if (value === 'prayer') setVisibility(snapshot.prayerDefaultVisibility); }}><Icon size={16} /><span>{label}</span></button>)}</div>
    {type === 'verse' && <div className="composer-inline-fields"><label><span>Scripture reference</span><input className="field-input" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. Psalm 46:10" required /></label><label><span>Translation</span><select className="field-input" value={translation} onChange={(event) => setTranslation(event.target.value)}><option>NRSVUE</option><option>NIV</option><option>ESV</option><option>KJV</option><option>Other</option></select></label></div>}
    <label className="sr-only" htmlFor="post-text">Your post</label><textarea id="post-text" className="composer-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder={type === 'prayer' ? 'Share what you’d like others to hold in prayer…' : type === 'testimony' ? 'Tell the part of your story you feel ready to share…' : type === 'verse' ? 'What does this passage mean to you today?' : 'What’s on your heart?'} maxLength={limit} rows={6} /><div className="composer-counter">{text.length} / {limit}</div>
    {(type === 'image' || type === 'video' || type === 'verse') && <div className="attachment-box">{imageUrl ? <div className="attachment-preview"><img src={imageUrl} alt={imageAlt || 'Selected post attachment preview'} /><span><FileImage size={15} />{attachment || 'Image attached'}</span><button type="button" onClick={() => { setImageUrl(''); setImageAlt(''); setAttachment(''); }}>Remove</button></div> : <label className="attachment-prompt"><input type="file" accept="image/*" onChange={(event) => void pickFile(event.target.files?.[0])} /><ImagePlus size={18} /><span><strong>{type === 'video' ? 'Choose a thumbnail' : 'Add a photo'}</strong><small>JPG, PNG or WebP · up to 8 MB</small></span><span className="button button-outline button-small">Browse</span></label>}{type === 'video' && <p className="attachment-note">Video playback and uploads need a connected media service. The demo supports a thumbnail preview.</p>}</div>}
    {type === 'prayer' && <div className="prayer-privacy-note"><span><LockKeyhole size={16} /></span><div><strong>Your request deserves care.</strong><p>Choose who can see this. You can change this default in privacy settings.</p></div></div>}
    <div className="composer-options"><label className="field-label" htmlFor="post-visibility">{type === 'prayer' ? 'Who can see this prayer?' : 'Share with'}</label><div className="select-wrap"><select id="post-visibility" className="field-input" value={visibility} onChange={(event) => setVisibility(event.target.value as Visibility)}><option value="public">Everyone · public</option><option value="followers">People who follow you</option><option value="private">Only me · private</option><option value="community">A community</option></select><ChevronDown size={15} /></div>{visibility === 'community' && <><label className="field-label" htmlFor="post-community">Choose a community</label><select id="post-community" className="field-input" value={communityId} onChange={(event) => setCommunityId(event.target.value)}><option value="">Choose a community</option>{snapshot.communities.filter((group) => group.joined).map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></>}<p className="visibility-helper"><LockKeyhole size={13} /> Visibility is an interface preview only; real privacy requires backend access control.</p></div>
    {error && <p className="field-error" role="alert">{error}</p>}<div className="composer-footer"><Link to="/app" className="button button-quiet">Cancel</Link><button className="button button-primary" disabled={submitting}>{submitting ? 'Sharing…' : type === 'prayer' ? 'Share prayer request' : 'Share with care'} <PenLine size={15} /></button></div></form><p className="composer-demo-note"><span className="status-dot" /> Mock mode · your post is saved as local demo data, not sent to a server.</p></div><aside className="composer-side"><div className="composer-promise"><span className="promise-flower">✳</span><span className="eyebrow">A NOTE ON SHARING</span><h3>Keep it kind.<br /><em>Keep it yours.</em></h3><p>Your story is yours to tell. Share at the pace that feels right — and make room for others to do the same.</p><Link to="/guidelines">Community Guidelines <UsersRound size={14} /></Link></div><div className="composer-side-note"><HeartHandshake size={16} /><p>Prayer requests start private by default. Double-check the audience before sharing.</p></div></aside></div>;
}
