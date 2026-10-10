import { useEffect, useState } from 'react';
import { BookOpen, Compass, Search, Sparkles, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKoinogram } from '../app/AppProvider';
import { Avatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { CommunityCard } from '../components/CommunityCard';
import { EmptyState } from '../components/EmptyState';
import type { User } from '../types/domain';

const categories = ['all', 'people', 'posts', 'communities', 'topics'] as const;
type Category = typeof categories[number];
const suggestions = ['prayer', 'Scripture', 'community', 'faith & work'];

export function ExplorePage() {
  const { services, snapshot } = useKoinogram();
  const [query, setQuery] = useState(''); const [category, setCategory] = useState<Category>('all');
  const [results, setResults] = useState<{ users: User[]; posts: typeof snapshot.posts; communities: typeof snapshot.communities }>({ users: [], posts: [], communities: [] });
  const [loading, setLoading] = useState(false); const [searched, setSearched] = useState(false);
  useEffect(() => {
    if (!query.trim()) { setResults({ users: [], posts: [], communities: [] }); setSearched(false); return; }
    const timer = window.setTimeout(() => {
      setLoading(true); setSearched(true);
      void services.search.search(query, category).then(setResults).catch(() => setResults({ users: [], posts: [], communities: [] })).finally(() => setLoading(false));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query, category, services]);
  const count = results.users.length + results.posts.length + results.communities.length;
  return <div className="explore-page"><div className="explore-header"><span className="eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span><h2>Find something good.</h2><p>People, conversations, and places to grow — all in one gentle search.</p></div><div className="explore-search"><Search size={19} /><label className="sr-only" htmlFor="explore-query">Search people, posts, topics, and communities</label><input id="explore-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘prayer’, ‘Scripture’, or a name…" /><kbd>/</kbd>{query && <button className="icon-button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}</div><div className="search-categories" role="tablist" aria-label="Search category">{categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? 'filter-tab active' : 'filter-tab'} onClick={() => setCategory(item)}>{item === 'all' ? 'All' : item === 'topics' ? 'Topics' : `${item[0].toUpperCase()}${item.slice(1)}`}</button>)}</div>
  {!query.trim() ? <div className="explore-discovery"><div className="discovery-prompt"><span className="discovery-spark">✳</span><div><span className="eyebrow">A PLACE TO BEGIN</span><h3>What’s on your mind?</h3><p>Tap a thought to see where it takes you.</p></div></div><div className="suggestion-chips">{suggestions.map((term) => <button key={term} onClick={() => setQuery(term)}><Search size={13} />{term}</button>)}</div><div className="explore-sections"><section><div className="section-title-row"><h3>Communities to explore</h3><span>For every kind of growth</span></div><div className="community-grid explore-community-grid">{snapshot.communities.slice(0, 3).map((community) => <CommunityCard key={community.id} community={community} />)}</div></section><section><div className="section-title-row"><h3>People you might like</h3><span>Stories are better shared</span></div><div className="people-suggestion-grid">{snapshot.users.filter((user) => !user.isCurrentUser).slice(0, 4).map((user) => <Link to={`/app/people/${user.id}`} key={user.id} className="people-suggestion"><Avatar user={user} size="lg" /><strong>{user.displayName}</strong><small>@{user.handle}</small><span>{user.interests.slice(0, 2).join(' · ')}</span></Link>)}</div></section></div></div> : <div className="search-results"><div className="search-results-heading"><span className="eyebrow">{loading ? 'LOOKING AROUND…' : searched ? `${count} ${count === 1 ? 'MOMENT' : 'MOMENTS'} FOUND` : ''}</span><h3>Results for <em>“{query}”</em></h3></div>{loading && <div className="feed-loading"><span className="spinner" />Finding thoughtful connections…</div>}{!loading && count === 0 && <EmptyState icon={<Compass size={23} />} title="Nothing just yet." copy="Try a shorter phrase, a different filter, or browse a suggested topic." action={<button className="button button-outline" onClick={() => setQuery('')}>See suggestions</button>} />}{!loading && results.users.length > 0 && <section className="results-group"><div className="section-title-row"><h3><Users size={17} /> People</h3><span>{results.users.length} found</span></div><div className="results-people">{results.users.map((user) => <Link to={`/app/people/${user.id}`} key={user.id} className="result-person"><Avatar user={user} size="md" /><span><strong>{user.displayName}</strong><small>@{user.handle} · {user.bio}</small></span><span className="result-arrow">↗</span></Link>)}</div></section>}{!loading && results.communities.length > 0 && <section className="results-group"><div className="section-title-row"><h3><Users size={17} /> Communities</h3><span>{results.communities.length} found</span></div><div className="community-grid">{results.communities.map((community) => <CommunityCard key={community.id} community={community} />)}</div></section>}{!loading && results.posts.length > 0 && <section className="results-group"><div className="section-title-row"><h3><BookOpen size={17} /> Posts & topics</h3><span>{results.posts.length} found</span></div>{results.posts.map((post) => <PostCard key={post.id} post={post} />)}</section>}{!loading && count > 0 && <div className="search-hint"><Sparkles size={15} /> Search results are sample community content in mock mode.</div>}</div>}</div>;
}
