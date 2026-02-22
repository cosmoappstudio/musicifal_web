'use client';

import { useTranslations } from 'next-intl';
import { Music2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function FetchDataPrompt() {
  const t = useTranslations('dashboard');
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spotify/fetch', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data.error === 'spotify_403' && data.detail
          ? data.detail
          : data.error || 'Failed to fetch data';
        alert(msg);
        // 403 = suggest reconnect
        if (res.status === 403) {
          if (window.confirm('Spotify ile yeniden bağlanmak ister misin?')) {
            window.location.href = '/api/auth/spotify?reconnect=1';
          }
        }
      }
    } catch {
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center mx-auto mb-6">
        <Music2 className="w-8 h-8 text-[#A855F7]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{t('fetchDataTitle')}</h2>
      <p className="text-[#A598C7] text-sm max-w-md mx-auto mb-8">
        {t('fetchDataSubtitle')}
      </p>
      <button
        onClick={handleFetch}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1aa34a] disabled:opacity-70 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
      >
        {loading ? t('fetching') : t('fetchDataCta')}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
