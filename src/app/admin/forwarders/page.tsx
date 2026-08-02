import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const TRANSPORT_CHIPS: { key: string; label: string }[] = [
  { key: 'supportsSea', label: 'More' },
  { key: 'supportsRail', label: 'Željeznica' },
  { key: 'supportsAir', label: 'Zrak' },
  { key: 'supportsRoad', label: 'Cestovni' },
  { key: 'supportsLcl', label: 'LCL' },
  { key: 'supportsFcl', label: 'FCL' },
  { key: 'supportsDoorToDoor', label: 'D2D' },
  { key: 'supportsCustoms', label: 'Carina' },
  { key: 'supportsWarehouse', label: 'Skladište' },
];

export default async function AdminForwardersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  const forwarders = await prisma.forwarder.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      email: true,
      originCities: true,
      destinationCountries: true,
      supportsSea: true,
      supportsRail: true,
      supportsAir: true,
      supportsRoad: true,
      supportsLcl: true,
      supportsFcl: true,
      supportsDoorToDoor: true,
      supportsCustoms: true,
      supportsWarehouse: true,
      rating: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Transporteri</h1>
        <Link href="/admin/forwarders/new" className="btn-primary">
          + Novi transporter
        </Link>
      </div>

      <p className="text-sm text-ink-500">{forwarders.length} transportera</p>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 border-b border-ink-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Firma</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Kontakt</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Rute</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Transport</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Ocjena</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {forwarders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                  Nema transportera
                </td>
              </tr>
            )}
            {forwarders.map((f) => {
              const activeTransport = TRANSPORT_CHIPS.filter(
                ({ key }) => f[key as keyof typeof f] === true
              );
              return (
                <tr key={f.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/forwarders/${f.id}`} className="font-medium text-brand-600 hover:underline">
                      {f.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    <div>{f.contactPerson || '—'}</div>
                    {f.email && <div className="text-ink-400 text-xs">{f.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-ink-600 text-xs">
                    {f.originCities.length > 0 && (
                      <div>↑ {f.originCities.slice(0, 2).join(', ')}{f.originCities.length > 2 ? '…' : ''}</div>
                    )}
                    {f.destinationCountries.length > 0 && (
                      <div>↓ {f.destinationCountries.slice(0, 2).join(', ')}{f.destinationCountries.length > 2 ? '…' : ''}</div>
                    )}
                    {f.originCities.length === 0 && f.destinationCountries.length === 0 && '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {activeTransport.length === 0 ? (
                        <span className="text-ink-400">—</span>
                      ) : (
                        activeTransport.map(({ key, label }) => (
                          <span key={key} className="badge bg-brand-100 text-brand-800 text-xs">
                            {label}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {f.rating ? '★'.repeat(f.rating) : '—'}
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
