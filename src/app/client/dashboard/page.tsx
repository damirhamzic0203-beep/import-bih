import { Fragment } from 'react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IMPORT_STATUS_LABELS, IMPORT_STATUS_COLORS } from '@/lib/status';
import { StatusDonutChart } from '@/components/status-donut-chart';

// ─── Status workflow order ────────────────────────────────────────────────────

const STATUS_ORDER = [
  'NEW',
  'REQUIRES_ASSESSMENT',
  'UNDER_REVIEW',
  'SOURCING',
  'SUPPLIER_SELECTED',
  'NEGOTIATION',
  'QUALITY_CONTROL',
  'TRANSPORT_QUOTATION',
  'CLIENT_APPROVAL',
  'ORDER_CONFIRMED',
  'GOODS_READY',
  'IN_TRANSIT',
  'CUSTOMS',
  'DELIVERY',
  'COMPLETED',
];

function getProgress(status: string): number {
  const idx = STATUS_ORDER.indexOf(status);
  if (idx === -1) return 0;
  return Math.round((idx / (STATUS_ORDER.length - 1)) * 100);
}

function getProgressColor(pct: number): string {
  if (pct === 100) return 'bg-emerald-500';
  if (pct >= 70) return 'bg-brand-400';
  if (pct >= 35) return 'bg-brand-600';
  return 'bg-ink-300';
}

// ─── Status dot icon ─────────────────────────────────────────────────────────

const ACTIVE_STATUSES = [
  'UNDER_REVIEW', 'SOURCING', 'SUPPLIER_SELECTED', 'NEGOTIATION',
  'QUALITY_CONTROL', 'ORDER_CONFIRMED', 'GOODS_READY',
];
const AWAITING_STATUSES = ['TRANSPORT_QUOTATION', 'CLIENT_APPROVAL'];
const TRANSIT_STATUSES = ['IN_TRANSIT', 'CUSTOMS', 'DELIVERY'];

// ─── Inline icons ─────────────────────────────────────────────────────────────

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconHourglass() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconList() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

