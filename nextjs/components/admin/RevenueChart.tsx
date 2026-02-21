'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { mockAdminStats, mockRevenueData } from '@/lib/mock-data';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1535] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-[#A598C7] mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
            ${p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function SignupChart() {
  const t = useTranslations('admin');
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="surface-card p-5"
    >
      <h3 className="font-semibold text-white mb-4">{t('signupTrend')}</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockAdminStats.dailySignups} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => v.slice(5)}
              tick={{ fill: '#A598C7', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#A598C7', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#1A1535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: '#A598C7', fontSize: 11 }}
              itemStyle={{ color: '#A855F7' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#7C3AED"
              strokeWidth={2}
              fill="url(#signupGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function PlanDistributionChart() {
  const t = useTranslations('admin');
  const data = [
    { name: 'Free', value: mockAdminStats.planDistribution.free, color: '#6B7280' },
    { name: 'Weekly', value: mockAdminStats.planDistribution.weekly, color: '#7C3AED' },
    { name: 'Monthly', value: mockAdminStats.planDistribution.monthly, color: '#10B981' },
    { name: 'Yearly', value: mockAdminStats.planDistribution.yearly, color: '#D97706' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="surface-card p-5"
    >
      <h3 className="font-semibold text-white mb-4">{t('planDistribution')}</h3>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="h-[140px] sm:h-[160px] w-full sm:w-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1A1535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                itemStyle={{ color: '#F8F7FF', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 w-full sm:w-auto">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-sm text-[#A598C7]">{d.name}</span>
              <span className="text-sm font-bold text-white ml-auto">{d.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function RevenueLineChart() {
  const t = useTranslations('admin');
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="surface-card p-5"
    >
      <h3 className="font-semibold text-white mb-4">{t('monthlyRevenueTrend')}</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockRevenueData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#A598C7', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#A598C7', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Toplam" stroke="#D97706" strokeWidth={2} fill="url(#revenueGrad)" />
            <Area type="monotone" dataKey="yearly" name="Yıllık" stroke="#7C3AED" strokeWidth={1.5} fill="url(#proGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
