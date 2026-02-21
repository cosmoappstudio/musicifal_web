'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { mockAnalysis } from '@/lib/mock-data';

const RANK_STYLES = [
  { bg: 'bg-gradient-to-br from-[#D97706] to-[#F59E0B]', text: '🥇' },
  { bg: 'bg-gradient-to-br from-gray-400 to-gray-300', text: '🥈' },
  { bg: 'bg-gradient-to-br from-amber-600 to-amber-500', text: '🥉' },
];

export default function TopArtistsGrid() {
  const t = useTranslations('dashboard');
  const { topArtists } = mockAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="surface-card p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{t('artistsTitle')}</h2>
        <p className="text-sm text-[#A598C7] mt-1">{t('artistsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {topArtists.map((artist, i) => (
          <motion.div
            key={artist.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
            className="flex flex-col items-center text-center group cursor-default"
          >
            <div className="relative mb-3">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/[0.06] group-hover:border-[#7C3AED]/50 transition-colors duration-300">
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              {/* Rank badge */}
              {i < 3 ? (
                <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full ${RANK_STYLES[i].bg} flex items-center justify-center text-xs border-2 border-[#0D0B1E] shadow-lg`}>
                  <span className="text-[10px] leading-none">{RANK_STYLES[i].text}</span>
                </div>
              ) : (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#2D2455] border border-white/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#A598C7]">{i + 1}</span>
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-white leading-tight line-clamp-1 w-full px-1">
              {artist.name}
            </p>
            <p className="text-[10px] text-[#A598C7] mt-0.5">
              {artist.playCount} {t('plays')}
            </p>
            <p className="text-[10px] text-[#7C3AED] mt-0.5 truncate w-full px-1">
              {artist.genre}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
