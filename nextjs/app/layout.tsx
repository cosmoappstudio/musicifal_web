import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Musicifal — Müzik Falın',
  description: 'Son 14 günlük dinleme alışkanlıklarından kişisel müzik falın çıkar. Spotify Wrapped\'ın gücü, tarot kartının atmosferi.',
  keywords: ['müzik fal', 'spotify analiz', 'music wrapped', 'müzik DNA'],
  openGraph: {
    title: 'Musicifal — Müzik Falın',
    description: 'Müziğin seni ele veriyor.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${plusJakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
