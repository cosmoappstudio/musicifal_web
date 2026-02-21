'use client';

import { useTranslations } from 'next-intl';
import { useAdminFilters } from '@/context/AdminFilterContext';
import { filterTransactions } from '@/lib/admin-filters';
import StatsCard from '@/components/admin/StatsCard';
import { RevenueLineChart } from '@/components/admin/RevenueChart';
import { mockAdminStats, mockTransactions } from '@/lib/mock-data';

const STATUS_STYLES = {
  completed: 'text-green-400 bg-green-500/10',
  refunded: 'text-red-400 bg-red-500/10',
  failed: 'text-[#A598C7] bg-white/5',
};

export default function AdminRevenueContent() {
  const t = useTranslations('admin');
  const { filters } = useAdminFilters();

  const filteredTransactions = filterTransactions(mockTransactions, filters);

  const mrr = mockAdminStats.monthlyRevenue;
  const arr = mrr * 12;

  return (
    <>
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatsCard
          title="MRR"
          value={`$${mrr.toLocaleString()}`}
          subtitle="Monthly Recurring Revenue"
          trend={21.3}
          icon="trendingUp"
          iconColor="text-green-400"
          iconBg="bg-green-500/15"
          delay={0}
        />
        <StatsCard
          title="ARR"
          value={`$${arr.toLocaleString()}`}
          subtitle="Annual Recurring Revenue"
          trend={21.3}
          icon="dollarSign"
          iconColor="text-[#F59E0B]"
          iconBg="bg-[#D97706]/15"
          delay={0.05}
        />
        <StatsCard
          title={t('activeSubscriptions')}
          value={mockAdminStats.activeSubscriptions.toLocaleString()}
          trend={8.2}
          icon="users"
          iconColor="text-[#A855F7]"
          iconBg="bg-[#7C3AED]/15"
          delay={0.1}
        />
        <StatsCard
          title="Churn Rate"
          value="3.2%"
          subtitle={t('churnSubtitle')}
          trend={-1.4}
          icon="rotateCcw"
          iconColor="text-red-400"
          iconBg="bg-red-500/15"
          delay={0.15}
        />
      </div>

      {/* Revenue chart */}
      <div className="mb-6">
        <RevenueLineChart />
      </div>

      {/* Transactions - filtered by plan */}
      <div className="surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">{t('recentTransactions')}</h3>
          <span className="text-xs text-[#A598C7]">
            {filteredTransactions.length} / {mockTransactions.length}
          </span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{tx.userName}</p>
                <p className="text-xs text-[#A598C7] mt-0.5">{tx.date}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                  tx.plan === 'pro' ? 'bg-[#D97706]/10 text-[#F59E0B]' : 'bg-[#7C3AED]/10 text-[#A855F7]'
                }`}
              >
                {tx.plan}
              </span>
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  $
                  {tx.amount}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[tx.status]}`}
              >
                {tx.status === 'completed' ? t('completed') : tx.status === 'refunded' ? t('refunded') : t('failed')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
