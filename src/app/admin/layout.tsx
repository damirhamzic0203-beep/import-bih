import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/sign-out-button';
import { NotificationBell } from '@/components/notification-bell';
import { Logo } from '@/components/logo';
import { prisma } from '@/lib/prisma';

const STATIC_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/requests', label: 'Zahtjevi' },
  { href: '/admin/clients', label: 'Klijenti' },
  { href: '/admin/suppliers', label: 'Dobavljači' },
  { href: '/admin/forwarders', label: 'Transporteri' },
  { href: '/admin/quotes', label: 'Ponude' },
  { href: '/admin/shipments', label: 'Pošiljke' },
  { href: '/admin/documents', label: 'Dokumenti' },
  { href: '/admin/invoices', label: 'Fakture' },
  { href: '/admin/payments', label: 'Plaćanja' },
  { href: '/admin/messages', label: 'Poruke' },
  { href: '/admin/reports', label: 'Izvještaji' },
  { href: '/admin/hs-codes', label: 'HS kodovi' },
  { href: '/admin/settings', label: 'Podešavanja' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'CLIENT') redirect('/client/dashboard');

  let novaCount = 0;
  try {
    novaCount = await prisma.contactMessage.count({ where: { status: 'NOVA' } });
  } catch {
    // Silently ignore if table not yet migrated
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-ink-800 bg-ink-900 md:block">
        <div className="border-b border-ink-800 px-5 py-5">
          <Logo variant="light" size="sm" href="/admin/dashboard" />
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            Admin
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {STATIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin/contact-messages"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-white"
          >
            <span>Poruke sa sajta</span>
            {novaCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {novaCount > 99 ? '99+' : novaCount}
              </span>
            )}
          </Link>
        </nav>
      </aside>

      <div className="flex-1 bg-ink-50">
        <header className="flex items-center justify-between border-b border-ink-200 bg-white px-6 py-4">
          <span className="text-sm text-ink-500">
            {session.user.name} · <span className="uppercase">{session.user.role}</span>
          </span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <SignOutButton />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
