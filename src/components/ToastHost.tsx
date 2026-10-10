import { Check } from 'lucide-react';
import { useKoinogram } from '../app/AppProvider';

export function ToastHost() {
  const { toast } = useKoinogram();
  return <div className={`toast-host ${toast ? 'toast-visible' : ''}`} role="status" aria-live="polite"><span className="toast-check"><Check size={15} /></span>{toast}</div>;
}
