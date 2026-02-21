'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminFilters } from '@/context/AdminFilterContext';
import { filterAdminFortunes, filterAdminUsers } from '@/lib/admin-filters';
import { motion } from 'framer-motion';
import { Sparkles, Star, StarOff } from 'lucide-react';
import { mockAdminFortunes, mockAdminUsers } from '@/lib/mock-data';
import type { Plan } from '@/types';

const PLAN_STYLES: Record<Plan, string> = {
  free: 'bg-white/5 text-white/50',
  weekly: 'bg-[#7C3AED]/10 text-[#A855F7]',
  monthly: 'bg-[#10B981]/10 text-[#10B981]',
  yearly: 'bg-[#D97706]/10 text-[#F59E0B]',
};

const LANG_FLAGS: Record<string, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  de: '🇩🇪',
  ru: '🇷🇺',
};

export default function AdminFortunesPage() {
  const t = useTranslations('admin');
  const { filters } = useAdminFilters();
  const [fortunes, setFortunes] = useState(mockAdminFortunes);

  const filteredUserIds =
    filters.platform !== 'all' || filters.gender !== 'all'
      ? new Set(filterAdminUsers(mockAdminUsers, filters).map((u) => u.id))
      : undefined;
  const filtered = filterAdminFortunes(fortunes, filters, filteredUserIds);

  const toggleFeatured = (id: string) => {
    setFortunes((prev) =>
      prev.map((f) => (f.id === id ? { ...f, featured: !f.featured } : f))
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('fortunes')}</h1>
        <p className="text-[#A598C7] text-sm mt-1">
          {t('fortunesSubtitle', {
            total: filtered.length,
            featured: filtered.filter((f) => f.featured).length,
          })}
        </p>
      </div>

      <div className="space-y-3">
        {filtered.map((fortune, i) => (
          <motion.div
            key={fortune.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`surface-card p-5 ${fortune.featured ? 'border-[#D97706]/20' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#A855F7]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-medium text-white">{fortune.userName}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${PLAN_STYLES[fortune.plan]}`}>
                    {fortune.plan}
                  </span>
                  <span className="text-sm">{LANG_FLAGS[fortune.language]}</span>
                  {fortune.featured && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D97706]/10 text-[#F59E0B] border border-[#D97706]/20 font-medium">
                      {t('featured')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#A598C7] italic truncate">{fortune.preview}</p>
                <p className="text-xs text-[#A598C7]/60 mt-1">{fortune.generatedAt.slice(0, 10)}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleFeatured(fortune.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    fortune.featured
                      ? 'text-[#F59E0B] bg-[#D97706]/10 hover:bg-[#D97706]/20'
                      : 'text-[#A598C7] hover:text-[#F59E0B] hover:bg-[#D97706]/10'
                  }`}
                  title={fortune.featured ? t('unfeature') : t('feature')}
                >
                  {fortune.featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                </button>
                <button className="text-xs text-[#A598C7] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  {t('edit')}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
