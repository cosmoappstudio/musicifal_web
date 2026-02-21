'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminFilters } from '@/context/AdminFilterContext';
import { filterAdminUsers, filterAdminAnalyses } from '@/lib/admin-filters';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { mockAnalytics, mockAdminUsers, mockAdminAnalyses } from '@/lib/mock-data';
import { Music2, Moon, Sun } from 'lucide-react';

const COLORS = ['#7C3AED', '#A855F7', '#C084FC', '#E879F9', '#D97706', '#6B7280'];

const TOOLTIP_STYLE: React.CSSProperties = {
  background: '#1A1535',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '8px 12px',
};

function SafeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div style={TOOLTIP_STYLE} className="shadow-xl">
      {(label ?? item.name) && <p className="text-xs text-[#A598C7] mb-1">{label ?? item.name}</p>}
      <p className="text-sm font-bold text-white">{item.value}</p>
    </div>
  );
}

export default function AdminAnalytics() {
  const t = useTranslations('analytics');
  const { filters } = useAdminFilters();

  const { filteredUsers, filteredAnalyses } = useMemo(() => {
    const users = filterAdminUsers(mockAdminUsers, filters);
    const analyses = filterAdminAnalyses(mockAdminAnalyses, filters);
    return { filteredUsers: users, filteredAnalyses: analyses };
  }, [filters]);

  const scaleFactor = useMemo(() => {
    if (filteredAnalyses.length === 0) return 0;
    return filteredAnalyses.length / mockAdminAnalyses.length;
  }, [filteredAnalyses.length]);


  const genreDistributionFiltered = useMemo(() => {
    if (filteredAnalyses.length === 0) return [];
    const counts = filteredAnalyses.reduce<Record<string, number>>((acc, a) => {
      acc[a.dominantGenre] = (acc[a.dominantGenre] || 0) + 1;
      return acc;
    }, {});
    const total = filteredAnalyses.length;
    return Object.entries(counts).map(([genre, count]) => ({
      genre,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [filteredAnalyses]);

  const timeOfDayData = [
    { name: t('morning'), value: Math.round(mockAnalytics.timeOfDay.morning * (scaleFactor || 1)) },
    { name: t('afternoon'), value: Math.round(mockAnalytics.timeOfDay.afternoon * (scaleFactor || 1)) },
    { name: t('evening'), value: Math.round(mockAnalytics.timeOfDay.evening * (scaleFactor || 1)) },
    { name: t('night'), value: Math.round(mockAnalytics.timeOfDay.night * (scaleFactor || 1)) },
  ];

  const genderData = useMemo(() => {
    if (filteredAnalyses.length === 0) {
      return [
        { name: t('male'), value: mockAnalytics.genderDistribution.male, color: COLORS[0] },
        { name: t('female'), value: mockAnalytics.genderDistribution.female, color: COLORS[1] },
        { name: t('other'), value: mockAnalytics.genderDistribution.other, color: COLORS[5] },
      ];
    }
    const male = filteredAnalyses.filter((a) => a.gender === 'male').length;
    const female = filteredAnalyses.filter((a) => a.gender === 'female').length;
    const other = filteredAnalyses.filter((a) => a.gender === 'other').length;
    return [
      { name: t('male'), value: male, color: COLORS[0] },
      { name: t('female'), value: female, color: COLORS[1] },
      { name: t('other'), value: other, color: COLORS[5] },
    ];
  }, [filteredAnalyses, t]);

  const volumeData = [
    {
      name: t('volumeHigh'),
      value: Math.round(mockAnalytics.volumeDistribution.high * (scaleFactor || 1)),
    },
    {
      name: t('volumeMedium'),
      value: Math.round(mockAnalytics.volumeDistribution.medium * (scaleFactor || 1)),
    },
    {
      name: t('volumeLow'),
      value: Math.round(mockAnalytics.volumeDistribution.low * (scaleFactor || 1)),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="surface-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-[#1DB954]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{mockAnalytics.platform.spotify}%</p>
            <p className="text-xs text-[#A598C7]">{t('spotifyUsers')}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
            <Moon className="w-5 h-5 text-[#A855F7]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {Math.round(mockAnalytics.topNightListeners * scaleFactor).toLocaleString('tr-TR')}
            </p>
            <p className="text-xs text-[#A598C7]">{t('topNightListeners')}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {Math.round(mockAnalytics.topMorningListeners * scaleFactor).toLocaleString('tr-TR')}
            </p>
            <p className="text-xs text-[#A598C7]">{t('topMorningListeners')}</p>
          </div>
        </motion.div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time of day */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-card p-5">
          <h3 className="font-semibold text-white mb-4">{t('timeOfDay')}</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeOfDayData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" domain={[0, 40]} tick={{ fill: '#A598C7', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={70} tick={{ fill: '#A598C7', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<SafeTooltip />} cursor={false} />
                <Bar dataKey="value" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Genre distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-white mb-4">{t('genreDistribution')}</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={genreDistributionFiltered.length > 0 ? genreDistributionFiltered : mockAnalytics.genreDistribution}
                layout="vertical"
                margin={{ left: 0, right: 40 }}
              >
                <XAxis type="number" tick={{ fill: '#A598C7', fontSize: 10 }} />
                <YAxis dataKey="genre" type="category" width={80} tick={{ fill: '#A598C7', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<SafeTooltip />} cursor={false} />
                <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gender */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-card p-5">
          <h3 className="font-semibold text-white mb-4">{t('genderDistribution')}</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<SafeTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Volume */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-card p-5">
          <h3 className="font-semibold text-white mb-4">{t('volumeDistribution')}</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 5, right: 5, left: -10 }}>
                <XAxis dataKey="name" tick={{ fill: '#A598C7', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="number" domain={[0, 50]} tick={{ fill: '#A598C7', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<SafeTooltip />} cursor={false} />
                <Bar dataKey="value" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
