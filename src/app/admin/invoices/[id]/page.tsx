import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  formatCurrency,
} from '@/lib/status';
import { PaymentForm } from '@/components/payment-form';

interface Props {
  params: { id: string };
}

export default async function InvoiceDetailPage({ params }: Props) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      payments: { orderBy: { createdAt: 'desc' } },
      order: {
        include: {
          quote: {
            include: {
              importRequest: {
                select: {
                  id: true,
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

  if (!invoice) notFound();

  const req = invoice.order.quote.importRequest;
  const totalPaid = invoice.payments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );
  const remaining = parseFloat(invoice.amount.toString()) - totalPaid;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Kreirana {new Date(invoice.createdAt).toLocaleDateString('bs-BA')}
          </p>
        </div>
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            PAYMENT_STATUS_COLORS[invoice.status]
          }`}
        >
          {PAYMENT_STATUS_LABELS[invoice.status] ?? invoice.status}
        </span>
      </div>

      {/* Invoice Info */}
      <div className="card grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-ink-500 mb-0.5">Zahtjev</p>
          <Link
            href={`/admin/requests/${req.code}`}
            className="text-brand-600 hover:underline text-sm font-medium"
          >
            {req.code}
          </Link>
          <p className="text-xs text-ink-400 truncate">{req.productName}</p>
        </div>
        <div>
          <p className="text-xs text-ink-500 mb-0.5">Klijent</p>
          <p className="text-sm font-medium text-ink-900">{req.company?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-ink-500 mb-0.5">Iznos fakture</p>
          <p className="text-sm font-medium text-ink-900">
            {formatCurrency(invoice.amount.toString(), invoice.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-500 mb-0.5">Rok plaćanja</p>
          <p className="text-sm font-medium text-ink-900">
            {invoice.dueDate
              ? new Date(invoice.dueDate).toLocaleDateString('bs-BA')
              : '—'}
          </p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="card grid grid-cols-3 gap-4 bg-ink-50">
        <div>
          <p className="text-xs text-ink-500 mb-0.5">Ukupno plaćeno</p>
          <p className="text-lg font-bold text-emerald-700">
            {formatCurrency(totalPaid, invoice.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-500 mb-0.5">Preostalo</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(remaining, invoice.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-500 mb-0.5">Broj uplata</p>
          <p className="text-lg font-bold text-ink-900">{invoice.payments.length}</p>
        </div>
      </div>

      {/* Payments List */}
      {invoice.payments.length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold text-ink-900 mb-4">Uplate</h2>
          <div className="divide-y divide-ink-100">
            {invoice.payments.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">
                    {formatCurrency(p.amount.toString(), p.currency)}
                  </p>
                  {p.notes && (
                    <p className="text-xs text-ink-400 truncate">{p.notes}</p>
                  )}
                </div>
                <div className="text-right text-sm text-ink-500 shrink-0">
                  <p>{p.method ?? '—'}</p>
                  <p className="text-xs">
                    {p.paidDate
                      ? new Date(p.paidDate).toLocaleDateString('bs-BA')
                      : new Date(p.createdAt).toLocaleDateString('bs-BA')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Payment */}
      {invoice.status !== 'PAID' && invoice.status !== 'REFUNDED' && (
        <div className="card">
          <h2 className="text-base font-semibold text-ink-900 mb-4">Unesi uplatu</h2>
          <PaymentForm
            invoiceId={invoice.id}
            currency={invoice.currency}
          />
        </div>
      )}
    </div>
  );
}
