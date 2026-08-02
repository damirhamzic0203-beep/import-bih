import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { ForwarderForm } from '@/components/forwarder-form';

export default async function NewForwarderPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/forwarders" className="text-ink-500 hover:text-ink-700 text-sm">
          ← Transporteri
        </Link>
        <span className="text-ink-300">/</span>
        <h1 className="text-2xl font-bold text-ink-900">Novi transporter</h1>
      </div>

      <ForwarderForm />
    </div>
  );
}
