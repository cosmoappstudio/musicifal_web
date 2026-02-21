import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';
import { Music2 } from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });

  return {
    title: `Musicifal — ${t('heroTitle1')} ${t('heroTitle2')}`,
    description: t('heroSubtitle'),
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#0D0B1E]/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-[#7C3AED] rounded-lg blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="relative flex items-center justify-center w-8 h-8 bg-[#7C3AED] rounded-lg">
                  <Music2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="font-bold text-lg">Musicifal</span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <LocaleSwitcher />
              <Link
                href={`/${locale}/share/demo`}
                className="hidden sm:inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
              >
                Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
