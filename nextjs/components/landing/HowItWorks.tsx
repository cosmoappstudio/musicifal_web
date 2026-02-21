'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link2, BrainCircuit, Sparkles, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: Link2, titleKey: 'step1Title', descKey: 'step1Desc', number: '01', color: '#1DB954' },
  { icon: BrainCircuit, titleKey: 'step2Title', descKey: 'step2Desc', number: '02', color: '#7C3AED' },
  { icon: Sparkles, titleKey: 'step3Title', descKey: 'step3Desc', number: '03', color: '#D97706' },
];

export default function HowItWorks() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 px-4 bg-[#1A1535]/30 border-y border-white/[0.04]">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('howItWorksTitle')}</h2>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex-1 flex flex-col items-center text-center"
              >
                {/* Step card */}
                <div className="relative w-full max-w-xs">
                  <div className="relative rounded-2xl border border-white/[0.08] bg-[#1A1535] p-6 text-center">
                    {/* Number */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0D0B1E] border border-white/10 text-[#A598C7]">
                      {step.number}
                    </div>

                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>

                    <h3 className="font-bold text-white mb-2">{t(step.titleKey as any)}</h3>
                    <p className="text-sm text-[#A598C7] leading-relaxed">{t(step.descKey as any)}</p>
                  </div>
                </div>

                {/* Arrow between steps */}
                {i < STEPS.length - 1 && (
                  <div className="flex md:hidden items-center justify-center my-2">
                    <ArrowRight className="w-5 h-5 text-[#A598C7]/30 rotate-90" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Desktop arrows between steps */}
          <style jsx>{`
            .step-arrow {
              display: none;
            }
            @media (min-width: 768px) {
              .step-arrow {
                display: flex;
              }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
