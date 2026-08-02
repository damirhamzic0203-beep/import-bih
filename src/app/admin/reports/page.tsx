import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/status';
import { PeriodSelect } from '@/components/period-select';

function getPeriodRange(period: string): { gte: Date; lte: Date } | undefined {
  const now = new Date();
  if (period === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { gte: start, lte: end };
  }
  if (period === 'week') {
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    const end = new Date();
    return { gte: start, lte: end };
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date();
    return { gte: start, lte: end };
  }
  if (period === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date();
    return { gte: start, lte: end };
  }
  return undefined;
}

interface Props {
  searchParams: { period?: string };
}

export default async function ReportsPage({ searchParams }: Props) {
  const period = searchParams.period ?? 'month';
  const range = getPeriodRange(period);

  const confirmedAtFilter = range ? { confirmedAt: range } : {};

  // Accepted quotes with orders in period
  const orders = await prisma.order.findMany({
    where: confirmedAtFilter,
    include: {
      quote: {
        include: {
          importRequest: {
            select: {
              companyId: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
      },
      invoices: { select: { status: true } },
    },
  });

  const totalRevenue = orders.reduce(
    (s, o) =>
      s + (o.quote.totalAmount ? parseFloat(o.quote.totalAmount.toString()) : 0),
    0
  );
  const totalCost = orders.reduce(
    (s, o) =>
      s + (o.quote.internalCost ? parseFloat(o.quote.internalCost.toString()) : 0),
    0
  );
  const totalProfit = orders.reduce(
    (s, o) =>
      s + (o.quote.grossProfit ? parseFloat(o.quote.grossProfit.toString()) : 0),
    0
  );
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Profit by forwarder (selected ForwarderQuotes for orders in period)
  const importRequestIds = orders.map((o) => o.quote.importRequestId);
  const selectedForwarderQuotes =
    importRequestIds.length > 0
      ? await prisma.forwarderQuote.findMany({
          where: {
            isSelected: true,
            transportRequest: {
              importRequestId: { in: importRequestIds },
            },
          },
          include: {
            forwarder: { select: { id: true, companyName: true } },
          },
        })
      : [];

  // Group by forwarder
  const forwarderMap = new Map<
    string,
    { name: string; count: number; totalCost: number }
  >();
  for (const fq of selectedForwarderQuotes) {
    const key = fq.forwarderId;
    const existing = forwarderMap.get(key) ?? {
      name: fq.forwarder.companyName,
      count: 0,
      totalCost: 0,
    };
    existing.count += 1;
    existing.totalCost += fq.totalCost ? parseFloat(fq.totalCost.toString()) : 0;
    forwarderMap.set(key, existing);
  }
  const forwarderRows = Array.from(forwarderMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.totalCost - a.totalCost);

  // Profit by client
  const clientMap = new Map<
    string,
    { name: string; companyId: string; revenue: number; profit: number; count: number }
  >();
  for (const o of orders) {
    const req = o.quote.importRequest;
    if (!req.companyId || !req.company) continue;
    const key = req.companyId;
    const existing = clientMap.get(key) ?? {
      name: req.company.name,
      companyId: req.company.id,
      revenue: 0,
      profit: 0,
      count: 0,
    };
    existing.revenue += o.quote.totalAmount
      ? parseFloat(o.quote.totalAmount.toString())
      : 0;
    existing.profit += o.quote.grossProfit
      ? parseFloat(o.quote.grossProfit.toString())
      : 0;
    existing.count += 1;
    clientMap.set(key, existing);
  }
  const clientRows = Array.from(clientMap.values()).sort(
    (a, b) => b.profit - a.profit
  );

  const statCards = [
    { label: 'Prihod', value: formatCurrency(totalRevenue) },
    { label: 'Troškovi', value: formatCurrency(totalCost) },
    { label: 'Profit', value: formatCurrency(totalProfit) },
    { label: 'Marža', value: `${margin.toFixed(1)}%` },
    { label: 'Narudžbe', value: orderCount.toString() },
    { label: 'Prosj. narudžba', value: formatCurrency(avgOrderValue) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-ink-900">Izvještaji</h1>
        <PeriodSelect value={period} />
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="card text-center">
            <p className="text-xs text-ink-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-ink-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* By forwarder */}
      <div className="card">
        <h2 className="text-base font-semibold text-ink-900 mb-4">
          Narudžbe po transporteru
        </h2>
        {forwarderRows.length === 0 ? (
          <p className="text-sm text-ink-400">Nema podataka za odabrani period.</p>
        ) : (
          <table className="min-w-full divide-y divide-ink-100">
            <thead>
              <tr>
                {['Transporter', 'Narudžbi', 'Ukupni trošak transporta'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {forwarderRows.map((row) => (
                <tr key={row.id}>
                  <td className="py-2 text-sm text-ink-900">{row.name}</td>
                  <td className="py-2 text-sm text-ink-700">{row.count}</td>
                  <td className="py-2 text-sm font-medium text-ink-900">
                    {formatCurrency(row.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* By client */}
      <div className="card">
        <h2 className="text-base font-semibold text-ink-900 mb-4">
          Profit po klijentu
        </h2>
        {clientRows.length === 0 ? (
          <p className="text-sm text-ink-400">Nema podataka za odabrani period.</p>
        ) : (
          <table className="min-w-full divide-y divide-ink-100">
            <thead>
              <tr>
                {['Klijent', 'Narudžbi', 'Prihod', 'Profit'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {clientRows.map((row) => (
                <tr key={row.companyId}>
                  <td className="py-2 text-sm">
                    <Link
                      href={`/admin/clients/${row.companyId}`}
                      className="text-brand-600 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-2 text-sm text-ink-700">{row.count}</td>
                  <td className="py-2 text-sm text-ink-900">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="py-2 text-sm font-medium text-ink-900">
                    {formatCurrency(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
