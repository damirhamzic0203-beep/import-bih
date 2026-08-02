import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IMPORT_STATUS_LABELS, IMPORT_STATUS_COLORS, formatCurrency } from '@/lib/status';
import { QuoteStatus } from '@prisma/client';

export default async function AdminClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      users: {
        select: { id: true, name: true, email: true, phone: true },
        orderBy: { name: 'asc' },
      },
      importRequests: {
        select: {
          id: true,
          code: true,
          productName: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!company) notFound();

  const [revenueData, activeShipments] = await Promise.all([
    prisma.quote.aggregate({
      where: {
        status: QuoteStatus.ACCEPTED,
        importRequest: { companyId: params.id },
      },
      _sum: { totalAmount: true, grossProfit: true },
    }),
    prisma.importRequest.count({
      where: {
        companyId: params.id,
        status: { in: ['IN_TRANSIT', 'CUSTOMS', 'DELIVERY'] },
      },
    }),
  ]);

  const totalRevenue = revenueData._sum.totalAmount;
  const totalProfit = revenueData._sum.grossProfit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-ink-500 mb-1">
          <Link href="/admin/clients" className="hover:text-ink-700">Klijenti</Link>
          <span>/</span>
          <span>{company.name}</span>
        </div>
        <h1 className="text-xl font-semibold text-ink-900">{company.name}</h1>
        {company.city && (
          <p className="text-sm text-ink-500 mt-0.5">
            {company.city}, {company.country}
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-ink-500 mb-1">Zahtjevi</p>
          <p className="text-2xl font-bold text-ink-900">
            {company.importRequests.length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500 mb-1">Aktivne pošiljke</p>
          <p className="text-2xl font-bold text-brand-700">{activeShipments}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500 mb-1">Ukupan prihod (EUR)</p>
          <p className="text-xl font-bold text-ink-900">
            {totalRevenue ? formatCurrency(totalRevenue.toString()) : '—'}
          </p>
        </div>
        <div className="card p-4 bg-ink-900">
          <p className="text-xs text-ink-400 mb-1">🔒 Profit (interno)</p>
          <p className="text-xl font-bold text-emerald-400">
            {totalProfit ? formatCurrency(totalProfit.toString()) : '—'}
          </p>
        </div>
      </div>

      {/* Company info */}
      <div className="card p-5">
        <h2 className="mb-3 border-b border-ink-100 pb-2 text-sm font-semibold text-ink-700">
          Podaci o kompaniji
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-3">
            <span className="w-40 shrink-0 text-ink-500">Naziv</span>
            <span className="text-ink-900">{company.name}</span>
          </div>
          {company.taxId && (
            <div className="flex gap-3">
              <span className="w-40 shrink-0 text-ink-500">JIB / ID broj</span>
              <span className="text-ink-900">{company.taxId}</span>
            </div>
          )}
          {company.address && (
            <div className="flex gap-3">
              <span className="w-40 shrink-0 text-ink-500">Adresa</span>
              <span className="text-ink-900">{company.address}</span>
            </div>
          )}
          {company.city && (
            <div className="flex gap-3">
              <span className="w-40 shrink-0 text-ink-500">Grad</span>
              <span className="text-ink-900">{company.city}</span>
            </div>
          )}
          <div className="flex gap-3">
            <span className="w-40 shrink-0 text-ink-500">Zemlja</span>
            <span className="text-ink-900">{company.country}</span>
          </div>
        </div>
      </div>

      {/* Users */}
      <div className="card p-5">
        <h2 className="mb-3 border-b border-ink-100 pb-2 text-sm font-semibold text-ink-700">
          Korisnici ({company.users.length})
        </h2>
        {company.users.length === 0 ? (
          <p className="text-sm text-ink-400">Nema registriranih korisnika.</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {company.users.map((user) => (
              <div key={user.id} className="flex flex-wrap gap-x-6 gap-y-0.5 py-3 text-sm">
                <span className="font-medium text-ink-900">{user.name}</span>
                <span className="text-ink-600">{user.email}</span>
                {user.phone && <span className="text-ink-500">{user.phone}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import requests table */}
      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-700">
            Uvozni zahtjevi ({company.importRequests.length})
          </h2>
        </div>

        {company.importRequests.length === 0 ? (
          <p className="p-5 text-sm text-ink-400">Nema uvoznih zahtjeva za ovu kompaniju.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Kod
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Proizvod
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Datum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {company.importRequests.map((req) => (
                <tr key={req.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/requests/${req.id}`}
                      className="font-medium font-mono text-brand-700 hover:underline"
                    >
                      {req.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{req.productName}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${IMPORT_STATUS_COLORS[req.status]}`}>
                      {IMPORT_STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {req.createdAt.toLocaleDateString('bs-BA')}
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
