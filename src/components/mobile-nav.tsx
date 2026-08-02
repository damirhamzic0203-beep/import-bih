'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

const NAV = [
  { href: '/client/dashboard', label: 'Dashboard' },
  { href: '/client/requests', label: 'Moji zahtjevi' },
  { href: '/client/requests/new', label: '+ Novi zahtjev' },
  { href: '/client/shipments', label: 'Pošiljke' },
  { href: '/client/documents', label: 'Dokumenti' },
  { href: '/client/messages', label: 'Poruke' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50"
        aria-label="Otvori navigacijski meni"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="15" y2="15" />
            <line x1="15" y1="3" x2="3" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="4.5" x2="15" y2="4.5" />
            <line x1="3" y1="9" x2="15" y2="9" />
            <line x1="3" y1="13.5" x2="15" y2="13.5" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-xl">
            <div className="border-b border-ink-200 px-6 py-5">
              <Logo variant="dark" size="sm" href="/client/dashboard" />
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
