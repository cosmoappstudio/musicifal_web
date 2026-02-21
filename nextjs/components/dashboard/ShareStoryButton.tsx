'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageDown, Check, Lock } from 'lucide-react';
import { mockUser } from '@/lib/mock-data';

export default function ShareStoryButton() {
  const t = useTranslations('dashboard');
  const [copied, setCopied] = useState(false);
  const isPaid = mockUser.plan !== 'free';

  const handleShare = async () => {
    // In a real app, this would use html-to-image to export
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleShare}
      className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
        isPaid
          ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white hover:shadow-lg hover:shadow-[#7C3AED]/30'
          : 'bg-white/[0.05] border border-white/10 text-[#A598C7] hover:bg-white/[0.08]'
      }`}
    >
      {!isPaid && <Lock className="w-3.5 h-3.5" />}
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <ImageDown className="w-4 h-4" />
      )}
      {t('shareStory')}
      {!isPaid && (
        <span className="pro-badge ml-1">PRO</span>
      )}
    </motion.button>
  );
}
