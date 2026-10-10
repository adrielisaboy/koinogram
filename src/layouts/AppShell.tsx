import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { Bookmark, Compass, House, Menu, PenLine, Search, Settings, ShieldCheck, Users, Bell, ChevronRight } from 'lucide-react';
import { useKoinogram } from '../app/AppProvider';
import { Avatar } from '../components/Avatar';
import { BrandMark } from '../components/Brand';

const navigation = [
  { label: 'Home', to: '/app', icon: House, end: true },
  { label: 'Explore', to: '/app/explore', icon: Compass },
  { label: 'Communities', to: '/app/communities', icon: Users },
  { label: 'Notifications', to: '/app/notifications', icon: Bell, badge: true },
  { label: 'Saved', to: '/app/saved', icon: Bookmark },
];

export function AppShell() {
  const { snapshot, currentUser } = useKoinogram();
  const location = useLocation();
  const unread = snapshot.notifications.filter((item) => !item.read).length;
  const isProfile = location.pathname.includes('/people/');
  const title = isProfile ? 'Your profile' : navigation.find((item) => item.to === location.pathname)?.label ?? (location.pathname.includes('create') ? 'Create a post' : 'Your community');

  return (
    <div className="app-shell">
      <aside className="side-rail" aria-label="Main navigation">
        <BrandMark />
        <div className="rail-label">YOUR SPACE</div>
        <nav className="rail-nav">
          {navigation.map(({ label, to, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `rail-link ${isActive ? 'is-active' : ''}`}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>{badge && unread > 0 && <span className="nav-badge">{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/app/create" className="rail-create"><PenLine size={17} /> Share something</NavLink>
        <div className="rail-spacer" />
        <div className="rail-help-card"><span className="help-spark">✳</span><strong>Faith grows better together.</strong><span>Find your people, one conversation at a time.</span><Link to="/app/communities">Explore community <ChevronRight size={14} /></Link></div>
        <NavLink to="/app/safety" className="rail-link rail-safety"><ShieldCheck size={18} /><span>Safety & support</span></NavLink>
        <NavLink to="/app/settings" className="rail-link"><Settings size={18} /><span>Settings</span></NavLink>
        <Link to={`/app/people/${currentUser.id}`} className="rail-profile"><Avatar user={currentUser} size="sm" /><span><strong>{currentUser.displayName}</strong><small>@{currentUser.handle}</small></span><Menu size={17} /></Link>
        <div className="mock-rail-label"><span className="status-dot" />Demo mode · sample data</div>
      </aside>

      <div className="mobile-topbar"><BrandMark compact /><span className="mobile-page-title">{title}</span><Link to="/app/settings" className="icon-button" aria-label="Settings"><Settings size={19} /></Link><Link to="/app/notifications" className="icon-button" aria-label="Notifications"><Bell size={19} />{unread > 0 && <i className="tiny-unread" />}</Link></div>

      <main className="app-main">
        <header className="app-topbar">
          <div><span className="eyebrow">THURSDAY, OCTOBER 8</span><h1>{title}</h1></div>
          <div className="topbar-actions"><Link to="/app/explore" className="search-shortcut"><Search size={16} /><span>Find something good</span><kbd>/</kbd></Link><Link to={`/app/people/${currentUser.id}`} className="topbar-avatar"><Avatar user={currentUser} size="sm" /></Link></div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>

      <aside className="right-rail" aria-label="Community highlights">
        <div className="rail-note"><div className="note-ornament">✳</div><span className="eyebrow">A MOMENT TO REFLECT</span><p>“Be still, and know that I am God.”</p><small>Psalm 46:10 · NRSVUE</small></div>
        <section className="rail-section"><div className="rail-section-title"><span>Good places to grow</span><Link to="/app/communities">See all</Link></div>{snapshot.communities.slice(0, 3).map((community) => <Link key={community.id} to={`/app/community/${community.id}`} className="mini-community"><span className="community-monogram">{community.name.slice(0, 1)}</span><span><strong>{community.name}</strong><small>{community.memberCount.toLocaleString()} members</small></span><ChevronRight size={15} /></Link>)}</section>
        <section className="rail-section"><div className="rail-section-title"><span>People you may like</span><Link to="/app/explore">Discover</Link></div>{snapshot.users.filter((user) => !user.isCurrentUser).slice(0, 3).map((user) => <Link key={user.id} to={`/app/people/${user.id}`} className="mini-person"><Avatar user={user} size="sm" /><span><strong>{user.displayName}</strong><small>Interested in {user.interests[0]?.toLowerCase() ?? 'community'}</small></span><ChevronRight size={15} /></Link>)}</section>
        <footer className="right-foot"><Link to="/faith">Our faith</Link><span>·</span><Link to="/guidelines">Guidelines</Link><span>·</span><Link to="/app/safety">Help</Link><p>Made for the moments that matter.</p></footer>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 5).map(({ label, to, icon: Icon, end }) => <NavLink key={to} to={to} end={end} aria-label={label} className={({ isActive }) => `mobile-nav-item ${isActive ? 'is-active' : ''}`}><Icon size={21} strokeWidth={1.8} /><span>{label}</span></NavLink>)}
        <Link to="/app/create" className="mobile-compose" aria-label="Create a post"><PenLine size={20} /></Link>
      </nav>
    </div>
  );
}
