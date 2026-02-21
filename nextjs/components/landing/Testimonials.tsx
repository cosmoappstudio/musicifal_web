'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Zeynep A.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep&backgroundColor=7C3AED',
    plan: 'PRO',
    text: '"Do I Wanna Know\'u 42 kez dinlediğimi ve bunun ne anlama geldiğini fal çıkana kadar hiç düşünmemiştim. Tüylerim diken diken oldu."',
    stars: 5,
  },
  {
    name: 'Mehmet D.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet&backgroundColor=A855F7',
    plan: 'Starter',
    text: '"Sabahları Lo-fi, geceleri Phonk dinlediğimi biliyordum ama bunu bu kadar net görmek bambaşkaydı. Müzik DNA\'m gerçekten bendim."',
    stars: 5,
  },
  {
    name: 'Selin K.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Selin&backgroundColor=D97706',
    plan: 'PRO',
    text: '"Arkadaşımla Wrapped\'ımı karşılaştırdık, müzik zevkimizin ne kadar farklı olduğunu gördük. Story\'yi WhatsApp\'ta paylaştım, herkes sordu!"',
    stars: 5,
  },
];

export default function Testimonials() {
  const tLanding = useTranslations('landing');

  return (
    <section className="py-24 px-4 bg-[#1A1535]/30 border-y border-white/[0.04]">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {tLanding('testimonialsTitle')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative rounded-2xl border border-white/[0.06] bg-[#1A1535] p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#D97706] text-[#D97706]" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-[#A598C7] leading-relaxed italic mb-5">{t.text}</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full border border-white/10"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.plan === 'PRO'
                      ? 'bg-[#D97706]/10 text-[#F59E0B]'
                      : 'bg-[#7C3AED]/10 text-[#A855F7]'
                  }`}>
                    {t.plan}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
