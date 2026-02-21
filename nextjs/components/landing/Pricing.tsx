'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import UpgradeButton from '@/components/UpgradeButton';

const PLANS = [
  {
    key: 'free',
    priceUSD: '0',
    features: ['freeFeature1', 'freeFeature2', 'freeFeature3', 'freeFeature4', 'freeFeature5', 'freeFeature6', 'freeFeature7'],
    cta: 'getStarted',
    highlighted: false,
    gold: false,
  },
  {
    key: 'starter',
    priceUSD: '4.99',
    features: ['starterFeature1', 'starterFeature2', 'starterFeature3', 'starterFeature4', 'starterFeature5', 'starterFeature6', 'starterFeature7', 'starterFeature8'],
    cta: 'upgrade',
    highlighted: false,
    gold: false,
  },
  {
    key: 'pro',
    priceUSD: '9.99',
    features: ['proFeature1', 'proFeature2', 'proFeature3', 'proFeature4', 'proFeature5', 'proFeature6', 'proFeature7'],
    cta: 'upgrade',
    highlighted: true,
    gold: true,
  },
];

export default function Pricing() {
  const t = useTranslations('pricing');
  const tLanding = useTranslations('landing');
  const locale = useLocale();

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{tLanding('pricingTitle')}</h2>
          <p className="text-[#A598C7]">{tLanding('pricingSubtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl p-6 ${
                plan.highlighted
                  ? 'md:scale-105 border-2 border-[#D97706]/40 bg-gradient-to-b from-[#1A1535] to-[#16103a] shadow-2xl shadow-[#D97706]/10'
                  : 'border border-white/[0.08] bg-[#1A1535]'
              }`}
            >
              {/* Recommended badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white text-xs font-bold px-3.5 py-1 rounded-full">
                    <Zap className="w-3 h-3" />
                    {t('recommended')}
                  </div>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-4">
                <h3 className={`text-lg font-bold ${plan.gold ? 'gradient-text-gold' : 'text-white'}`}>
                  {t(plan.key as any)}
                </h3>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {plan.priceUSD === '0' ? t('free') : `$${plan.priceUSD}`}
                  </span>
                  {plan.priceUSD !== '0' && (
                    <span className="text-sm text-[#A598C7]">/{t('month')}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.gold ? 'bg-[#D97706]/20' : 'bg-[#7C3AED]/15'
                    }`}>
                      <Check className={`w-2.5 h-2.5 ${plan.gold ? 'text-[#F59E0B]' : 'text-[#A855F7]'}`} />
                    </div>
                    <span className="text-sm text-[#A598C7]">{t(feature as any)}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.key === 'free' ? (
                <Link
                  href={`/${locale}/dashboard`}
                  className="block text-center font-bold py-3 rounded-xl text-sm transition-all bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.08]"
                >
                  {t(plan.cta as any)}
                </Link>
              ) : (
                <UpgradeButton
                  plan={plan.key as 'starter' | 'pro'}
                  className={`block text-center font-bold py-3 rounded-xl text-sm transition-all w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white hover:opacity-90 hover:shadow-lg hover:shadow-[#D97706]/30'
                      : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] hover:shadow-lg hover:shadow-[#7C3AED]/30'
                  }`}
                >
                  {t(plan.cta as any)}
                </UpgradeButton>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
