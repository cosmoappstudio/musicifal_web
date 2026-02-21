'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Repeat2, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, titleKey: 'feature1Title', descKey: 'feature1Desc', color: '#7C3AED', bg: 'from-[#7C3AED]/10 to-transparent' },
  { icon: Clock, titleKey: 'feature2Title', descKey: 'feature2Desc', color: '#A855F7', bg: 'from-[#A855F7]/10 to-transparent' },
  { icon: Repeat2, titleKey: 'feature5Title', descKey: 'feature5Desc', color: '#E879F9', bg: 'from-[#E879F9]/10 to-transparent' },
  { icon: Sparkles, titleKey: 'feature6Title', descKey: 'feature6Desc', color: '#D97706', bg: 'from-[#D97706]/10 to-transparent' },
];

export default function Features() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('featuresTitle')}</h2>
          <p className="text-[#A598C7] max-w-md mx-auto">{t('featuresSubtitle')}</p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1A1535] p-6 cursor-default"
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}18`, border: `1px solid ${feature.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{t(feature.titleKey as any)}</h3>
                  <p className="text-sm text-[#A598C7] leading-relaxed">{t(feature.descKey as any)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
