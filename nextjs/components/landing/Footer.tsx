'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Music2 } from 'lucide-react';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-white/[0.06] bg-[#0D0B1E] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                <Music2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Musicifal</span>
            </div>
            <p className="text-sm text-[#A598C7] max-w-xs leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">{t('product')}</h4>
              <ul className="space-y-2">
                {[t('features'), t('pricing'), t('demo')].map((l) => (
                  <li key={l}>
                    <Link href={`/${locale}`} className="text-sm text-[#A598C7] hover:text-white transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">{t('company')}</h4>
              <ul className="space-y-2">
                {[t('about'), t('blog'), t('contact')].map((l) => (
                  <li key={l}>
                    <Link href={`/${locale}`} className="text-sm text-[#A598C7] hover:text-white transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">{t('legal')}</h4>
              <ul className="space-y-2">
                {[t('privacy'), t('terms'), t('cookies')].map((l) => (
                  <li key={l}>
                    <Link href={`/${locale}`} className="text-sm text-[#A598C7] hover:text-white transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#A598C7]">
            {t('copyright')}
          </p>
          <div className="flex items-center gap-1 text-xs text-[#A598C7]">
            <span>Spotify</span>
            <span>·</span>
            <span>Supabase</span>
            <span>·</span>
            <span>Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
