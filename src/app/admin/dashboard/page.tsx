import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency, IMPORT_STATUS_LABELS } from '@/lib/status';
import { StatusBarChart, RevenueAreaChart } from '@/components/admin-charts';
import type { StatusBarDatum, MonthRevenueDatum } from '@/components/admin-charts';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_ORDER = [
  'NEW', 'REQUIRES_ASSESSMENT', 'UNDER_REVIEW', 'SOURCING',
  'SUPPLIER_SELECTED', 'NEGOTIATION', 'QUALITY_CONTROL',
  'TRANSPORT_QUOTATION', 'CLIENT_APPROVAL', 'ORDER_CONFIRMED',
  'GOODS_READY', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERY', 'COMPLETED',
];

const SHORT_STATUS_LABELS: Record<string, string> = {
  NEW: 'Novo',
  REQUIRES_ASSESSMENT: 'Procjena',
  UNDER_REVIEW: 'Pregled',
  SOURCING: 'Sourcing',
  SUPPLIER_SELECTED: 'Dobavljač',
  NEGOTIATION: 'Pregovor',
  QUALITY_CONTROL: 'QC',
  TRANSPORT_QUOTATION: 'Tr. ponude',
  CLIENT_APPROVAL: 'Odobrenje',
  ORDER_CONFIRMED: 'Potvrđeno',
  GOODS_READY: 'Roba sprema',
  IN_TRANSIT: 'Transport',
  CUSTOMS: 'Carina',
  DELIVERY: 'Dostava',
  COMPLETED: 'Završeno',
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec',
];

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH:   'bg-amber-100 text-amber-700',
  MEDIUM: 'bg-ink-100 text-ink-600',
  LOW:    'bg-ink-50 text-ink-400',
};
const PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'Hitno',
  HIGH:   'Visok',
  MEDIUM: 'Srednji',
  LOW:    'Nizak',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function humanizeAction(action: string) {
  const map: Record<string, string> = {
    'request.created':         'Kreiran zahtjev',
    'request.status_changed':  'Status zahtjeva promijenjen',
    'quote.created':           'Ponuda kreirana',
    'quote.sent':              'Ponuda poslana',
    'quote.accepted':          'Ponuda prihvaćena',
    'quote.declined':          'Ponuda odbijena',
    'shipment.created':        'Pošiljka kreirana',
    'shipment.status_changed': 'Status pošiljke promijenjen',
    'task.created':            'Zadatak kreiran',
    'task.completed':          'Zadatak završen',
  };
  return map[action] ?? action;
}

