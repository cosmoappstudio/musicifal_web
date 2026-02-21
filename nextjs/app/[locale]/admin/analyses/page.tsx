import { getTranslations } from 'next-intl/server';
import { mockAdminAnalyses } from '@/lib/mock-data';
import AdminAnalysesList from '@/components/admin/AdminAnalysesList';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAnalysesPage({ params }: Props) {
  await params;
  const t = await getTranslations('admin');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('analyses')}</h1>
        <p className="text-[#A598C7] text-sm mt-1">
          {t('analysesSubtitle', { total: mockAdminAnalyses.length })}
        </p>
      </div>

      <AdminAnalysesList />
    </div>
  );
}
