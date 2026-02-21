'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function ShareWhatsAppButton() {
  const t = useTranslations('dashboard');
  const tShare = useTranslations('share');
  const { user } = useDashboard();
  const isWatermarked = user.plan === 'free';
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/tr/share/demo`
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://musicifal.app') + '/tr/share/demo';

  const handleShare = () => {
    const text = isWatermarked
      ? tShare('whatsappTextWatermark', { url: shareUrl })
      : tShare('whatsappText', { url: shareUrl });

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleShare}
      className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] hover:border-[#25D366]/40 transition-all"
    >
      <MessageCircle className="w-4 h-4" />
      {t('shareWhatsapp')}
      {isWatermarked && (
        <span className="text-[10px] text-[#A598C7] font-normal">{tShare('watermark')}</span>
      )}
    </motion.button>
  );
}
