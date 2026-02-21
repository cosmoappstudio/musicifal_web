'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useAdminFilters } from '@/context/AdminFilterContext';
import { filterAdminUsers } from '@/lib/admin-filters';
import StatsCard from '@/components/admin/StatsCard';
import { SignupChart, PlanDistributionChart } from '@/components/admin/RevenueChart';
import { mockAdminStats, mockAdminUsers } from '@/lib/mock-data';

export default function AdminOverviewContent() {
  const t = useTranslations('admin');
  const { filters } = useAdminFilters();

  const filteredUsers = useMemo(() => filterAdminUsers(mockAdminUsers, filters), [filters]);

  const planDistribution = useMemo(() => {
    const free = filteredUsers.filter((u) => u.plan === 'free').length;
    const starter = filteredUsers.filter((u) => u.plan === 'starter').length;
    const pro = filteredUsers.filter((u) => u.plan === 'pro').length;
    return { free, starter, pro };
  }, [filteredUsers]);

  const activeSubscriptions = filteredUsers.filter((u) => u.plan === 'starter' || u.plan === 'pro').length;

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatsCard
          title={t('totalUsers')}
          value={filteredUsers.length.toLocaleString()}
          trend={12.4}
          icon="users"
          iconColor="text-[#A855F7]"
          iconBg="bg-[#7C3AED]/15"
          delay={0}
        />
        <StatsCard
          title={t('activeSubscriptions')}
          value={activeSubscriptions.toLocaleString()}
          trend={8.2}
          icon="creditCard"
          iconColor="text-[#F59E0B]"
          iconBg="bg-[#D97706]/15"
          delay={0.05}
        />
        <StatsCard
          title={t('monthlyRevenue')}
          value={`$${mockAdminStats.monthlyRevenue.toLocaleString()}`}
          subtitle="$832"
          trend={21.3}
          icon="trendingUp"
          iconColor="text-green-400"
          iconBg="bg-green-500/15"
          delay={0.1}
        />
        <StatsCard
          title={t('totalFortunes')}
          value={mockAdminStats.totalFortunes.toLocaleString()}
          trend={15.7}
          icon="sparkles"
          iconColor="text-[#E879F9]"
          iconBg="bg-[#E879F9]/10"
          delay={0.15}
        />
      </div>

      {/* Charts - PlanDistributionChart uses filtered data via a wrapper that would need filter context.
          For now SignupChart and PlanDistributionChart use mockAdminStats. We could make PlanDistributionChart
          accept optional override data. Let me create a filtered version. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="lg:col-span-2">
          <SignupChart />
        </div>
        <PlanDistributionChartOverride distribution={planDistribution} />
      </div>

      {/* Recent signups - filtered */}
      <div className="surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold text-white">{t('recentSignups')}</h3>
          <span className="text-xs text-[#A598C7]">
            {filteredUsers.length} / {mockAdminUsers.length}
          </span>
        </div>
        <div className="divide-y divide-white/[0.04] overflow-x-auto">
          {filteredUsers.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 min-w-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-[#A598C7] truncate">{user.email}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                  user.plan === 'pro'
                    ? 'bg-[#D97706]/10 text-[#F59E0B]'
                    : user.plan === 'starter'
                      ? 'bg-[#7C3AED]/10 text-[#A855F7]'
                      : 'bg-white/5 text-white/50'
                }`}
              >
                {user.plan}
              </span>
              <span className="text-xs text-[#A598C7] ml-auto sm:ml-0">{user.joinedAt}</span>
              <span className="text-xs text-[#A598C7] capitalize hidden md:block">{user.source}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function PlanDistributionChartOverride({
  distribution,
}: {
  distribution: { free: number; starter: number; pro: number };
}) {
  const t = useTranslations('admin');
  const data = [
    { name: 'Free', value: distribution.free, color: '#6B7280' },
    { name: 'Starter', value: distribution.starter, color: '#7C3AED' },
    { name: 'PRO', value: distribution.pro, color: '#D97706' },
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
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1A1535',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                }}
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
              <span className="text-sm font-bold text-white ml-auto">
                {d.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
