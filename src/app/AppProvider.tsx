import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppSnapshot } from '../types/domain';
import type { KoinogramServices } from '../services/contracts';
import { MockKoinogramServices } from '../mocks/services';
import { seedSnapshot } from '../mocks/seed';
import { appConfig } from '../config/env';

interface AppContextValue {
  snapshot: AppSnapshot;
  services: KoinogramServices;
  busy: boolean;
  toast: string;
  run<T>(action: () => Promise<T>): Promise<T>;
  notify(message: string): void;
  currentUser: AppSnapshot['users'][number];
}

const Context = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [services] = useState<KoinogramServices>(() => new MockKoinogramServices());
  const [snapshot, setSnapshot] = useState<AppSnapshot>(seedSnapshot);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { void services.snapshot().then(setSnapshot); }, [services]);

  useEffect(() => {
    document.documentElement.dataset.theme = snapshot.appearance;
  }, [snapshot.appearance]);

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    setBusy(true);
    try {
      const value = await action();
      setSnapshot(await services.snapshot());
      return value;
    } finally {
      setBusy(false);
    }
  }, [services]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }, []);

  const currentUser = snapshot.users.find((user) => user.id === snapshot.currentUserId) ?? snapshot.users[0];
  const value = useMemo(() => ({ snapshot, services, busy, toast, run, notify, currentUser }), [snapshot, services, busy, toast, run, notify, currentUser]);

  if (!appConfig.useMocks) {
    return <div className="api-mode-notice"><strong>API mode is selected.</strong><span>A production API adapter has not been connected yet. Set <code>VITE_USE_MOCKS=true</code> to continue in the demo, or implement the documented API contracts.</span></div>;
  }

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useKoinogram(): AppContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('useKoinogram must be used within AppProvider.');
  return context;
}
