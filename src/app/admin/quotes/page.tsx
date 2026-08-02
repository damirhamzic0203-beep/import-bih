import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { QuoteStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS, formatCurrency } from '@/lib/status';

const STATUS_OPTIONS = [
  { value: '', label: 'Sve' },
  { value: 'DRAFT', label: 'Nacrt' },
  { value: 'SENT', label: 'Poslano' },
  { value: 'ACCEPTED', label: 'Prihvaćeno' },
  { value: 'CHANGES_REQUESTED', label: 'Izmjene' },
  { value: 'DECLINED', label: 'Odbijeno' },
  { value: 'EXPIRED', label: 'Isteklo' },
];

interface Props {
  searchParams: { status?: string };
}

export default async function AdminQuotesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const statusParam = searchParams.status ?? '';
  const validStatus =
    statusParam && Object.values(QuoteStatus).includes(statusParam as QuoteStatus)
      ? (statusParam as QuoteStatus)
      : undefined;

  const quotes = await prisma.quote.findMany({
    where: validStatus ? { status: validStatus } : {},
    include: {
      importRequest: {
        select: {
          id: true,
          code: true,
          productName: true,
          client: {
            select: {
              name: true,
              company: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink-900">Ponude</h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/quotes${opt.value ? `?status=${opt.value}` : ''}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusParam === opt.value
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-ink-100 text-sm">
          <thead className="bg-ink-50">
            <tr>
              {['Kod', 'Klijent', 'Proizvod', 'Ukupno', 'Int. trošak', 'Marža', 'Status', 'Vrijedi do', ''].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-ink-400">
                  Nema ponuda.
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono font-medium text-ink-900">{q.code}</td>
                  <td className="px-4 py-3">
                    <span className="block font-medium text-ink-800">
                      {q.importRequest.client.name}
                    </span>
                    {q.importRequest.client.company && (
                      <span className="text-xs text-ink-500">
                        {q.importRequest.client.company.name}
                      </span>
                    )}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-ink-600">
                    {q.importRequest.productName}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {q.totalAmount
                      ? formatCurrency(q.totalAmount.toString(), q.currency)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {q.internalCost
                      ? formatCurrency(q.internalCost.toString(), q.currency)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {q.marginPct
                      ? `${parseFloat(q.marginPct.toString()).toFixed(1)}%`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        QUOTE_STATUS_COLORS[q.status] ?? 'bg-ink-100 text-ink-600'
                      }`}
                    >
                      {QUOTE_STATUS_LABELS[q.status] ?? q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {q.validUntil ? q.validUntil.toLocaleDateString('bs-BA') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/requests/${q.importRequest.id}`}
                      className="whitespace-nowrap text-brand-600 hover:underline"
                    >
                      Zahtjev →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