// ─── Empty state illustration ─────────────────────────────────────────────────

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-40 w-auto" aria-hidden="true">
      {/* Background circle */}
      <ellipse cx="140" cy="175" rx="100" ry="14" fill="#f1f5f9" />

      {/* Box body */}
      <rect x="80" y="80" width="120" height="90" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />

      {/* Box flaps open */}
      <path d="M 80 80 L 100 58 L 180 58 L 200 80" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="2" />
      <path d="M 100 58 L 140 72 L 180 58" fill="#93c5fd" stroke="#60a5fa" strokeWidth="1.5" />

      {/* Arrow coming out of box */}
      <line x1="140" y1="58" x2="140" y2="28" stroke="#1c92c9" strokeWidth="2" strokeDasharray="4 3" />
      <path d="M 132 34 L 140 24 L 148 34" stroke="#1c92c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Stars/sparkles */}
      <circle cx="215" cy="70" r="4" fill="#ecc94b" />
      <circle cx="65" cy="90" r="3" fill="#4bacd9" />
      <circle cx="230" cy="110" r="2.5" fill="#4bacd9" />
      <circle cx="55" cy="130" r="2" fill="#ecc94b" />

      {/* Box stripe detail */}
      <line x1="80" y1="110" x2="200" y2="110" stroke="#93c5fd" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="140" y1="80" x2="140" y2="170" stroke="#93c5fd" strokeWidth="1" strokeDasharray="6 4" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  const clientId = session!.user.id;
  const userName = session!.user.name ?? 'klijent';
  const firstName = userName.split(' ')[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobro jutro' : hour < 18 ? 'Dobar dan' : 'Dobro veče';

  const requests = await prisma.importRequest.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const activeCount   = requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length;
  const awaitingCount = requests.filter((r) => AWAITING_STATUSES.includes(r.status)).length;
  const transitCount  = requests.filter((r) => TRANSIT_STATUSES.includes(r.status)).length;
  const doneCount     = requests.filter((r) => r.status === 'COMPLETED').length;

  const kpiCards = [
    {
      label: 'Aktivni uvozi',
      value: activeCount,
      sub: 'u obradi',
      Icon: IconBox,
      iconBg: 'bg-brand-100',
      iconColor: 'text-brand-700',
      gradFrom: 'from-brand-50',
      borderColor: 'border-brand-100',
    },
    {
      label: 'Čekaju odgovor',
      value: awaitingCount,
      sub: 'ponuda/odobrenje',
      Icon: IconHourglass,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      gradFrom: 'from-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'U transportu',
      value: transitCount,
      sub: 'pošiljke na putu',
      Icon: IconTruck,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-700',
      gradFrom: 'from-sky-50',
      borderColor: 'border-sky-100',
    },
    {
      label: 'Završeni uvozi',
      value: doneCount,
      sub: 'uspješno dostavljeno',
      Icon: IconCheck,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      gradFrom: 'from-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ];

  const donutSegments = [
    { label: 'Aktivni',       count: activeCount,   color: '#1478a8' },
    { label: 'Čekaju',        count: awaitingCount, color: '#d69e2e' },
    { label: 'U transportu',  count: transitCount,  color: '#0ea5e9' },
    { label: 'Završeni',      count: doneCount,     color: '#10b981' },
  ];

  const quickActions = [
    { href: '/client/requests/new',  label: 'Novi zahtjev za uvoz', Icon: IconPlus,    accent: 'text-brand-700 bg-brand-50' },
    { href: '/client/requests',      label: 'Svi moji zahtjevi',    Icon: IconList,    accent: 'text-ink-700 bg-ink-50' },
    { href: '/client/documents',     label: 'Dokumenti',            Icon: IconDoc,     accent: 'text-ink-700 bg-ink-50' },
    { href: '/client/messages',      label: 'Poruke',               Icon: IconMessage, accent: 'text-ink-700 bg-ink-50' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-8 sm:px-8"
        style={{ background: 'linear-gradient(135deg, #0a4d70 0%, #1478a8 55%, #1c92c9 100%)' }}>

        {/* Dot grid */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
          <defs>
            <pattern id="dd" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dd)" />
        </svg>

        {/* Glow orb */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-400 opacity-20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-200">{greeting},</p>
            <h1 className="mt-0.5 text-2xl font-bold text-white sm:text-3xl">{firstName} 👋</h1>
            <p className="mt-2 text-sm text-brand-200">
              {activeCount > 0
                ? `Imate ${activeCount} aktivnih uvoza${awaitingCount > 0 ? ` i ${awaitingCount} ponuda na čekanju` : ''}.`
                : 'Dobrodošli! Kreirajte prvi zahtjev za uvoz.'}
            </p>
          </div>

          <Link
            href="/client/requests/new"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25 sm:shrink-0"
          >
            <span className="text-lg leading-none">+</span>
            Novi zahtjev
          </Link>
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpiCards.map(({ label, value, sub, Icon, iconBg, iconColor, gradFrom, borderColor }) => (
          <div
            key={label}
            className={`relative overflow-hidden rounded-xl border ${borderColor} bg-gradient-to-br ${gradFrom} to-white p-5 shadow-card`}
          >
            {/* Icon in colored circle — top right */}
            <div className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
              <Icon />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
            <p className="mt-3 text-4xl font-extrabold leading-none text-ink-900">{value}</p>
            <p className="mt-2 text-xs text-ink-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ─────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── REQUESTS TABLE (2 cols) ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 className="font-semibold text-ink-900">Nedavni zahtjevi</h2>
              <Link href="/client/requests" className="text-xs font-medium text-brand-700 hover:underline">
                Svi zahtjevi →
              </Link>
            </div>

            {requests.length === 0 ? (
              /* ── EMPTY STATE ─────────────────────────────────────────── */
              <div className="px-6 py-12 text-center">
                <EmptyIllustration />

                <h3 className="mt-5 text-xl font-bold text-ink-900">Vaš prvi uvoz čeka!</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-500">
                  Opišite šta želite uvesti, a naš tim preuzima sve — od sourcing-a do dostave.
                </p>

                <Link
                  href="/client/requests/new"
                  className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-800"
                >
                  Zatražite ponudu besplatno
                </Link>

                {/* Mini how-to guide */}
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { n: '1', title: 'Opišite proizvod', desc: 'Naziv, fotografija ili link — dovoljno je i nekoliko riječi.' },
                    { n: '2', title: 'Dobijete ponudu', desc: 'U roku 24h primite detaljan plan uvoza s cijenama.' },
                    { n: '3', title: 'Roba stiže', desc: 'Mi vodimo cio proces — transport, carina, dostava.' },
                  ].map((s) => (
                    <div key={s.n} className="rounded-xl border border-ink-100 bg-ink-50 p-4 text-left">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                        {s.n}
                      </span>
                      <p className="mt-2.5 text-xs font-bold text-ink-900">{s.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-500">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ── REQUESTS TABLE ─────────────────────────────────────── */
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <tr>
                      <th className="px-5 py-3.5">Kod</th>
                      <th className="px-5 py-3.5">Proizvod</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => {
                      const progress = getProgress(r.status);
                      const progressColor = getProgressColor(progress);
                      return (
                        <Fragment key={r.id}>
                          <tr className="group transition-colors hover:bg-brand-50">
                            <td className="px-5 py-4 font-mono text-xs font-bold text-brand-700">
                              <Link href={`/client/requests/${r.id}`} className="hover:underline">
                                {r.code}
                              </Link>
                            </td>
                            <td className="px-5 py-4">
                              <Link href={`/client/requests/${r.id}`}
                                className="line-clamp-1 font-medium text-ink-900 hover:underline">
                                {r.productName}
                              </Link>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${IMPORT_STATUS_COLORS[r.status]}`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
                                {IMPORT_STATUS_LABELS[r.status]}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right text-xs text-ink-400">
                              {r.createdAt.toLocaleDateString('bs-BA')}
                            </td>
                          </tr>
                          {/* Progress bar row */}
                          <tr>
                            <td colSpan={4} className="px-0 pb-0 pt-0">
                              <div className="h-0.5 w-full bg-ink-100">
                                <div
                                  className={`h-0.5 ${progressColor} transition-all duration-500`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR (1 col) ─────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Quick actions card */}
          <div className="rounded-xl border border-ink-200 bg-white shadow-card">
            <div className="border-b border-ink-100 px-5 py-4">
              <h2 className="font-semibold text-ink-900">Brze akcije</h2>
            </div>
            <ul className="divide-y divide-ink-50 px-2 py-2">
              {quickActions.map(({ href, label, Icon, accent }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                      <Icon />
                    </span>
                    {label}
                    <span className="ml-auto text-ink-300">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Status overview / donut chart */}
          <div className="rounded-xl border border-ink-200 bg-white shadow-card">
            <div className="border-b border-ink-100 px-5 py-4">
              <h2 className="font-semibold text-ink-900">Pregled statusa</h2>
            </div>
            <div className="p-5">
              <StatusDonutChart segments={donutSegments} />
              {requests.length === 0 && (
                <p className="mt-3 text-center text-xs text-ink-400">
                  Kreirajte zahtjev da vidite statistike.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
