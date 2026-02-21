import { getTranslations } from 'next-intl/server';
import AdminRevenueContent from '@/components/admin/AdminRevenueContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminRevenuePage({ params }: Props) {
  await params;
  const t = await getTranslations('admin');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('revenue')}</h1>
        <p className="text-[#A598C7] text-sm mt-1">{t('revenueSubtitle')}</p>
      </div>

      <AdminRevenueContent />
    </div>
  );
}
