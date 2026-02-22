'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Repeat2 } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

function AudioPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full"
        />
      </div>
      <span className="text-[10px] text-[#A598C7]">{label}</span>
    </div>
  );
}

export default function TopRepeatedSongs() {
  const t = useTranslations('dashboard');
  const { analysis } = useDashboard();
  const topRepeated = analysis?.topRepeated ?? [];
  if (topRepeated.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{t('repeatedTitle')}</h2>
        <p className="text-sm text-[#A598C7] mt-1">{t('repeatedSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topRepeated.map((song, i) => (
          <motion.div
            key={song.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="relative group overflow-hidden rounded-2xl aspect-[3/4] cursor-default"
          >
            {/* Album art background */}
            <Image
              src={song.albumArt}
              alt={song.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1E] via-[#0D0B1E]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Rank badge */}
            <div className="absolute top-4 left-4">
              <div className="w-8 h-8 rounded-xl bg-[#7C3AED] flex items-center justify-center font-bold text-white text-sm shadow-lg">
                {song.rank}
              </div>
            </div>

            {/* Repeat count */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
              <Repeat2 className="w-3.5 h-3.5 text-[#A855F7]" />
              <span className="text-xs font-bold text-white">{song.repeatCount}</span>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[#A855F7] text-xs font-semibold mb-1">
                {song.repeatCount} {t('repeats')}
              </p>
              <h3 className="text-base font-bold text-white leading-tight mb-1 line-clamp-2">
                {song.name}
              </h3>
              <p className="text-[#A598C7] text-xs mb-3">{song.artist}</p>

              {/* Audio features — only show when real data available */}
              {(song.energy > 0 || song.valence > 0 || song.danceability > 0) && (
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                  <AudioPill label={t('energy')} value={song.energy} />
                  <AudioPill label={t('valence')} value={song.valence} />
                  <AudioPill label={t('danceability')} value={song.danceability} />
                </div>
              )}

              <p className="text-[10px] text-[#A598C7] italic mt-3">
                "{t('reveals')}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
