import { useState } from 'react';
import type { User } from '../types/domain';

export function Avatar({ user, size = 'md' }: { user?: Pick<User, 'displayName' | 'avatarUrl'>; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const [failed, setFailed] = useState(false);
  const initials = user?.displayName.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'K';
  return (
    <span className={`avatar avatar-${size}`} aria-label={user?.displayName ?? 'Koinogram member'}>
      {user?.avatarUrl && !failed ? <img src={user.avatarUrl} alt="" loading="lazy" onError={() => setFailed(true)} /> : <span aria-hidden="true">{initials}</span>}
    </span>
  );
}
