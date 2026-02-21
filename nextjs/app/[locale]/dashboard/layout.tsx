import { redirect } from 'next/navigation';
import { getDashboardData } from '@/lib/dashboard';
import { getSession } from '@/lib/session';
import { DashboardProvider } from '@/context/DashboardContext';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  const userId = await getSession();

  if (!userId) {
    redirect(`/${locale}?auth=required`);
  }

  const { user, analysis, fortune, rawFetchedAt } = await getDashboardData(userId);

  return (
    <DashboardProvider user={user} analysis={analysis} fortune={fortune} rawFetchedAt={rawFetchedAt}>
      {children}
    </DashboardProvider>
  );
}
