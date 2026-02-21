'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

export default function Hero() {
  const t = useTranslations('landing');
  const locale = useLocale();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#7C3AED] opacity-[0.12] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#A855F7] opacity-[0.06] blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#D97706] opacity-[0.04] blur-[100px] rounded-full" />
      </div>

      {/* Stars - deterministic positions to avoid hydration mismatch */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => {
          const seed = (i * 7 + 13) % 101;
          const left = (seed * 17) % 100;
          const top = (seed * 23) % 100;
          const opacityBase = 0.1 + ((seed % 6) / 10);
          const opacityHigh = 0.2 + ((seed % 8) / 10);
          return (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{ left: `${left}%`, top: `${top}%`, opacity: opacityBase }}
              animate={{
                opacity: [opacityBase, opacityHigh, opacityBase],
                scale: [1, 1.2 + (seed % 3) * 0.1, 1],
              }}
              transition={{
                duration: 2 + (seed % 3),
                repeat: Infinity,
                delay: (seed % 5) * 0.5,
              }}
            />
          );
        })}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative max-w-4xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={item} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.12] text-sm text-[#A855F7]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('badge')}</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={item}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-white">{t('heroTitle1')}</span>
          <br />
          <span className="gradient-text">{t('heroTitle2')}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="text-lg sm:text-xl text-[#A598C7] max-w-2xl mx-auto leading-relaxed mb-10"
        >
          {t('heroSubtitle')}
        </motion.p>

        {/* CTA button - Spotify OAuth */}
        <motion.div variants={item} className="flex items-center justify-center mb-6">
          <Link
            href="/api/auth/spotify"
            className="group flex items-center gap-3 bg-[#1DB954] hover:bg-[#1aa34a] text-white font-bold px-7 py-4 rounded-2xl text-base transition-all hover:shadow-xl hover:shadow-[#1DB954]/25 hover:-translate-y-0.5"
          >
            <SpotifyIcon />
            {t('ctaSpotify')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Trust text */}
        <motion.p variants={item} className="text-sm text-[#A598C7]">
          {t('ctaFreeTrial')}
        </motion.p>

        {/* Animated mock preview */}
        <motion.div
          variants={item}
          className="mt-16 relative max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#1A1535]/80 backdrop-blur-sm shadow-2xl shadow-[#7C3AED]/10">
            {/* Mock dashboard preview */}
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 h-6 bg-white/[0.04] rounded-lg mx-4" />
            </div>
            <div className="p-6 grid grid-cols-3 gap-3">
              {['Indie Pop 32%', 'Lo-fi 24%', 'Phonk 18%'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  className="h-16 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#A855F7]/10 border border-[#7C3AED]/10 flex items-center justify-center text-xs font-medium text-[#A855F7]"
                >
                  {item}
                </motion.div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="h-24 rounded-xl bg-gradient-to-r from-[#1A1535] to-[#2D2455] border border-white/[0.06] p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-xs text-[#A598C7] italic leading-relaxed"
                >
                  "Gecenin Phonk'u seni ele veriyor. 91 desibel yüksekliğinde
                  telefona sığdırmaya çalıştığın o enerji..."
                </motion.div>
              </div>
            </div>
          </div>

          {/* Glow under the card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-[#7C3AED] blur-[40px] opacity-20 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
