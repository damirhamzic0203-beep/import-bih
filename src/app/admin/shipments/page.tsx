import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IMPORT_STATUS_LABELS, IMPORT_STATUS_COLORS } from '@/lib/status';
import { StatusFilter } from '@/components/status-filter';
import { ImportStatus } from '@prisma/client';

const TRANSPORT_LABELS: Record<string, string> = {
  SEA: 'More',
  RAIL: 'Željeznica',
  AIR: 'Avion',
  ROAD: 'Kamion',
};

export default async function AdminShipmentsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const statusParam = searchParams.status ?? '';
  const validStatus =
    statusParam && Object.values(ImportStatus).includes(statusParam as ImportStatus)
      ? (statusParam as ImportStatus)
      : undefined;

  const shipments = await prisma.shipment.findMany({
    where: validStatus
      ? { importRequest: { status: validStatus } }
      : {},
    include: {
      importRequest: {
        select: {
          id: true,
          code: true,
          status: true,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink-900">Pošiljke</h1>
        <StatusFilter current={statusParam} />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-ink-100 text-sm">
          <thead className="bg-ink-50">
            <tr>
              {[
                'Zahtjev',
                'Klijent',
                'Prijevoznik',
                'Tracking',
                'Transport',
                'Status',
                'ETD',
                'ETA',
                'Lokacija',
                '',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-ink-400">
                  Nema pošiljki.
                </td>
              </tr>
            ) : (
              shipments.map((s) => (
                <tr key={s.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono font-medium text-ink-900">
                    {s.importRequest.code}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block font-medium text-ink-800">
                      {s.importRequest.client.name}
                    </span>
                    {s.importRequest.client.company && (
                      <span className="text-xs text-ink-500">
                        {s.importRequest.client.company.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{s.carrier ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-ink-600">
                    {s.trackingNumber ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {s.transportMode ? (TRANSPORT_LABELS[s.transportMode] ?? s.transportMode) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        IMPORT_STATUS_COLORS[s.importRequest.status] ??
                        'bg-ink-100 text-ink-700'
                      }`}
                    >
                      {IMPORT_STATUS_LABELS[s.importRequest.status] ??
                        s.importRequest.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {s.etd ? s.etd.toLocaleDateString('bs-BA') : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {s.eta ? s.eta.toLocaleDateString('bs-BA') : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-500">{s.currentLocation ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/requests/${s.importRequest.id}`}
                      className="whitespace-nowrap text-brand-600 hover:underline"
                    >
                      Detalji →
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
