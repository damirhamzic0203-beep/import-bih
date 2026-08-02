import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ConditionalWhatsApp } from '@/components/conditional-whatsapp';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Import BiH — Uvoz iz Kine u Bosnu i Hercegovinu',
  description:
    'Od pronalaska dobavljača do transporta, carine i dostave na vašu adresu. Mi organizujemo cijeli proces uvoza iz Kine.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <ConditionalWhatsApp />
      </body>
    </html>
  );
}
