import { getTranslations } from 'next-intl/server';
import AppSettings from '@/components/admin/AppSettings';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({ params }: Props) {
  await params;
  const t = await getTranslations('admin');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('appSettings')}</h1>
        <p className="text-[#A598C7] text-sm mt-1">{t('settingsSubtitle')}</p>
      </div>

      <AppSettings />
    </div>
  );
}
