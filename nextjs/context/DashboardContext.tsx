'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { CurrentUser } from '@/lib/auth';
import type { MockAnalysis, MockFortune } from '@/types';

interface DashboardContextValue {
  user: CurrentUser;
  analysis: MockAnalysis | null;
  fortune: MockFortune | null;
  rawFetchedAt: string | null;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  user,
  analysis,
  fortune,
  rawFetchedAt,
  children,
}: DashboardContextValue & { children: ReactNode }) {
  return (
    <DashboardContext.Provider value={{ user, analysis, fortune, rawFetchedAt }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
