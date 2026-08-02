'use client';

import { usePathname } from 'next/navigation';
import { WhatsAppButton } from './whatsapp-button';

export function ConditionalWhatsApp() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/client')) return null;
  return <WhatsAppButton />;
}
