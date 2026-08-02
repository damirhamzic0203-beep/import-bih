import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { HsCodeForm } from '@/components/hs-code-form';

export default async function NewHsCodePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/login');

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2 text-sm text-ink-400">
          <Link href="/admin/hs-codes" className="hover:text-ink-700">HS kodovi</Link>
          <span>/</span>
          <span>Novi zapis</span>
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Novi HS kod</h1>
        <p className="mt-1 text-sm text-ink-500">
          Dodajte novu carinsku tarifnu oznaku u internu bazu
        </p>
      </div>

      <div className="card p-5">
        <HsCodeForm />
      </div>
    </div>
  );
}
