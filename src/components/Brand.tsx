import { Link } from 'react-router-dom';

export function BrandMark({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link className={`brand ${light ? 'brand-light' : ''} ${compact ? 'brand-compact' : ''}`} to="/" aria-label="Koinogram home">
      <svg className="brand-mark" viewBox="0 0 40 40" role="img" aria-label="Koinogram K mark">
        <rect className="brand-mark-bg" x="2" y="2" width="36" height="36" rx="10" fill="currentColor" />
        <path className="brand-mark-symbol" d="M14 9v22M14 20h14M16 20 28 10M16 20l12 10" fill="none" stroke="var(--mark-symbol, #fff)" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && <span className="brand-word">koinogram</span>}
    </Link>
  );
}
