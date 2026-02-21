import { getTranslations } from 'next-intl/server';
import AdminOverviewContent from '@/components/admin/AdminOverviewContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOverviewPage({ params }: Props) {
  await params;
  const t = await getTranslations('admin');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('overview')}</h1>
        <p className="text-[#A598C7] text-sm mt-1">{t('overviewSubtitle')}</p>
      </div>

      <AdminOverviewContent />
    </div>
  );
}
