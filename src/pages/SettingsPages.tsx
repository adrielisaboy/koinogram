import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Check, ChevronRight, HeartHandshake, LockKeyhole, LogOut, Moon, ShieldAlert, ShieldCheck, Sun, UserRound, Users } from 'lucide-react';
import { useKoinogram } from '../app/AppProvider';
import { Avatar } from '../components/Avatar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import type { Report } from '../types/domain';

export function SettingsPage() {
  const { snapshot, currentUser, services, run, notify } = useKoinogram();
  async function toggleEmails() {
    await run(() => services.settings.updateEmailNotifications(!snapshot.emailNotifications));
    notify(snapshot.emailNotifications ? 'Email notification preference turned off in demo.' : 'Email notification preference turned on in demo.');
  }
  async function setAppearance(appearance: 'light' | 'dark') {
    if (appearance === snapshot.appearance) return;
    await run(() => services.settings.updateAppearance(appearance));
    notify(`${appearance === 'dark' ? 'Dark' : 'Light'} appearance enabled for this demo.`);
  }
  async function signOut() { await run(() => services.auth.signOut()); notify('You have signed out of the demo session.'); }

  return (
    <div className="settings-page">
      <div className="settings-intro"><span className="eyebrow">YOUR SPACE, YOUR CHOICES</span><h2>Account & settings.</h2><p>Make this space feel like yours, and choose how you want to be here.</p></div>
      <Link to={`/app/people/${currentUser.id}`} className="settings-profile-card"><Avatar user={currentUser} size="lg" /><span><strong>{currentUser.displayName}</strong><small>@{currentUser.handle} · View your profile</small></span><ChevronRight size={17} /></Link>
      <div className="settings-group"><span className="eyebrow">YOUR ACCOUNT</span>
        <Link to={`/app/people/${currentUser.id}`} className="settings-row"><span className="settings-icon"><UserRound size={18} /></span><span><strong>Profile details</strong><small>Your name, bio, interests, and faith tradition</small></span><ChevronRight size={17} /></Link>
        <Link to="/app/settings/privacy" className="settings-row"><span className="settings-icon"><LockKeyhole size={18} /></span><span><strong>Privacy & visibility</strong><small>Choose who sees your profile and prayer requests</small></span><ChevronRight size={17} /></Link>
        <div className="settings-row"><span className="settings-icon"><Bell size={18} /></span><span><strong>Email updates</strong><small>Occasional community highlights</small></span><button className={`toggle-switch ${snapshot.emailNotifications ? 'toggle-on' : ''}`} role="switch" aria-checked={snapshot.emailNotifications} aria-label="Email notification updates" onClick={() => void toggleEmails()}><span /></button></div>
        <Link to="/app/safety" className="settings-row"><span className="settings-icon"><ShieldCheck size={18} /></span><span><strong>Safety & support</strong><small>Block, mute, report, and get help</small></span><ChevronRight size={17} /></Link>
        <Link to="/app/moderation" className="settings-row"><span className="settings-icon"><ShieldAlert size={18} /></span><span><strong>Moderation preview</strong><small>Sample review tools — no real moderators are connected</small></span><ChevronRight size={17} /></Link>
      </div>
      <section className="settings-group appearance-group" aria-labelledby="appearance-label">
        <span className="eyebrow" id="appearance-label">APPEARANCE</span>
        <p className="appearance-help">Choose the light, open look or a quieter dark palette. This preference is stored locally in the demo.</p>
        <div className="appearance-options" role="radiogroup" aria-label="Color appearance">
          <button type="button" role="radio" aria-checked={snapshot.appearance === 'light'} className={`appearance-option ${snapshot.appearance === 'light' ? 'is-selected' : ''}`} onClick={() => void setAppearance('light')}><Sun size={18} /><span><strong>Light</strong><small>Open & welcoming</small></span>{snapshot.appearance === 'light' && <Check className="appearance-check" size={17} />}</button>
          <button type="button" role="radio" aria-checked={snapshot.appearance === 'dark'} className={`appearance-option ${snapshot.appearance === 'dark' ? 'is-selected' : ''}`} onClick={() => void setAppearance('dark')}><Moon size={18} /><span><strong>Dark</strong><small>Quiet after hours</small></span>{snapshot.appearance === 'dark' && <Check className="appearance-check" size={17} />}</button>
        </div>
      </section>
      <div className="settings-group settings-legal"><span className="eyebrow">OUR COMMUNITY</span><Link to="/faith" className="settings-row"><span className="settings-icon"><HeartHandshake size={18} /></span><span><strong>Statement of Faith</strong><small>Shared foundations, held with humility</small></span><ChevronRight size={17} /></Link><Link to="/guidelines" className="settings-row"><span className="settings-icon"><Users size={18} /></span><span><strong>Community Guidelines</strong><small>How we make space for one another</small></span><ChevronRight size={17} /></Link></div>
      <button className="settings-signout" onClick={() => void signOut()}><LogOut size={16} /> Sign out of this demo</button>
      <p className="settings-note">Demo only: settings stay on this device. Account security, real email, and privacy enforcement require a backend.</p>
    </div>
  );
}

