import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IMPORT_STATUS_LABELS, IMPORT_STATUS_COLORS } from '@/lib/status';

export default async function ClientShipmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const shipments = await prisma.shipment.findMany({
    where: { importRequest: { clientId: session.user.id } },
    include: {
      importRequest: {
        select: { id: true, code: true, productName: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Pošiljke</h1>
        <p className="text-sm text-ink-500 mt-1">
          Sve vaše pošiljke u toku i završene.
        </p>
      </div>

      {shipments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-base font-medium text-ink-700">Nema pošiljki</p>
          <p className="text-sm text-ink-500 mt-1">
            Pošiljke će se pojaviti ovdje čim vaš zahtjev uđe u fazu transporta.
          </p>
          <Link
            href="/client/requests"
            className="inline-block mt-4 text-sm text-brand-600 hover:underline"
          >
            Pregledaj moje zahtjeve →
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead className="bg-ink-50">
              <tr>
                {['Zahtjev', 'Proizvod', 'Prijevoznik', 'Tracking', 'Status', 'ETA', ''].map(
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
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono font-medium text-ink-900">
                    {s.importRequest.code}
                  </td>
                  <td className="px-4 py-3 text-ink-700 max-w-[160px] truncate">
                    {s.importRequest.productName}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{s.carrier ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-ink-600">
                    {s.trackingNumber ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        IMPORT_STATUS_COLORS[s.importRequest.status] ?? 'bg-ink-100 text-ink-700'
                      }`}
                    >
                      {IMPORT_STATUS_LABELS[s.importRequest.status] ?? s.importRequest.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {s.eta ? s.eta.toLocaleDateString('bs-BA') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/client/requests/${s.importRequest.id}`}
                      className="text-brand-600 hover:underline whitespace-nowrap"
                    >
                      Detalji →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
