import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from '@/components/ui/sonner';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-[#0D0B1E]">
        {children}
      </div>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#1A1535',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F8F7FF',
          },
        }}
      />
    </NextIntlClientProvider>
  );
}