export function PrivacyPage() {
  const { snapshot, services, run, notify } = useKoinogram();
  async function savePrivacy(nextProfile: 'public' | 'followers', nextPrayer: 'public' | 'followers' | 'private') { await run(() => services.settings.updatePrivacy(nextProfile, nextPrayer)); notify('Your demo privacy preferences were saved.'); }
  return <div className="settings-page"><Link to="/app/settings" className="back-link">← Settings</Link><div className="settings-intro"><span className="eyebrow">YOUR STORY, YOUR SAY</span><h2>Privacy & visibility.</h2><p>Choose what feels right. These controls demonstrate the experience; backend access rules are essential before production.</p></div><section className="privacy-setting-card"><span className="settings-icon"><UserRound size={18} /></span><div><h3>Profile visibility</h3><p>Who can discover your profile and interests?</p><div className="radio-choice-list"><label><input type="radio" name="profile-visibility" checked={snapshot.profileVisibility === 'public'} onChange={() => void savePrivacy('public', snapshot.prayerDefaultVisibility)} /><span><strong>Public</strong><small>Visible to the wider community</small></span></label><label><input type="radio" name="profile-visibility" checked={snapshot.profileVisibility === 'followers'} onChange={() => void savePrivacy('followers', snapshot.prayerDefaultVisibility)} /><span><strong>People who follow you</strong><small>A smaller circle, on your terms</small></span></label></div></div></section><section className="privacy-setting-card"><span className="settings-icon settings-icon-heart"><HeartHandshake size={18} /></span><div><h3>Prayer request default</h3><p>New requests start with the audience you choose. You can still change each post before sharing.</p><div className="radio-choice-list">{([{ value: 'followers', label: 'Followers only', note: 'A more personal circle' }, { value: 'private', label: 'Only me', note: 'Keep it as a private reflection' }, { value: 'public', label: 'Everyone', note: 'Visible across the community' }] as const).map((choice) => <label key={choice.value}><input type="radio" name="prayer-default" checked={snapshot.prayerDefaultVisibility === choice.value} onChange={() => void savePrivacy(snapshot.profileVisibility, choice.value)} /><span><strong>{choice.label}</strong><small>{choice.note}</small></span></label>)}</div></div></section><div className="privacy-warning"><LockKeyhole size={16} /><p><strong>For this preview only.</strong> Sample preferences are stored locally and do not protect real prayer or profile data. A production backend must verify access on every request.</p></div><div className="privacy-links"><Link to="/app/safety">Manage blocked & muted people <ArrowRight size={15} /></Link><Link to="/guidelines">Read our community promise <ArrowRight size={15} /></Link></div></div>;
}

