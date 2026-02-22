'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useDashboard } from '@/context/DashboardContext';

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ name: string; value: number }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-[#1A1535] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="font-semibold text-sm text-white">{item.name}</p>
        <p className="text-[#A855F7] text-lg font-bold">{item.value}%</p>
      </div>
    );
  }
  return null;
}

export default function GenreChart() {
  const t = useTranslations('dashboard');
  const { analysis } = useDashboard();
  const genres = analysis?.genres ?? [];

  if (genres.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="surface-card p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{t('genresTitle')}</h2>
        <p className="text-sm text-[#A598C7] mt-1">{t('genresSubtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="w-full lg:w-56 h-56 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genres}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="percentage"
                nameKey="name"
                startAngle={90}
                endAngle={-270}
                animationBegin={200}
                animationDuration={1000}
              >
                {genres.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={(props) => <CustomTooltip {...props} />} />
              {/* Center label */}
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white"
                style={{ fontSize: '1.5rem', fontWeight: 700 }}
              >
                {genres[0]?.percentage}%
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '0.65rem', fill: '#A598C7' }}
              >
                {genres[0]?.name}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 w-full">
          {genres.map((genre, i) => (
            <motion.div
              key={genre.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: genre.color }}
                />
                <span className="text-sm font-medium text-white">{genre.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${genre.percentage}%` }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: genre.color }}
                  />
                </div>
                <span className="text-sm font-bold text-white w-9 text-right">
                  {genre.percentage}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
