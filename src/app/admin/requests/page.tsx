import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ImportStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IMPORT_STATUS_LABELS, IMPORT_STATUS_COLORS, formatCurrency } from '@/lib/status';
import { StatusFilter } from '@/components/status-filter';

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const statusParam = searchParams.status;
  const validStatus =
    statusParam && Object.values(ImportStatus).includes(statusParam as ImportStatus)
      ? (statusParam as ImportStatus)
      : undefined;

  const requests = await prisma.importRequest.findMany({
    where: validStatus ? { status: validStatus } : {},
    include: {
      client: {
        select: {
          name: true,
          email: true,
          company: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink-900">Zahtjevi za uvoz</h1>
        <StatusFilter current={statusParam ?? ''} />
      </div>

      <div className="card overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink-500">
            Nema zahtjeva{validStatus ? ` sa statusom "${IMPORT_STATUS_LABELS[validStatus]}"` : ''}.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-5 py-3">Kod</th>
                <th className="px-5 py-3">Klijent</th>
                <th className="px-5 py-3">Proizvod</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Vrijednost</th>
                <th className="px-5 py-3">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50">
                  <td className="px-5 py-3 font-medium text-ink-900">
                    <Link
                      href={`/admin/requests/${r.id}`}
                      className="hover:underline"
                    >
                      {r.code}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className="block font-medium text-ink-800">{r.client.name}</span>
                    {r.client.company && (
                      <span className="text-xs text-ink-500">{r.client.company.name}</span>
                    )}
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-3 text-ink-600">
                    {r.productName}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${IMPORT_STATUS_COLORS[r.status]}`}>
                      {IMPORT_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-600">
                    {formatCurrency(r.estimatedPrice?.toString())}
                  </td>
                  <td className="px-5 py-3 text-ink-500">
                    {r.createdAt.toLocaleDateString('bs-BA')}
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