function buildMonthlyRevenue(
  orders: Array<{
    confirmedAt: Date | null;
    revenue: number;
    profit: number;
  }>
): MonthRevenueDatum[] {
  const map = new Map<string, { revenue: number; profit: number }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
    map.set(key, { revenue: 0, profit: 0 });
  }

  for (const o of orders) {
    if (!o.confirmedAt) continue;
    const d = new Date(o.confirmedAt);
    const key = `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
    const existing = map.get(key);
    if (existing) {
      existing.revenue += o.revenue;
      existing.profit += o.profit;
    }
  }

  return Array.from(map.entries()).map(([month, v]) => ({
    month,
    revenue: Math.round(v.revenue * 100) / 100,
    profit:  Math.round(v.profit  * 100) / 100,
  }));
}

// ─── Inline icons ─────────────────────────────────────────────────────────────

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
    </svg>
  );
}

function IconShip() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M2 21h20M5 21V10.5L12 7l7 3.5V21" />
      <path d="M12 7V3M9 13h6" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconCash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
      <polyline points="17,6 23,6 23,12" />
    </svg>
  );
}

function IconPercent() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function IconFactory() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M2 20h20M3 20V9l5-3v5l5-3v5l5-3v11" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionEyebrow({ eyebrow, title, action }: {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</p>
        <h2 className="mt-0.5 text-lg font-bold text-ink-900">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="text-xs font-medium text-brand-700 hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    requestsCount,
    activeShipments,
    pendingQuotes,
    activeClients,
    supplierOrders,
    ordersThisMonth,
    requestsByStatus,
    recentOrdersRaw,
    allOrdersRaw,
    urgentTasksRaw,
    recentLogsRaw,
  ] = await Promise.all([
    // Operational KPIs
    prisma.importRequest.count(),
    prisma.shipment.count({
      where: { importRequest: { status: { in: ['IN_TRANSIT', 'CUSTOMS', 'DELIVERY'] } } },
    }),
    prisma.quote.count({ where: { status: { in: ['SENT', 'CHANGES_REQUESTED'] } } }),
    prisma.company.count({ where: { users: { some: { importRequests: { some: {} } } } } }),
    prisma.supplierQuote.count(),

    // Financial KPIs (this month)
    prisma.order.findMany({
      where: { confirmedAt: { gte: startOfMonth } },
      include: { quote: { select: { totalAmount: true, internalCost: true, grossProfit: true } } },
    }),

    // Status bar chart
    prisma.importRequest.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),

    // Revenue area chart — last 6 months
    prisma.order.findMany({
      where: { confirmedAt: { gte: sixMonthsAgo } },
      select: {
        confirmedAt: true,
        quote: { select: { totalAmount: true, grossProfit: true } },
      },
    }),

    // Top clients (all time)
    prisma.order.findMany({
      include: {
        quote: {
          select: {
            totalAmount: true,
            grossProfit: true,
            importRequest: {
              select: {
                companyId: true,
                company: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    }),

    // Urgent / high-priority tasks not done
    prisma.task.findMany({
      where: {
        priority: { in: ['URGENT', 'HIGH'] },
        NOT: { status: 'DONE' },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        importRequest: { select: { id: true, code: true } },
        assignedTo: { select: { name: true } },
      },
    }),

    // Recent audit log entries
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  // ── Financial KPIs ─────────────────────────────────────────────────────────
  const revenue     = ordersThisMonth.reduce((s, o) => s + Number(o.quote.totalAmount   ?? 0), 0);
  const cost        = ordersThisMonth.reduce((s, o) => s + Number(o.quote.internalCost  ?? 0), 0);
  const grossProfit = revenue - cost;
  const avgMargin   = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  // ── Status chart data ──────────────────────────────────────────────────────
  const statusChartData: StatusBarDatum[] = requestsByStatus
    .map((g) => ({
      status: g.status,
      label:  SHORT_STATUS_LABELS[g.status] ?? g.status,
      count:  g._count._all,
    }))
    .sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    );

  // ── Revenue chart data ─────────────────────────────────────────────────────
  const revenueChartData = buildMonthlyRevenue(
    recentOrdersRaw.map((o) => ({
      confirmedAt: o.confirmedAt,
      revenue:     Number(o.quote.totalAmount ?? 0),
      profit:      Number(o.quote.grossProfit ?? 0),
    }))
  );

  // ── Top clients ────────────────────────────────────────────────────────────
  const clientMap = new Map<
    string,
    { name: string; companyId: string; revenue: number; profit: number; count: number }
  >();
  for (const o of allOrdersRaw) {
    const req = o.quote.importRequest;
    if (!req.companyId || !req.company) continue;
    const existing = clientMap.get(req.companyId) ?? {
      name:      req.company.name,
      companyId: req.company.id,
      revenue:   0,
      profit:    0,
      count:     0,
    };
    existing.revenue += Number(o.quote.totalAmount ?? 0);
    existing.profit  += Number(o.quote.grossProfit ?? 0);
    existing.count   += 1;
    clientMap.set(req.companyId, existing);
  }
  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // ── Sort urgent tasks: URGENT first, then by deadline ─────────────────────
  const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const urgentTasks = [...urgentTasksRaw].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 9;
    const pb = PRIORITY_ORDER[b.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  // ── KPI card definitions ───────────────────────────────────────────────────
  const operationalKpis = [
    { label: 'Zahtjevi',          value: requestsCount,                Icon: IconBox,       iconBg: 'bg-brand-100',  iconColor: 'text-brand-700',  grad: 'from-brand-50'  },
    { label: 'Aktivne pošiljke',  value: activeShipments,              Icon: IconShip,      iconBg: 'bg-sky-100',    iconColor: 'text-sky-700',    grad: 'from-sky-50'    },
    { label: 'Ponude na čekanju', value: pendingQuotes,                Icon: IconClipboard, iconBg: 'bg-amber-100',  iconColor: 'text-amber-700',  grad: 'from-amber-50'  },
    { label: 'Aktivni klijenti',  value: activeClients,                Icon: IconUsers,     iconBg: 'bg-violet-100', iconColor: 'text-violet-700', grad: 'from-violet-50' },
  ];
  const financialKpis = [
    { label: 'Prihod ovog mj.',   value: formatCurrency(revenue),      Icon: IconCash,    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', grad: 'from-emerald-50' },
    { label: 'Bruto profit',      value: formatCurrency(grossProfit),  Icon: IconTrend,   iconBg: 'bg-teal-100',    iconColor: 'text-teal-700',    grad: 'from-teal-50'    },
    { label: 'Prosj. marža',      value: `${avgMargin.toFixed(1)}%`,   Icon: IconPercent, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', grad: 'from-emerald-50' },
    { label: 'Nardž. dobavljači', value: supplierOrders,               Icon: IconFactory, iconBg: 'bg-orange-100',  iconColor: 'text-orange-700',  grad: 'from-orange-50'  },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobro jutro' : hour < 18 ? 'Dobar dan' : 'Dobro veče';
  const today = new Date().toLocaleDateString('bs-BA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-10">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{greeting}</p>
          <h1 className="mt-0.5 text-2xl font-bold text-ink-900">Admin dashboard</h1>
        </div>
        <p className="text-sm text-ink-400">{today}</p>
      </div>

      {/* ══ SEKCIJA: PREGLED ════════════════════════════════════════ */}
      <section>
        <SectionEyebrow eyebrow="Pregled" title="Ključne metrike" />

        {/* Operational row */}
        <div className="mb-2">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            Operativno
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {operationalKpis.map(({ label, value, Icon, iconBg, iconColor, grad }) => (
              <div key={label}
                className={`relative overflow-hidden rounded-xl border border-ink-200 bg-gradient-to-br ${grad} to-white p-5 shadow-card`}>
                <div className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
                  <Icon />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
                <p className="mt-3 text-4xl font-extrabold leading-none text-ink-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial row */}
        <div className="mt-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            Finansijsko — ovaj mjesec
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {financialKpis.map(({ label, value, Icon, iconBg, iconColor, grad }) => (
              <div key={label}
                className={`relative overflow-hidden rounded-xl border border-ink-200 bg-gradient-to-br ${grad} to-white p-5 shadow-card`}>
                <div className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
                  <Icon />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
                <p className="mt-3 text-3xl font-extrabold leading-none text-ink-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SEKCIJA: ANALITIKA ══════════════════════════════════════ */}
      <section>
        <SectionEyebrow eyebrow="Analitika" title="Grafikoni" />
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Status bar chart */}
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <p className="mb-0.5 text-sm font-bold text-ink-900">Zahtjevi po statusu</p>
            <p className="mb-4 text-xs text-ink-400">Distribucija svih zahtjeva kroz workflow</p>
            <StatusBarChart data={statusChartData} />
          </div>

          {/* Revenue area chart */}
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <p className="mb-0.5 text-sm font-bold text-ink-900">Prihod — posljednjih 6 mj.</p>
            <p className="mb-4 text-xs text-ink-400">Prihod i bruto profit po kalendarskom mjesecu</p>
            <RevenueAreaChart data={revenueChartData} />
          </div>
        </div>
      </section>

      {/* ══ SEKCIJA: DNO — 3-col grid ══════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* NAJNOVIJA AKTIVNOST — 2/3 */}
        <div className="lg:col-span-2">
          <SectionEyebrow
            eyebrow="Aktivnost"
            title="Najnovija aktivnost"
            action={{ href: '/admin/settings/audit-log', label: 'Vidi sve' }}
          />
          <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
            {recentLogsRaw.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-400">Nema zapisa aktivnosti.</p>
            ) : (
              <ul className="divide-y divide-ink-50">
                {recentLogsRaw.map((log) => (
                  <li key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-ink-50">
                    {/* Actor avatar */}
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                      {log.actor?.name
                        ? log.actor.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                        : '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink-900">
                          {log.actor?.name ?? 'System'}
                        </span>
                        <span className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
                          {log.action}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-500">{humanizeAction(log.action)}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-ink-400">
                      {log.createdAt.toLocaleDateString('bs-BA')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR — 1/3 */}
        <div className="space-y-6">

          {/* TOP KLIJENTI */}
          <div>
            <SectionEyebrow
              eyebrow="Klijenti"
              title="Top klijenti"
              action={{ href: '/admin/reports', label: 'Vidi sve' }}
            />
            <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
              {topClients.length === 0 ? (
                <p className="px-5 py-6 text-center text-xs text-ink-400">Nema podataka.</p>
              ) : (
                <ul className="divide-y divide-ink-50">
                  {topClients.map((c, i) => (
                    <li key={c.companyId} className="flex items-center gap-3 px-4 py-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/clients/${c.companyId}`}
                          className="block truncate text-xs font-semibold text-ink-900 hover:text-brand-700"
                        >
                          {c.name}
                        </Link>
                        <p className="text-[10px] text-ink-400">{c.count} narudžbi</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-emerald-700">
                        {formatCurrency(c.profit)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* HITNI ZADACI */}
          <div>
            <SectionEyebrow
              eyebrow="Zadaci"
              title="Hitni zadaci"
              action={{ href: '/admin/requests', label: 'Svi zahtjevi' }}
            />
            <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
              {urgentTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 px-5 py-6 text-center">
                  <span className="text-lg">✓</span>
                  <p className="text-xs text-ink-400">Nema hitnih zadataka.</p>
                </div>
              ) : (
                <ul className="divide-y divide-ink-50">
                  {urgentTasks.map((task) => (
                    <li key={task.id} className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${PRIORITY_COLORS[task.priority]}`}>
                          <IconAlert />
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-ink-900 line-clamp-2">
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Link
                          href={`/admin/requests/${task.importRequest.id}`}
                          className="text-[10px] font-mono text-brand-600 hover:underline"
                        >
                          {task.importRequest.code}
                        </Link>
                        {task.deadline && (
                          <span className="text-[10px] text-ink-400">
                            do {new Date(task.deadline).toLocaleDateString('bs-BA')}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
