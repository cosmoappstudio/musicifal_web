import { getTranslations } from 'next-intl/server';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAnalyticsPage({ params }: Props) {
  await params;
  const t = await getTranslations('analytics');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-[#A598C7] text-sm mt-1">{t('subtitle')}</p>
      </div>
      <AdminAnalytics />
    </div>
  );
}
