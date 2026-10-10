import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, HeartHandshake, Sparkles } from 'lucide-react';
import { useKoinogram } from '../app/AppProvider';
import { BrandMark } from '../components/Brand';
import { Avatar } from '../components/Avatar';
import { gsap } from 'gsap';

function AuthFrame({ eyebrow, title, copy, children, footer }: { eyebrow: string; title: string; copy: string; children: ReactNode; footer: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => gsap.fromTo('.auth-form-wrap', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .38, ease: 'power2.out' }), root);
    return () => context.revert();
  }, []);
  return <main className="auth-page" ref={root}><aside className="auth-aside"><BrandMark light /><div className="auth-aside-copy"><span className="auth-orbit">✳</span><span className="eyebrow">A LITTLE ROOM FOR WHAT MATTERS</span><h2>Faith is a journey.<br /><em>Let’s walk together.</em></h2><p>A space for honest questions, quiet prayers, and friendships that make the journey feel less like yours alone.</p><div className="auth-aside-foot"><span>✳</span> Come as you are. Grow at your own pace.</div></div><div className="auth-aside-footer">Koinogram <span>·</span> people first, always</div></aside><section className="auth-main"><div className="auth-mobile-brand"><BrandMark /></div><div className="auth-form-wrap"><Link to="/" className="back-link"><ArrowLeft size={15} /> Back to Koinogram</Link><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="auth-intro">{copy}</p>{children}<p className="auth-footer">{footer}</p><p className="auth-mock-note"><span className="status-dot" /> Demo mode — no real account is created or verified.</p></div></section></main>;
}

export function LoginPage() {
  const { services, run, notify } = useKoinogram();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (!email.includes('@') || password.length < 8) { setError('Enter a valid email and a password of at least 8 characters.'); return; }
    try { await run(() => services.auth.signIn(email, password)); notify('You’re back in the demo. Glad you’re here.'); navigate('/app'); }
    catch { setError('We couldn’t continue. Check your details and try again.'); }
  }
  return <AuthFrame eyebrow="GOOD TO SEE YOU AGAIN" title="Welcome back." copy="Your people and your conversations are right where you left them." footer={<>New around here? <Link to="/signup">Find your place</Link></>}><form className="auth-form" onSubmit={(event) => void submit(event)}><label className="field-label" htmlFor="login-email">Email address</label><input className="field-input" id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><div className="field-label-row"><label className="field-label" htmlFor="login-password">Password</label><Link to="/reset-password">Forgot password?</Link></div><input className="field-input" id="login-password" type="password" autoComplete="current-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary button-full">Log in <ArrowRight size={16} /></button><div className="auth-separator"><span>or take a look around</span></div><Link to="/app" className="button button-outline button-full">Explore the demo <ArrowRight size={16} /></Link></form></AuthFrame>;
}

export function SignupPage() {
  const { services, run, notify } = useKoinogram();
  const navigate = useNavigate();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [accepted, setAccepted] = useState(false); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (name.trim().length < 2 || !email.includes('@') || password.length < 8 || !accepted) { setError('Add your name, a valid email, a password of at least 8 characters, and accept the community guidelines.'); return; }
    try { await run(() => services.auth.signUp(name, email, password)); notify('Your demo profile is ready to shape.'); navigate('/onboarding'); }
    catch { setError('We couldn’t continue. Please check each field and try again.'); }
  }
  return <AuthFrame eyebrow="A PLACE AT THE TABLE" title="Come as you are." copy="A few details to get started. You can choose what to share with others as you go." footer={<>Already part of the community? <Link to="/login">Log in</Link></>}><form className="auth-form" onSubmit={(event) => void submit(event)}><label className="field-label" htmlFor="signup-name">Your name</label><input className="field-input" id="signup-name" autoComplete="name" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" /><label className="field-label" htmlFor="signup-email">Email address</label><input className="field-input" id="signup-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><label className="field-label" htmlFor="signup-password">Create a password</label><input className="field-input" id="signup-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /><label className="checkbox-row"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>I agree to the <Link to="/faith">Statement of Faith</Link> and <Link to="/guidelines">Community Guidelines</Link>.</span></label>{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary button-full">Create your account <ArrowRight size={16} /></button></form></AuthFrame>;
}

export function ResetPasswordPage() {
  const { services, run } = useKoinogram();
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); try { await run(() => services.auth.requestPasswordReset(email)); setSent(true); } catch { setError('Enter a valid email address to continue.'); } }
  return <AuthFrame eyebrow="A FRESH START" title={sent ? 'Check your inbox.' : 'Forgot your password?'} copy={sent ? 'In a connected product, a reset link would arrive by email. This demo doesn’t send messages.' : 'It happens. Share the email you used and we’ll help you find your way back.'} footer={<>Remembered it? <Link to="/login">Back to log in</Link></>}><form className="auth-form" onSubmit={(event) => void submit(event)}>{sent ? <div className="success-note"><span><Check size={18} /></span><p>Reset request recorded in demo mode for <strong>{email}</strong>. No email was sent.</p></div> : <><label className="field-label" htmlFor="reset-email">Email address</label><input className="field-input" id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary button-full">Continue <ArrowRight size={16} /></button></>}</form></AuthFrame>;
}

const traditions = ['Anglican', 'Baptist', 'Catholic', 'Lutheran', 'Methodist', 'Orthodox', 'Pentecostal', 'Presbyterian', 'Other', 'Prefer not to say'];
const interests = ['Scripture', 'Prayer', 'Worship', 'Community', 'Faith & work', 'Service', 'Wellbeing', 'Creation care', 'Questions & doubt', 'Music'];

