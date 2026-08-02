import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/status';

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const payments = await prisma.payment.findMany({
    include: {
      order: {
        include: {
          quote: {
            include: {
              importRequest: {
                select: {
                  id: true,
                  code: true,
                  client: {
                    select: {
                      name: true,
                      company: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { paidDate: 'desc' },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink-900">Plaćanja</h1>

      <div className="card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-ink-100 text-sm">
          <thead className="bg-ink-50">
            <tr>
              {['Zahtjev', 'Klijent', 'Iznos', 'Valuta', 'Metoda', 'Datum plaćanja', 'Faktura', ''].map(
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
            {payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-ink-400">
                  Nema plaćanja.
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const req = p.order.quote.importRequest;
                return (
                  <tr key={p.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3 font-mono font-medium text-ink-900">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {req.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-ink-800">{req.client.name}</span>
                      {req.client.company && (
                        <span className="text-xs text-ink-500">{req.client.company.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {formatCurrency(p.amount.toString(), p.currency)}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{p.currency}</td>
                    <td className="px-4 py-3 text-ink-600">{p.method ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-500">
                      {p.paidDate ? p.paidDate.toLocaleDateString('bs-BA') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.invoiceId ? (
                        <Link
                          href={`/admin/invoices/${p.invoiceId}`}
                          className="text-brand-600 hover:underline"
                        >
                          Faktura →
                        </Link>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="whitespace-nowrap text-brand-600 hover:underline"
                      >
                        Zahtjev →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
