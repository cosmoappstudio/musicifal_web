import Navbar from '@/components/dashboard/Navbar';
import FortuneFullScreen from '@/components/dashboard/FortuneFullScreen';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FortunePage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      <Navbar locale={locale} />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED] opacity-[0.06] blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#A855F7] opacity-[0.04] blur-[100px] rounded-full" />
      </div>

      <main className="relative container mx-auto max-w-4xl px-4 py-12">
        <FortuneFullScreen />
      </main>
    </div>
  );
}
