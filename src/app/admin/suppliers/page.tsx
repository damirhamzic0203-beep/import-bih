import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SUPPLIER_STATUS_LABELS, SUPPLIER_STATUS_COLORS } from '@/lib/status';
import { SupplierStatusFilter } from '@/components/supplier-status-filter';

export default async function AdminSuppliersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  const where = searchParams.status ? { status: searchParams.status as never } : {};

  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyName: true,
      country: true,
      city: true,
      isFactory: true,
      categories: true,
      status: true,
      rating: true,
      verificationScore: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Dobavljači</h1>
        <Link href="/admin/suppliers/new" className="btn-primary">
          + Novi dobavljač
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <SupplierStatusFilter current={searchParams.status ?? ''} />
        <span className="text-sm text-ink-500">{suppliers.length} dobavljača</span>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 border-b border-ink-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Firma</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Lokacija</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Tip</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Kategorije</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Ocjena</th>
              <th className="text-left px-4 py-3 font-medium text-ink-600">Skor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-400">
                  Nema dobavljača
                </td>
              </tr>
            )}
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-ink-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/suppliers/${s.id}`} className="font-medium text-brand-600 hover:underline">
                    {s.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {[s.city, s.country].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${s.isFactory ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-700'}`}>
                    {s.isFactory ? 'Fabrika' : 'Trader'}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {s.categories.length > 0 ? s.categories.slice(0, 2).join(', ') + (s.categories.length > 2 ? '…' : '') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${SUPPLIER_STATUS_COLORS[s.status]}`}>
                    {SUPPLIER_STATUS_LABELS[s.status] ?? s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {s.rating ? '★'.repeat(s.rating) : '—'}
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {s.verificationScore !== null ? `${s.verificationScore}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
