'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import UpgradeButton from '@/components/UpgradeButton';

export default function UpgradeBanner() {
  const tBanner = useTranslations('upgradeBanner');
  const { user } = useDashboard();
  const [dismissed, setDismissed] = useState(false);

  if (user.plan !== 'free' || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative overflow-hidden rounded-2xl border border-[#D97706]/30 bg-gradient-to-r from-[#D97706]/10 via-[#F59E0B]/5 to-[#D97706]/10 p-4 mb-6"
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#D97706]/5 to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D97706]/20 border border-[#D97706]/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4.5 h-4.5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-white">
              {tBanner('title')}
            </p>
            <p className="text-xs text-[#A598C7]">
              {tBanner('subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UpgradeButton
            plan="monthly"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Zap className="w-3 h-3" />
            {tBanner('cta')}
          </UpgradeButton>
          <button
            onClick={() => setDismissed(true)}
            className="text-[#A598C7] hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
