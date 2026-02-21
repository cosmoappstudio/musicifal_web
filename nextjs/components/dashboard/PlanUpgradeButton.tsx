'use client';

import { useTranslations } from 'next-intl';
import UpgradeButton from '@/components/UpgradeButton';

interface PlanUpgradeButtonProps {
  currentPlan: 'free' | 'weekly' | 'monthly' | 'yearly';
}

export default function PlanUpgradeButton({ currentPlan }: PlanUpgradeButtonProps) {
  const t = useTranslations('settings');
  if (currentPlan === 'yearly') return null;
  const nextPlan = currentPlan === 'free' ? 'monthly' : currentPlan === 'weekly' ? 'monthly' : 'yearly';

  return (
    <UpgradeButton
      plan={nextPlan}
      className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
    >
      {t('upgradePlan')}
    </UpgradeButton>
  );
}
