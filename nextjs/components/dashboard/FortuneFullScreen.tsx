'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Share2, RefreshCw, Lock } from 'lucide-react';
import { mockFortune, mockUser } from '@/lib/mock-data';
import UpgradeButton from '@/components/UpgradeButton';

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 18);
    return () => clearInterval(timer);
  }, [started, text]);

  return (
    <span>
      {displayed}
      {started && displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="inline-block w-0.5 h-4 bg-[#A855F7] ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

export default function FortuneFullScreen() {
  const t = useTranslations('fortune');
  const dashT = useTranslations('dashboard');
  const locale = useLocale();
  const [selectedLang, setSelectedLang] = useState(locale as 'tr' | 'en' | 'de' | 'ru');
  const [isAnimating, setIsAnimating] = useState(true);

  const isPaid = mockUser.plan !== 'free';
  const fortuneText = mockFortune[selectedLang];
  const paragraphs = fortuneText.split('\n\n');

  const langs = isPaid
    ? (['tr', 'en', 'de', 'ru'] as const)
    : (['tr'] as const);

  const handleLangChange = (lang: 'tr' | 'en' | 'de' | 'ru') => {
    setSelectedLang(lang);
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-sm text-[#A855F7] mb-4">
          <Sparkles className="w-4 h-4" />
          <span>{t('title')}</span>
        </div>
        <p className="text-[#A598C7] text-sm max-w-md mx-auto italic">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Language tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {langs.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLangChange(lang)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedLang === lang
                ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30'
                : 'bg-white/[0.05] text-[#A598C7] hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {lang}
          </button>
        ))}
        {!isPaid && (
          <div className="flex items-center gap-1.5 text-xs text-[#A598C7] ml-2">
            <Lock className="w-3 h-3" />
            <span>DE · RU</span>
            <span className="pro-badge">PRO</span>
          </div>
        )}
      </div>

      {/* Fortune card */}
      <motion.div
        key={selectedLang}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-[#7C3AED]/20 bg-gradient-to-br from-[#1A1535] to-[#0D0B1E] p-8 md:p-10"
      >
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7C3AED] opacity-[0.06] blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#A855F7] opacity-[0.04] blur-[80px] rounded-full" />

        <div className="relative">
          {/* Star decoration */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6 text-[#D97706]" />
            </motion.div>
          </div>

          {/* Paragraphs with typewriter */}
          <div className="space-y-5">
            {isPaid
              ? paragraphs.map((para, i) => (
                  <AnimatePresence key={i}>
                    {isAnimating && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="fortune-text"
                      >
                        {i === 0 ? (
                          <TypewriterText text={para} delay={0.2} />
                        ) : (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.3 }}
                          >
                            {para}
                          </motion.span>
                        )}
                      </motion.p>
                    )}
                  </AnimatePresence>
                ))
              : (
                <div>
                  <p className="fortune-text">
                    {isAnimating && <TypewriterText text={paragraphs[0]} delay={0.2} />}
                  </p>
                  <div className="mt-6 p-4 rounded-xl border border-[#D97706]/20 bg-[#D97706]/5 text-center">
                    <Lock className="w-5 h-5 text-[#D97706] mx-auto mb-2" />
                    <p className="text-sm text-[#A598C7]">{dashT('fortuneBlurred')}</p>
                    <UpgradeButton
                      plan="starter"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90"
                    >
                      {dashT('upgradeForFortune')}
                    </UpgradeButton>
                  </div>
                </div>
              )
            }
          </div>

          {/* Generated at */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-[#A598C7]" suppressHydrationWarning>
              {t('generatedAt')}: {new Date(mockFortune.generatedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-xs text-[#A598C7] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                {t('shareBtn')}
              </button>
              {isPaid && (
                <button className="flex items-center gap-1.5 text-xs text-[#A598C7] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t('newFortune')}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
