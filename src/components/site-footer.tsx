import Link from 'next/link';
import { Logo } from '@/components/logo';

const FOOTER_LINKS = [
  {
    heading: 'Usluge',
    links: [
      { href: '/uvoz-iz-kine',        label: 'Uvoz iz Kine' },
      { href: '/sourcing-kina',        label: 'Sourcing' },
      { href: '/transport-kina-bih',   label: 'Međunarodni transport' },
      { href: '/carinska-procedura',   label: 'Carina i špedicija' },
    ],
  },
  {
    heading: 'Kompanija',
    links: [
      { href: '/#kako-funkcionise', label: 'Kako funkcioniše' },
      { href: '/#usluge',           label: 'Naše usluge' },
      { href: '/blog',              label: 'Blog' },
      { href: '/#kontakt',          label: 'Kontakt' },
    ],
  },
  {
    heading: 'Alati',
    links: [
      { href: '/kalkulator-uvoza',    label: 'Kalkulator uvoza' },
      { href: '/alibaba-bih',         label: 'Alibaba za BiH' },
      { href: '/1688-bih',            label: '1688.com vodič' },
      { href: '/uvoz-robe-iz-kine',   label: 'Vodič za uvoznike' },
    ],
  },
  {
    heading: 'Pravno',
    links: [
      { href: '#', label: 'Uslovi korištenja' },
      { href: '#', label: 'Politika privatnosti' },
      { href: '#', label: 'Cookie politika' },
    ],
  },
];

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink-950 text-ink-400">
      <div className="mx-auto max-w-6xl px-6">
        {/* Main footer columns */}
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Logo variant="light" size="md" />
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              Vaš pouzdan partner za uvoz robe iz Kine u Bosnu i Hercegovinu.
            </p>
            <div className="mt-4 space-y-1 text-xs text-ink-600">
              <p className="font-semibold text-ink-400">Isu Hamzic d.o.o.</p>
              <p>Srebrenik 75350, BiH</p>
              <a href="mailto:kontakt@importbih.com" className="text-ink-400 hover:text-white transition">kontakt@importbih.com</a>
            </div>
            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {[
                { Icon: IconLinkedIn, href: '#', label: 'LinkedIn' },
                { Icon: IconFacebook, href: '#', label: 'Facebook' },
                { Icon: IconInstagram, href: '#', label: 'Instagram' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-ink-400 transition hover:bg-ink-700 hover:text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-500">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-400 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-800 py-6 text-xs text-ink-600 sm:flex-row">
          <span>© {new Date().getFullYear()} Import BiH. Sva prava zadržana.</span>
          <span>Srebrenik, Bosna i Hercegovina</span>
        </div>
      </div>
    </footer>
  );
}
