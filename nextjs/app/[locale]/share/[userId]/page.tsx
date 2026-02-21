import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Music2, Sparkles } from 'lucide-react';
import { mockUser, mockAnalysis, mockFortune } from '@/lib/mock-data';

type Props = {
  params: Promise<{ locale: string; userId: string }>;
};

export default async function SharePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');
  const tShare = await getTranslations('share');

  const fortuneText = mockFortune[locale as 'tr' | 'en' | 'de' | 'ru'] || mockFortune.tr;
  const firstParagraph = fortuneText.split('\n\n')[0];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED] opacity-[0.08] blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-[#7C3AED]/20 bg-gradient-to-b from-[#1A1535] to-[#0D0B1E] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Musicifal</span>
          </div>

          {/* User info */}
          <div className="p-6 text-center border-b border-white/[0.06]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mockUser.avatarUrl}
              alt={mockUser.name}
              className="w-16 h-16 rounded-full border-2 border-[#7C3AED]/40 mx-auto mb-3"
            />
            <h2 className="font-bold text-lg text-white">{mockUser.name}</h2>
            <p className="text-sm text-[#A598C7] mt-0.5">{t('subtitle')}</p>

            {/* Top genres */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {mockAnalysis.genres.slice(0, 3).map((g) => (
                <span
                  key={g.name}
                  className="text-xs px-2.5 py-1 rounded-full border font-medium"
                  style={{ borderColor: `${g.color}40`, color: g.color, backgroundColor: `${g.color}10` }}
                >
                  {g.name} {g.percentage}%
                </span>
              ))}
            </div>
          </div>

          {/* Fortune preview */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#A855F7]" />
              <span className="text-sm font-semibold text-[#A855F7]">{t('fortuneTitle')}</span>
            </div>
            <p className="fortune-text text-sm text-[#A598C7]">
              {firstParagraph.slice(0, 180)}...
            </p>
          </div>

          {/* CTA */}
          <div className="p-6 pt-0">
            <Link
              href={`/${locale}`}
              className="block text-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              {tShare('cta')}
            </Link>
            <p className="text-[10px] text-[#A598C7] text-center mt-3">
              {tShare('freeStart')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