export function OnboardingPage() {
  const { snapshot, currentUser, services, run, notify } = useKoinogram();
  const navigate = useNavigate();
  const motionRoot = useRef<HTMLElement>(null);
  const [step, setStep] = useState(1); const [tradition, setTradition] = useState(currentUser.tradition || ''); const [other, setOther] = useState(''); const [selected, setSelected] = useState<string[]>(currentUser.interests ?? []); const [ackFaith, setAckFaith] = useState(false); const [ackGuidelines, setAckGuidelines] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => gsap.fromTo('.onboarding-step', { autoAlpha: 0, x: 8 }, { autoAlpha: 1, x: 0, duration: .28, ease: 'power1.out' }), motionRoot);
    return () => context.revert();
  }, [step]);
  function toggleInterest(item: string) { setSelected((items) => items.includes(item) ? items.filter((value) => value !== item) : [...items, item]); }
  async function finish() {
    if (!ackFaith || !ackGuidelines) { setError('Please acknowledge both community documents before continuing.'); setStep(2); return; }
    const displayTradition = tradition === 'Other' && other.trim() ? `Other · ${other.trim()}` : tradition;
    await run(() => services.profiles.updateCurrentProfile({ displayName: currentUser.displayName, bio: currentUser.bio, tradition: displayTradition, interests: selected }));
    notify('A few good places to grow are waiting for you.'); navigate('/app');
  }
  return <main className="onboarding-page"><header><Link to="/" className="back-link"><ArrowLeft size={15} /> Koinogram</Link><span className="onboarding-demo"><span className="status-dot" /> Demo onboarding</span></header><section className="onboarding-card" ref={motionRoot}><div className="step-indicator"><span className="step-mark">✳</span><span>STEP {step} OF 3</span><div className="step-track"><i style={{ width: `${step * 33.333}%` }} /></div></div>{step === 1 && <div className="onboarding-step"><span className="eyebrow">YOUR FAITH STORY IS YOURS</span><h1>What tradition feels like home?</h1><p className="auth-intro">This helps us suggest welcoming spaces. It’s optional, and it never determines what you believe.</p><label className="field-label" htmlFor="tradition">Christian tradition or denomination</label><select id="tradition" className="field-input" value={tradition} onChange={(event) => setTradition(event.target.value)}><option value="">Choose if you’d like</option>{traditions.map((item) => <option key={item}>{item}</option>)}</select>{tradition === 'Other' && <div className="other-field"><label className="field-label" htmlFor="tradition-other">Share a little more <span>Optional</span></label><input id="tradition-other" className="field-input" value={other} onChange={(event) => setOther(event.target.value)} placeholder="A tradition, community, or your own words" /></div>}<div className="privacy-inline"><HeartHandshake size={16} /><span>This is personal information. You choose how it appears on your profile.</span></div><div className="wizard-actions"><button className="button button-quiet" onClick={() => setStep(2)}>Skip for now</button><button className="button button-primary" onClick={() => setStep(2)}>Continue <ArrowRight size={15} /></button></div></div>}
      {step === 2 && <div className="onboarding-step"><span className="eyebrow">FOLLOW WHAT GIVES YOU LIFE</span><h1>What are you curious about?</h1><p className="auth-intro">Pick any that speak to you. You can always change these later.</p><div className="interest-grid">{interests.map((item) => <button key={item} className={`interest-chip ${selected.includes(item) ? 'selected' : ''}`} onClick={() => toggleInterest(item)} aria-pressed={selected.includes(item)}>{selected.includes(item) && <Check size={14} />}{item}</button>)}</div><div className="acknowledgements"><label className="checkbox-row"><input type="checkbox" checked={ackFaith} onChange={(event) => setAckFaith(event.target.checked)} /><span>I’ve read and acknowledge the <Link to="/faith" target="_blank">Statement of Faith</Link>.</span></label><label className="checkbox-row"><input type="checkbox" checked={ackGuidelines} onChange={(event) => setAckGuidelines(event.target.checked)} /><span>I’ve read and agree to the <Link to="/guidelines" target="_blank">Community Guidelines</Link>.</span></label></div>{error && <p className="field-error" role="alert">{error}</p>}<div className="wizard-actions"><button className="button button-quiet" onClick={() => { setError(''); setStep(1); }}><ChevronLeft size={15} /> Back</button><button className="button button-primary" onClick={() => { if (!ackFaith || !ackGuidelines) { setError('Please acknowledge both community documents.'); return; } setError(''); setStep(3); }}>Continue <ArrowRight size={15} /></button></div></div>}
      {step === 3 && <div className="onboarding-step"><span className="eyebrow">A FEW GOOD PLACES TO BEGIN</span><h1>Meet your community.</h1><p className="auth-intro">A few people and circles to get conversations started. Follow or join only what feels right.</p><div className="onboarding-suggestions"><div className="suggestion-list">{snapshot.users.filter((user) => !user.isCurrentUser).slice(0, 3).map((user) => <Link key={user.id} to={`/app/people/${user.id}`} className="suggestion-person"><Avatar user={user} size="md" /><span><strong>{user.displayName}</strong><small>{user.interests.slice(0, 2).join(' · ')}</small></span><span className="suggestion-plus">+</span></Link>)}</div>{snapshot.communities.slice(0, 2).map((group) => <div className="suggestion-group" key={group.id}><span className="community-monogram">{group.name[0]}</span><span><strong>{group.name}</strong><small>{group.memberCount.toLocaleString()} members</small></span></div>)}</div><div className="wizard-actions"><button className="button button-quiet" onClick={() => { setError(''); setStep(2); }}><ChevronLeft size={15} /> Back</button><button className="button button-primary" onClick={() => void finish()}>Step into the community <ArrowRight size={15} /></button></div></div>}
      <p className="onboarding-foot"><Sparkles size={14} /> Your profile is always yours to shape.</p></section></main>;
}
