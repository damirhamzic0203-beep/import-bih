import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: {
          users: true,
          importRequests: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-ink-900">Klijenti</h1>

      {companies.length === 0 ? (
        <p className="text-sm text-ink-400">Nema registriranih kompanija.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 border-b border-ink-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Kompanija
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Grad
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Korisnici
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Zahtjevi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clients/${company.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {company.name}
                    </Link>
                    {company.taxId && (
                      <p className="text-xs text-ink-500 mt-0.5">{company.taxId}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{company.city ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-ink-700">
                    {company._count.users}
                  </td>
                  <td className="px-4 py-3 text-center text-ink-700">
                    {company._count.importRequests}
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
