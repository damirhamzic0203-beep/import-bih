import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IMPORT_STATUS_LABELS, IMPORT_STATUS_COLORS } from '@/lib/status';

export default async function ClientRequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const requests = await prisma.importRequest.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink-900">Moji zahtjevi</h1>
        <Link href="/client/requests/new" className="btn-primary">
          + Novi zahtjev
        </Link>
      </div>

      <div className="card overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-ink-500">Nemate zahtjeva za uvoz.</p>
            <Link
              href="/client/requests/new"
              className="btn-primary mt-4 inline-flex"
            >
              Kreirajte prvi zahtjev
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-5 py-3">Kod</th>
                <th className="px-5 py-3">Proizvod</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Kreirano</th>
                <th className="px-5 py-3">Ažurirano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50">
                  <td className="px-5 py-3 font-medium text-ink-900">
                    <Link
                      href={`/client/requests/${r.id}`}
                      className="hover:underline"
                    >
                      {r.code}
                    </Link>
                  </td>
                  <td className="max-w-[200px] truncate px-5 py-3 text-ink-600">
                    {r.productName}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${IMPORT_STATUS_COLORS[r.status]}`}>
                      {IMPORT_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-500">
                    {r.createdAt.toLocaleDateString('bs-BA')}
                  </td>
                  <td className="px-5 py-3 text-ink-500">
                    {r.updatedAt.toLocaleDateString('bs-BA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
