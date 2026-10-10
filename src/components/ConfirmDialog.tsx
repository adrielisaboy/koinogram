import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ title, body, confirmLabel, onConfirm, onClose }: { title: string; body: string; confirmLabel: string; onConfirm: () => Promise<void> | void; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  async function confirm() { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="dialog-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><button className="dialog-close icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button><span className="dialog-icon dialog-icon-warn"><AlertTriangle size={21} /></span><span className="eyebrow">PLEASE CONFIRM</span><h2 id="confirm-title">{title}</h2><p className="dialog-lead">{body}</p><div className="dialog-actions"><button className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-danger" disabled={busy} onClick={() => void confirm()}>{busy ? 'Please wait…' : confirmLabel}</button></div></section></div>;
}
