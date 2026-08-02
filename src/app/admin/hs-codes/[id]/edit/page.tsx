import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { HsCodeForm } from '@/components/hs-code-form';

export default async function EditHsCodePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/login');

  const hsCode = await prisma.hsCode.findUnique({
    where: { id: params.id },
    include: { _count: { select: { importRequests: true } } },
  });
  if (!hsCode) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2 text-sm text-ink-400">
          <Link href="/admin/hs-codes" className="hover:text-ink-700">HS kodovi</Link>
          <span>/</span>
          <span className="font-mono">{hsCode.code}</span>
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Uredi HS kod</h1>
        {hsCode._count.importRequests > 0 && (
          <p className="mt-1 text-sm text-amber-600">
            ⚠ Ovaj HS kod je dodijeljen na {hsCode._count.importRequests}{' '}
            {hsCode._count.importRequests === 1 ? 'zahtjev' : 'zahtjeva'} — izmjena stope
            utječe na sve procjene landed cost kalkulatora.
          </p>
        )}
      </div>

      <div className="card p-5">
        <HsCodeForm
          hsCodeId={hsCode.id}
          defaultValues={{
            code: hsCode.code,
            description: hsCode.description,
            dutyRate: hsCode.dutyRate.toString(),
            notes: hsCode.notes ?? '',
            source: hsCode.source ?? '',
          }}
        />
      </div>
    </div>
  );
}
