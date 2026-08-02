import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  formatCurrency,
} from '@/lib/status';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Sve' },
  { value: 'UNPAID', label: 'Neplaćeno' },
  { value: 'PARTIALLY_PAID', label: 'Djelimično' },
  { value: 'PAID', label: 'Plaćeno' },
  { value: 'REFUNDED', label: 'Refundirano' },
];

interface Props {
  searchParams: { status?: string };
}

export default async function InvoicesPage({ searchParams }: Props) {
  const statusFilter = searchParams.status;
  const statusWhere =
    statusFilter && statusFilter !== 'all'
      ? { status: statusFilter as PaymentStatus }
      : {};

  const invoices = await prisma.invoice.findMany({
    where: statusWhere,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          quote: {
            include: {
              importRequest: {
                select: {
                  code: true,
                  productName: true,
                  company: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const active = statusFilter ?? 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Fakture</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/invoices?status=${opt.value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === opt.value
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {['Broj', 'Zahtjev', 'Klijent', 'Iznos', 'Rok', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-400 text-sm">
                  Nema faktura.
                </td>
              </tr>
            )}
            {invoices.map((inv) => {
              const req = inv.order.quote.importRequest;
              return (
                <tr key={inv.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-ink-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-700">
                    <Link
                      href={`/admin/requests/${req.code}`}
                      className="text-brand-600 hover:underline"
                    >
                      {req.code}
                    </Link>
                    <p className="text-ink-400 text-xs truncate max-w-[160px]">
                      {req.productName}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-700">
                    {req.company?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-ink-900">
                    {formatCurrency(inv.amount.toString(), inv.currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-500">
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString('bs-BA')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        PAYMENT_STATUS_COLORS[inv.status]
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="text-brand-600 hover:underline text-sm"
                    >
                      Detalji
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
