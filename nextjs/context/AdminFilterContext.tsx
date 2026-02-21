'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AdminFilters, Plan } from '@/types';

const DEFAULT_FILTERS: AdminFilters = {
  plan: 'all',
  platform: 'all',
  gender: 'all',
  genre: 'all',
};

type AdminFilterContextValue = {
  filters: AdminFilters;
  setFilter: <K extends keyof AdminFilters>(key: K, value: AdminFilters[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
};

const AdminFilterContext = createContext<AdminFilterContextValue | null>(null);

export function AdminFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<AdminFilters>(DEFAULT_FILTERS);

  const setFilter = useCallback(<K extends keyof AdminFilters>(key: K, value: AdminFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.plan !== 'all' ||
    filters.platform !== 'all' ||
    filters.gender !== 'all' ||
    filters.genre !== 'all';

  return (
    <AdminFilterContext.Provider
      value={{
        filters,
        setFilter,
        resetFilters,
        hasActiveFilters,
      }}
    >
      {children}
    </AdminFilterContext.Provider>
  );
}

export function useAdminFilters() {
  const ctx = useContext(AdminFilterContext);
  if (!ctx) {
    throw new Error('useAdminFilters must be used within AdminFilterProvider');
  }
  return ctx;
}
