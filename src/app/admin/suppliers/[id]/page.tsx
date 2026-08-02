import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SUPPLIER_STATUS_LABELS, SUPPLIER_STATUS_COLORS, IMPORT_STATUS_LABELS, IMPORT_STATUS_COLORS } from '@/lib/status';
import { SupplierVerificationForm } from '@/components/supplier-verification-form';

export default async function AdminSupplierDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: {
      importRequests: {
        select: {
          id: true,
          code: true,
          productName: true,
          status: true,
          client: {
            select: {
              name: true,
              company: { select: { name: true } },
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!supplier) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/suppliers" className="text-ink-500 hover:text-ink-700 text-sm">
            ← Dobavljači
          </Link>
          <span className="text-ink-300">/</span>
          <h1 className="text-2xl font-bold text-ink-900">{supplier.companyName}</h1>
          <span className={`badge ${SUPPLIER_STATUS_COLORS[supplier.status]}`}>
            {SUPPLIER_STATUS_LABELS[supplier.status] ?? supplier.status}
          </span>
        </div>
        <Link href={`/admin/suppliers/${supplier.id}/edit`} className="btn-secondary">
          Uredi
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-ink-900">Kontakt informacije</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-ink-500">Kontakt osoba</dt>
                <dd className="text-ink-900 font-medium">{supplier.contactPerson || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Telefon</dt>
                <dd className="text-ink-900 font-medium">{supplier.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Email</dt>
                <dd className="text-ink-900 font-medium">{supplier.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-500">WeChat</dt>
                <dd className="text-ink-900 font-medium">{supplier.wechat || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Website</dt>
                <dd className="text-ink-900 font-medium">
                  {supplier.website ? (
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                      {supplier.website}
                    </a>
                  ) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Alibaba</dt>
                <dd className="text-ink-900 font-medium">
                  {supplier.alibabaUrl ? (
                    <a href={supplier.alibabaUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                      Link
                    </a>
                  ) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">1688</dt>
                <dd className="text-ink-900 font-medium">
                  {supplier.url1688 ? (
                    <a href={supplier.url1688} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                      Link
                    </a>
                  ) : '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-ink-900">Lokacija i tip</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-ink-500">Lokacija</dt>
                <dd className="text-ink-900 font-medium">
                  {[supplier.city, supplier.country].filter(Boolean).join(', ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Tip</dt>
                <dd>
                  <span className={`badge ${supplier.isFactory ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-700'}`}>
                    {supplier.isFactory ? 'Fabrika' : 'Trader'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Kategorije</dt>
                <dd className="text-ink-900 font-medium">
                  {supplier.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {supplier.categories.map((cat) => (
                        <span key={cat} className="badge bg-ink-100 text-ink-700">{cat}</span>
                      ))}
                    </div>
                  ) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">MOQ</dt>
                <dd className="text-ink-900 font-medium">
                  {supplier.moq !== null ? supplier.moq.toLocaleString('bs-BA') : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Ocjena</dt>
                <dd className="text-ink-900 font-medium">
                  {supplier.rating ? '★'.repeat(supplier.rating) + '☆'.repeat(5 - supplier.rating) : '—'}
                </dd>
              </div>
            </dl>
          </div>

          {supplier.notes && (
            <div className="card space-y-2">
              <h2 className="font-semibold text-ink-900">Napomene</h2>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">{supplier.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-ink-900">Verifikacija</h2>
            {supplier.verificationScore !== null && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-600">Skor</span>
                  <span className="font-medium text-ink-900">{supplier.verificationScore}%</span>
                </div>
                <div className="w-full bg-ink-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${supplier.verificationScore}%` }}
                  />
                </div>
              </div>
            )}
            <SupplierVerificationForm
              supplierId={supplier.id}
              currentStatus={supplier.status}
              currentScore={supplier.verificationScore}
            />
          </div>
        </div>
      </div>
      {/* Linked import requests */}
      <div className="card">
        <h2 className="mb-4 font-semibold text-ink-900">
          Zahtjevi vezani za ovog dobavljača
          {supplier.importRequests.length > 0 && (
            <span className="ml-2 text-sm font-normal text-ink-400">
              ({supplier.importRequests.length})
            </span>
          )}
        </h2>

        {supplier.importRequests.length === 0 ? (
          <p className="text-sm text-ink-400 italic">
            Nema još zahtjeva vezanih za ovog dobavljača.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead>
              <tr>
                {['Kod', 'Proizvod', 'Klijent', 'Status', 'Datum', ''].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {supplier.importRequests.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50">
                  <td className="py-2.5 pr-4 font-mono font-medium text-ink-900">
                    {r.code}
                  </td>
                  <td className="py-2.5 pr-4 text-ink-700 max-w-[160px] truncate">
                    {r.productName}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="block text-ink-800">{r.client.name}</span>
                    {r.client.company && (
                      <span className="text-xs text-ink-500">{r.client.company.name}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`badge ${
                        IMPORT_STATUS_COLORS[r.status] ?? 'bg-ink-100 text-ink-700'
                      }`}
                    >
                      {IMPORT_STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-ink-400">
                    {r.createdAt.toLocaleDateString('bs-BA')}
                  </td>
                  <td className="py-2.5 text-right">
                    <Link
                      href={`/admin/requests/${r.id}`}
                      className="text-brand-600 hover:underline whitespace-nowrap"
                    >
                      Otvori →
                    </Link>
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
