'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import UpgradeButton from '@/components/UpgradeButton';

export default function FortuneCard() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { user, fortune } = useDashboard();
  const isPaid = user.plan !== 'free';
  const fortuneText = fortune ? (fortune[locale as 'tr' | 'en' | 'de' | 'ru'] || fortune.tr) : '';
  const firstParagraph = fortuneText ? fortuneText.split('\n\n')[0] : '';
  const secondParagraph = fortuneText ? fortuneText.split('\n\n')[1] || '' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-[#7C3AED]/20 bg-gradient-to-br from-[#1A1535] via-[#2D2455]/50 to-[#1A1535]"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#7C3AED] opacity-[0.07] blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#A855F7] opacity-[0.05] blur-[60px] rounded-full pointer-events-none" />

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#A855F7]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t('fortuneTitle')}</h2>
            <p className="text-xs text-[#A598C7]">{t('fortuneSubtitle')}</p>
          </div>
        </div>

        {/* Fortune text */}
        <div className={`relative ${firstParagraph && !isPaid ? 'fortune-blur-overlay' : ''}`}>
          {firstParagraph ? (
            <>
              <p className="fortune-text text-[#F8F7FF]/90 mb-4">
                {firstParagraph}
              </p>
              {isPaid && secondParagraph && (
                <p className="fortune-text text-[#F8F7FF]/80">
                  {secondParagraph}
                </p>
              )}
            </>
          ) : (
            <p className="fortune-text text-[#A598C7] italic">
              {t('noFortuneYet')}
            </p>
          )}
          {!isPaid && firstParagraph && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1A1535]/60 to-[#1A1535] flex items-end justify-center pb-2">
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center text-[#A598C7] text-sm">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('fortuneBlurred')}</span>
                  <span className="text-[#A855F7] font-medium">{t('fortuneBlurredCta')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-wrap gap-3">
          {!fortune ? (
            <Link
              href={`/${locale}/dashboard/fortune`}
              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {t('generateFortune')}
            </Link>
          ) : isPaid ? (
            <Link
              href={`/${locale}/dashboard/fortune`}
              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-[#7C3AED]/30"
            >
              {t('viewFullFortune')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <UpgradeButton
              plan="monthly"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#D97706]/30"
            >
              <Lock className="w-4 h-4" />
              {t('upgradeForFortune')}
            </UpgradeButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}
