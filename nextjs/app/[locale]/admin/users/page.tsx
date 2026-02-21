import { getTranslations } from 'next-intl/server';
import UsersTable from '@/components/admin/UsersTable';
import { mockAdminUsers } from '@/lib/mock-data';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: Props) {
  await params;
  const t = await getTranslations('admin');

  const totalActive = mockAdminUsers.filter((u) => u.status === 'active').length;
  const totalSuspended = mockAdminUsers.filter((u) => u.status === 'suspended').length;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('users')}</h1>
          <p className="text-[#A598C7] text-sm mt-1">
            {t('usersSubtitle', { total: mockAdminUsers.length, active: totalActive, suspended: totalSuspended })}
          </p>
        </div>
      </div>

      <UsersTable />
    </div>
  );
}
