import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/dashboard/Navbar';
import PlanUpgradeButton from '@/components/dashboard/PlanUpgradeButton';
import { getCurrentUser } from '@/lib/auth';
import { Music2, Zap, Globe, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type Props = {
  params: Promise<{ locale: string }>;
};

const PLAN_INFO = {
  free: { label: 'Ücretsiz', color: 'text-white/60', bg: 'bg-white/5 border-white/10' },
  weekly: { label: 'Haftalık', color: 'text-[#A855F7]', bg: 'bg-[#7C3AED]/10 border-[#7C3AED]/20' },
  monthly: { label: 'Aylık', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10 border-[#10B981]/20' },
  yearly: { label: 'Yıllık', color: 'text-[#F59E0B]', bg: 'bg-[#D97706]/10 border-[#D97706]/20' },
};

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('settings');
  const user = await getCurrentUser();
  if (!user) return null;

  const displayName = user.name || user.email || 'User';
  const avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.id}&backgroundColor=7C3AED`;

  return (
    <div className="min-h-screen">
      <Navbar locale={locale} />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <section className="surface-card p-6">
            <h2 className="text-base font-semibold text-white mb-4">{t('profileSection')}</h2>
            <div className="flex items-center gap-4 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-2xl border border-white/10"
              />
              <div>
                <p className="font-semibold text-white">{displayName}</p>
                <p className="text-sm text-[#A598C7]">{user.email ?? ''}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#A598C7] mb-1.5 block">Ad Soyad</label>
                <input
                  type="text"
                  defaultValue={displayName}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#A598C7] focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#A598C7] mb-1.5 block">E-posta</label>
                <input
                  type="email"
                  defaultValue={user.email ?? ''}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#A598C7] focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
                />
              </div>
            </div>
            <button className="mt-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
              {t('saveChanges')}
            </button>
          </section>

          <Separator className="bg-white/[0.06]" />

          {/* Connections */}
          <section className="surface-card p-6">
            <h2 className="text-base font-semibold text-white mb-4">{t('connectionsSection')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1DB954]/10 flex items-center justify-center">
                    <Music2 className="w-4 h-4 text-[#1DB954]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Spotify</p>
                    <p className="text-xs text-[#A598C7]">
                      {user.spotifyConnected ? t('spotifyConnected') : t('spotifyDisconnected')}
                    </p>
                  </div>
                </div>
                <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  user.spotifyConnected
                    ? 'bg-white/[0.05] text-[#A598C7] hover:text-white hover:bg-white/[0.08]'
                    : 'bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954]/20 border border-[#1DB954]/20'
                }`}>
                  {user.spotifyConnected ? t('disconnect') : t('connect')}
                </button>
              </div>

            </div>
          </section>

          <Separator className="bg-white/[0.06]" />

          {/* Plan */}
          <section className="surface-card p-6">
            <h2 className="text-base font-semibold text-white mb-4">{t('planSection')}</h2>
            <div className={`flex items-center justify-between p-4 rounded-xl border ${PLAN_INFO[user.plan].bg}`}>
              <div className="flex items-center gap-3">
                <Zap className={`w-5 h-5 ${PLAN_INFO[user.plan].color}`} />
                <div>
                  <p className={`font-semibold ${PLAN_INFO[user.plan].color}`}>
                    {PLAN_INFO[user.plan].label}
                  </p>
                  <p className="text-xs text-[#A598C7]">{t('currentPlan')}</p>
                </div>
              </div>
              {user.plan !== 'yearly' && (
                <PlanUpgradeButton currentPlan={user.plan} />
              )}
            </div>
          </section>

          <Separator className="bg-white/[0.06]" />

          {/* Language */}
          <section className="surface-card p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#A598C7]" />
              {t('languageSection')}
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { code: 'tr', label: '🇹🇷 TR', name: 'Türkçe' },
                { code: 'en', label: '🇬🇧 EN', name: 'English' },
                { code: 'de', label: '🇩🇪 DE', name: 'Deutsch' },
                { code: 'ru', label: '🇷🇺 RU', name: 'Русский' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  className={`p-3 rounded-xl text-sm font-medium text-center transition-colors border ${
                    locale === lang.code
                      ? 'border-[#7C3AED]/40 bg-[#7C3AED]/10 text-white'
                      : 'border-white/[0.06] bg-white/[0.03] text-[#A598C7] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-base mb-0.5">{lang.label.split(' ')[0]}</div>
                  <div className="text-[10px]">{lang.name}</div>
                </button>
              ))}
            </div>
          </section>

          <Separator className="bg-white/[0.06]" />

          {/* Danger zone */}
          <section className="surface-card p-6 border-red-500/10">
            <h2 className="text-base font-semibold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('dangerSection')}
            </h2>
            <p className="text-xs text-[#A598C7] mb-4">{t('deleteWarning')}</p>
            <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              {t('deleteAccount')}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