export function SafetyPage() {
  const { snapshot, services, run, notify } = useKoinogram();
  const [pending, setPending] = useState<{ userId: string; name: string; action: 'unblock' | 'unmute' } | null>(null);
  async function confirm() { if (!pending) return; await run(() => pending.action === 'unblock' ? services.moderation.unblock(pending.userId) : services.moderation.unmute(pending.userId)); notify(`${pending.name} is no longer ${pending.action === 'unblock' ? 'blocked' : 'muted'} in this demo.`); setPending(null); }
  const blocked = snapshot.users.filter((user) => snapshot.blockedUserIds.includes(user.id));
  const muted = snapshot.users.filter((user) => snapshot.mutedUserIds.includes(user.id));
  return <div className="settings-page"><div className="settings-intro"><span className="eyebrow">CARE GOES BOTH WAYS</span><h2>Safety & support.</h2><p>Choose what you see, what you share, and when you need a little space.</p></div><section className="safety-card"><span className="settings-icon"><ShieldCheck size={18} /></span><div><h3>Report a concern</h3><p>Open the report action from any post or profile. In this preview, reports are sample data only.</p><Link to="/app" className="text-link">Visit the feed <ArrowRight size={14} /></Link></div></section><section className="settings-group"><span className="eyebrow">BLOCKED PEOPLE</span>{blocked.length ? blocked.map((user) => <div className="safety-person-row" key={user.id}><Avatar user={user} size="sm" /><span><strong>{user.displayName}</strong><small>Blocked on this demo profile</small></span><button className="button button-outline button-small" onClick={() => setPending({ userId: user.id, name: user.displayName, action: 'unblock' })}>Unblock</button></div>) : <p className="settings-empty">No one is blocked. You can block a person from their profile menu.</p>}</section><section className="settings-group"><span className="eyebrow">MUTED PEOPLE</span>{muted.length ? muted.map((user) => <div className="safety-person-row" key={user.id}><Avatar user={user} size="sm" /><span><strong>{user.displayName}</strong><small>Muted on this demo profile</small></span><button className="button button-outline button-small" onClick={() => setPending({ userId: user.id, name: user.displayName, action: 'unmute' })}>Unmute</button></div>) : <p className="settings-empty">No one is muted. Muting hides their posts from your demo feed.</p>}</section><div className="safety-emergency"><ShieldAlert size={17} /><span><strong>Need immediate help?</strong><small>Koinogram is not an emergency or crisis service. If someone is in immediate danger, contact local emergency services.</small></span></div>{pending && <ConfirmDialog title={`${pending.action === 'unblock' ? 'Unblock' : 'Unmute'} ${pending.name}?`} body="This updates only your local demo preferences. The person is not notified." confirmLabel={pending.action === 'unblock' ? 'Unblock person' : 'Unmute person'} onClose={() => setPending(null)} onConfirm={confirm} />}</div>;
}

export function ModerationPage() {
  const { snapshot, services, run, notify } = useKoinogram();
  const reports = snapshot.reports;
  async function setStatus(report: Report, status: Report['status']) { await run(() => services.moderation.updateReportStatus(report.id, status)); notify(status === 'reviewing' ? 'Report moved to review in demo data.' : 'Report marked resolved in demo data.'); }
  return <div className="settings-page"><div className="moderation-callout"><ShieldAlert size={19} /><div><strong>Interface preview only</strong><p>This screen does not grant moderator privileges or enforce real access control. A secure backend and trained review process are required for production.</p></div></div><div className="settings-intro"><span className="eyebrow">MODERATION WORKSPACE</span><h2>Careful review.</h2><p>Sample reports from this demo appear here to show a future moderation flow.</p></div>{reports.length === 0 ? <EmptyState icon={<ShieldCheck size={23} />} title="No reports in the sample queue." copy="When a report is submitted in this demo, it will appear here as local sample data. Nothing is sent to a real moderator." action={<Link to="/app" className="button button-outline">Return to feed</Link>} /> : <div className="moderation-list">{reports.map((report) => <article className="moderation-item" key={report.id}><div className="moderation-item-top"><span className={`moderation-status status-${report.status}`}>{report.status}</span><span>{new Date(report.createdAt).toLocaleString()}</span></div><h3>{report.reason}</h3><p>{report.details || 'No additional detail provided.'}</p><small>Target: {report.targetType} · Sample ID {report.targetId}</small><div className="moderation-actions"><button className="button button-outline button-small" onClick={() => void setStatus(report, 'reviewing')}>Mark reviewing</button><button className="button button-primary button-small" onClick={() => void setStatus(report, 'resolved')}>Resolve sample report</button></div></article>)}</div>}<div className="privacy-footnote"><ShieldCheck size={14} /><span>Production moderation still needs server-side roles, review queues, audit logs, escalation paths, and enforcement rules.</span></div></div>;
}
