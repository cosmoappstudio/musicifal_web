'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminFilters } from '@/context/AdminFilterContext';
import type { AdminFilters, Plan } from '@/types';
import { mockAnalytics } from '@/lib/mock-data';

const PLANS: (Plan | 'all')[] = ['all', 'free', 'starter', 'pro'];
const PLATFORMS: Array<AdminFilters['platform']> = ['all', 'spotify'];
const GENDERS: Array<AdminFilters['gender']> = ['all', 'male', 'female', 'other'];

export default function AdminFilterBar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tAnalytics = useTranslations('analytics');
  const { filters, setFilter, resetFilters, hasActiveFilters } = useAdminFilters();

  const genres = ['all', ...mockAnalytics.genreDistribution.map((g) => g.genre)];

  const Select = ({
    labelKey,
    value,
    options,
    onChange,
    optionLabels,
  }: {
    labelKey: 'filterPlan' | 'filterPlatform' | 'filterGender' | 'filterGenre';
    value: string;
    options: readonly string[];
    onChange: (v: string) => void;
    optionLabels?: (v: string) => string;
  }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-[#A598C7] uppercase tracking-wider">
        {t(labelKey)}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const label = optionLabels ? optionLabels(opt) : opt === 'all' ? t('all') : opt;
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-white/[0.04] text-[#A598C7] hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const planLabel = (p: string) => (p === 'all' ? t('all') : p === 'free' ? tCommon('free') : p.toUpperCase());
  const platformLabel = (p: string) => (p === 'all' ? t('all') : tCommon('spotify'));
  const genderLabel = (g: string) =>
    g === 'all' ? t('all') : g === 'male' ? tAnalytics('male') : g === 'female' ? tAnalytics('female') : tAnalytics('other');

  return (
    <div className="surface-card overflow-hidden mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-[#A598C7]" />
          <span className="font-medium text-white">{t('filters')}</span>
          {hasActiveFilters && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#A855F7]">
              •
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#A598C7] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#A598C7] flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-white/[0.06]">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 pt-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            labelKey="filterPlan"
            value={filters.plan}
            options={PLANS}
            onChange={(v) => setFilter('plan', v as Plan | 'all')}
            optionLabels={planLabel}
          />
          <Select
            labelKey="filterPlatform"
            value={filters.platform}
            options={PLATFORMS}
            onChange={(v) => setFilter('platform', v as AdminFilters['platform'])}
            optionLabels={platformLabel}
          />
          <Select
            labelKey="filterGender"
            value={filters.gender}
            options={GENDERS}
            onChange={(v) => setFilter('gender', v as AdminFilters['gender'])}
            optionLabels={genderLabel}
          />
          <Select
            labelKey="filterGenre"
            value={filters.genre}
            options={genres}
            onChange={(v) => setFilter('genre', v)}
            optionLabels={(g) => (g === 'all' ? t('all') : g)}
          />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#A598C7] hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('resetFilters')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
