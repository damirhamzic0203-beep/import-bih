import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/sign-out-button';
import { NotificationBell } from '@/components/notification-bell';
import { MobileNav } from '@/components/mobile-nav';
import { Logo } from '@/components/logo';

const NAV = [
  { href: '/client/dashboard', label: 'Dashboard' },
  { href: '/client/requests', label: 'Moji zahtjevi' },
  { href: '/client/requests/new', label: '+ Novi zahtjev' },
  { href: '/client/shipments', label: 'Pošiljke' },
  { href: '/client/documents', label: 'Dokumenti' },
  { href: '/client/messages', label: 'Poruke' },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-ink-200 bg-white md:block">
        <div className="border-b border-ink-200 px-6 py-5">
          <Logo variant="dark" size="sm" href="/client/dashboard" />
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <span className="text-sm text-ink-500">Dobrodošli, {session.user.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <SignOutButton />
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
