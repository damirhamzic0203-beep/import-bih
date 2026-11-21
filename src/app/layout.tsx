import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ConditionalWhatsApp } from '@/components/conditional-whatsapp';
import { JsonLd } from '@/components/json-ld';
import { SITE_URL, SITE_NAME, absUrl } from '@/lib/site';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });

const DESCRIPTION =
  'Od pronalaska dobavljača do transporta, carine i dostave na vašu adresu. Mi organizujemo cijeli proces uvoza iz Kine.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Import BiH — Uvoz iz Kine u Bosnu i Hercegovinu',
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'bs_BA',
    title: 'Import BiH — Uvoz iz Kine u Bosnu i Hercegovinu',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: 'Isu Hamzić d.o.o.',
  url: SITE_URL,
  email: 'kontakt@importbih.com',
  logo: absUrl('/icon.svg'),
  image: absUrl('/icon.svg'),
  description: DESCRIPTION,
  areaServed: { '@type': 'Country', name: 'Bosna i Hercegovina', identifier: 'BA' },
  knowsAbout: ['Uvoz iz Kine', 'Carinjenje', 'Sourcing dobavljača', 'Međunarodni transport'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" className={inter.variable}>
      <body className="font-sans antialiased">
        <JsonLd data={organizationLd} />
        <Providers>{children}</Providers>
        <ConditionalWhatsApp />
      </body>
    </html>
  );
}
