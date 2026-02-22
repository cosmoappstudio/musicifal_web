'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useDashboard } from '@/context/DashboardContext';

export default function Top50Songs() {
  const t = useTranslations('dashboard');
  const { analysis } = useDashboard();
  const top50 = analysis?.top50Songs ?? [];
  if (top50.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="surface-card p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{t('top50Title')}</h2>
        <p className="text-sm text-[#A598C7] mt-1">{t('top50Subtitle')}</p>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {top50.map((song, i) => (
          <motion.div
            key={`${song.name}-${song.artist}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.02 + i * 0.01 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            <span className="text-xs font-bold text-[#A598C7] w-6 text-right">{song.rank}</span>
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.05]">
              {song.albumArt ? (
                <Image src={song.albumArt} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#A598C7] text-xs">{song.rank}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{song.name}</p>
              <p className="text-xs text-[#A598C7] truncate">{song.artist}</p>
            </div>
            <span className="text-xs font-semibold text-[#A855F7]">{song.playCount} {t('plays')}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
