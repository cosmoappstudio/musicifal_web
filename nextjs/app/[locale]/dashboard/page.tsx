import Navbar from '@/components/dashboard/Navbar';
import DashboardContent from '@/components/dashboard/DashboardContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      <Navbar locale={locale} />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <DashboardContent locale={locale} />
      </main>
    </div>
  );
}
