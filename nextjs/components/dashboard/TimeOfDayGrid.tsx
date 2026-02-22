'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, CloudMoon } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

const TIME_CONFIG = [
  {
    key: 'morning' as const,
    icon: Sun,
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    bgGlow: 'bg-amber-500/10',
  },
  {
    key: 'afternoon' as const,
    icon: Sunset,
    gradient: 'from-orange-500/20 to-red-500/10',
    border: 'border-orange-500/20',
    iconColor: 'text-orange-400',
    bgGlow: 'bg-orange-500/10',
  },
  {
    key: 'evening' as const,
    icon: Moon,
    gradient: 'from-indigo-500/20 to-purple-500/10',
    border: 'border-indigo-500/20',
    iconColor: 'text-indigo-400',
    bgGlow: 'bg-indigo-500/10',
  },
  {
    key: 'night' as const,
    icon: CloudMoon,
    gradient: 'from-[#7C3AED]/20 to-[#A855F7]/10',
    border: 'border-[#7C3AED]/20',
    iconColor: 'text-[#A855F7]',
    bgGlow: 'bg-[#7C3AED]/10',
  },
];

export default function TimeOfDayGrid() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { analysis } = useDashboard();
  const timeOfDay = analysis?.timeOfDay ?? {
    morning: { genre: '-', mood: '', moodKey: 'calm', trackCount: 0 },
    afternoon: { genre: '-', mood: '', moodKey: 'calm', trackCount: 0 },
    evening: { genre: '-', mood: '', moodKey: 'calm', trackCount: 0 },
    night: { genre: '-', mood: '', moodKey: 'calm', trackCount: 0 },
  };

  const timeData = {
    morning: { ...timeOfDay.morning, label: t('morning'), time: t('morningTime') },
    afternoon: { ...timeOfDay.afternoon, label: t('afternoon'), time: t('afternoonTime') },
    evening: { ...timeOfDay.evening, label: t('evening'), time: t('eveningTime') },
    night: { ...timeOfDay.night, label: t('night'), time: t('nightTime') },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="surface-card p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{t('timeTitle')}</h2>
        <p className="text-sm text-[#A598C7] mt-1">{t('timeSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TIME_CONFIG.map((config, i) => {
          const data = timeData[config.key];
          const Icon = config.icon;

          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} border ${config.border} p-4 cursor-default`}
            >
              <div className={`inline-flex p-2 rounded-xl ${config.bgGlow} mb-3`}>
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>

              <p className="text-xs text-[#A598C7] mb-0.5">{data.label}</p>
              <p className="text-[10px] text-[#A598C7]/60 mb-2">{data.time}</p>

              <p className="text-base font-bold text-white leading-tight">{data.genre}</p>

              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <p className="text-xs text-[#A598C7]">
                  <span className="text-white font-semibold">{data.trackCount}</span>{' '}
                  {tCommon('tracks')}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
