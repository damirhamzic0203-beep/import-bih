import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function HsCodesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/login');

  const q = searchParams.q?.trim() ?? '';

  const codes = await prisma.hsCode.findMany({
    where: q
      ? {
          OR: [
            { code: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { code: 'asc' },
    include: { _count: { select: { importRequests: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">HS kodovi — carinska baza</h1>
          <p className="mt-1 text-sm text-ink-500">
            Interna baza harmonizovanih tarifnih oznaka i carinskih stopa. Stope se unose ručno
            na osnovu zvanične carinske tarife ili potvrde od špeditera.
          </p>
        </div>
        <Link href="/admin/hs-codes/new" className="btn-primary shrink-0">
          + Novi HS kod
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Pretraži po kodu ili opisu..."
          className="input-field max-w-sm"
        />
        <button type="submit" className="btn-primary">Pretraži</button>
        {q && (
          <Link href="/admin/hs-codes" className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">
            Očisti filter
          </Link>
        )}
      </form>

      <div className="card overflow-hidden p-0">
        {codes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-ink-400">
              {q
                ? `Nema HS kodova koji odgovaraju pretrazi "${q}".`
                : 'Baza HS kodova je prazna. Dodajte prvi zapis klikom na "+ Novi HS kod".'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-ink-600">HS kod</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Opis</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Carina %</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Izvor</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Zahtjevi</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Ažurirano</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono font-semibold text-ink-900">{c.code}</td>
                  <td className="px-4 py-3 text-ink-700">{c.description}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                      {parseFloat(c.dutyRate.toString()).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{c.source ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-500">{c._count.importRequests}</td>
                  <td className="px-4 py-3 text-ink-400">
                    {c.updatedAt.toLocaleDateString('bs-BA')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/hs-codes/${c.id}/edit`}
                      className="text-brand-600 hover:underline"
                    >
                      Uredi
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {codes.length > 0 && (
        <p className="text-xs text-ink-400">
          {codes.length} {codes.length === 1 ? 'zapis' : 'zapisa'} u bazi
          {q ? ` (filtrirano po "${q}")` : ''}
        </p>
      )}
    </div>
  );
}
