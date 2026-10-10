import { useState, type FormEvent } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { useKoinogram } from '../app/AppProvider';
import type { Report } from '../types/domain';

const reasons = ['Harassment or bullying', 'Harmful or unsafe content', 'Spam or misleading content', 'Privacy concern', 'Something else'];

export function SafetyDialog({ targetId, targetType, onClose }: { targetId: string; targetType: Report['targetType']; onClose: () => void }) {
  const { services, run, notify } = useKoinogram();
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await run(() => services.moderation.report(targetId, targetType, reason, details.trim() || undefined));
      onClose();
      notify('Thank you. Your report was recorded in this demo.');
    } catch { setError('Your report could not be sent. Please try again.'); }
  }
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="report-title"><button className="dialog-close icon-button" onClick={onClose} aria-label="Close report dialog"><X size={18} /></button><span className="dialog-icon"><ShieldAlert size={21} /></span><span className="eyebrow">SAFETY & CARE</span><h2 id="report-title">Let’s take a closer look.</h2><p className="dialog-lead">Reports are private. In this demo, your choice is recorded locally and is not reviewed by a real moderation team.</p><form onSubmit={(event) => void submit(event)}><fieldset className="reason-list"><legend>What’s concerning?</legend>{reasons.map((item) => <label key={item}><input type="radio" name="report-reason" checked={reason === item} onChange={() => setReason(item)} />{item}</label>)}</fieldset><label className="field-label" htmlFor="report-details">Anything else to share? <span>Optional</span></label><textarea id="report-details" rows={3} maxLength={400} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Add context that may help…" />{error && <p className="field-error">{error}</p>}<div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary">Send report</button></div></form></section></div>;
}
