import { Link } from 'react-router-dom';
import { ArrowUpRight, Users } from 'lucide-react';
import type { Community } from '../types/domain';
import { useKoinogram } from '../app/AppProvider';

export function CommunityCard({ community }: { community: Community }) {
  const { services, run, notify } = useKoinogram();
  async function toggle() { await run(() => services.communities.toggleMembership(community.id)); notify(community.joined ? `You left ${community.name}.` : `You joined ${community.name}.`); }
  return <article className="community-card"><div className={`community-art art-${community.id.slice(-2)}`}><span>{community.name.split(/\s+/).map((word) => word[0]).slice(0, 2).join('')}</span><small>{community.category}</small></div><div className="community-card-body"><Link to={`/app/community/${community.id}`} className="community-title-link"><h3>{community.name}</h3><ArrowUpRight size={15} /></Link><p>{community.description}</p><div className="community-card-foot"><span><Users size={14} />{community.memberCount.toLocaleString()}</span><button className={`button button-small ${community.joined ? 'button-outline' : 'button-primary'}`} onClick={() => void toggle()}>{community.joined ? 'Joined' : 'Join'}</button></div></div></article>;
}
