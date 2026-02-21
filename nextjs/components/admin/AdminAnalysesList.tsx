'use client';

import { useTranslations } from 'next-intl';
import { useAdminFilters } from '@/context/AdminFilterContext';
import { filterAdminAnalyses } from '@/lib/admin-filters';
import { mockAdminAnalyses } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Music2, Clock } from 'lucide-react';
import type { Plan } from '@/types';

const PLAN_STYLES: Record<Plan, string> = {
  free: 'bg-white/5 text-white/50',
  weekly: 'bg-[#7C3AED]/10 text-[#A855F7]',
  monthly: 'bg-[#10B981]/10 text-[#10B981]',
  yearly: 'bg-[#D97706]/10 text-[#F59E0B]',
};

export default function AdminAnalysesList() {
  const t = useTranslations('admin');
  const { filters } = useAdminFilters();
  const filtered = filterAdminAnalyses(mockAdminAnalyses, filters);

  return (
    <div className="surface-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="font-semibold text-white text-sm">{t('recentAnalyses')}</h3>
        <span className="text-xs text-[#A598C7]">
          {filtered.length} / {mockAdminAnalyses.length}
        </span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {filtered.map((analysis, i) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={analysis.userAvatar}
              alt={analysis.userName}
              className="w-9 h-9 rounded-full border border-white/10 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{analysis.userName}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${PLAN_STYLES[analysis.plan]}`}
                >
                  {analysis.plan}
                </span>
                <span className="text-xs text-[#A598C7]">·</span>
                <span className="text-xs text-[#A598C7] capitalize">{analysis.platform}</span>
              </div>
            </div>

            <div className="text-center hidden sm:block">
              <div className="flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="text-sm font-medium text-white">{analysis.dominantGenre}</span>
              </div>
              <p className="text-xs text-[#A598C7] mt-0.5">{t('dominantGenre')}</p>
            </div>

            <div className="text-right hidden md:block">
              <div className="flex items-center gap-1.5 justify-end">
                <Clock className="w-3 h-3 text-[#A598C7]" />
                <span className="text-xs text-[#A598C7]">{analysis.processingMs}ms</span>
              </div>
              <p className="text-xs text-[#A598C7] mt-0.5">{analysis.analyzedAt.slice(0, 10)}</p>
            </div>

            <button className="text-xs text-[#A598C7] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors flex-shrink-0">
              {t('detail')}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
