import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContactMessageFilter } from '@/components/contact-message-filter';

const STATUS_LABELS: Record<string, string> = {
  NOVA: 'Nova',
  ODGOVORENO: 'Odgovoreno',
  ARHIVIRANO: 'Arhivirano',
};

const STATUS_COLORS: Record<string, string> = {
  NOVA: 'bg-blue-100 text-blue-800',
  ODGOVORENO: 'bg-emerald-100 text-emerald-800',
  ARHIVIRANO: 'bg-ink-100 text-ink-600',
};

export default async function ContactMessagesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  const status = searchParams.status;
  const where = status ? { status: status as 'NOVA' | 'ODGOVORENO' | 'ARHIVIRANO' } : {};

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-xl font-semibold text-ink-900">Poruke sa sajta</h1>

      <div className="flex items-center gap-4">
        <ContactMessageFilter current={status ?? ''} />
        <span className="text-sm text-ink-500">{messages.length} poruka</span>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-ink-600">Ime</th>
              <th className="px-4 py-3 text-left font-medium text-ink-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-ink-600">Poruka</th>
              <th className="px-4 py-3 text-left font-medium text-ink-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-ink-600">Datum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {messages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-400">
                  Nema poruka.
                </td>
              </tr>
            )}
            {messages.map((msg) => (
              <tr
                key={msg.id}
                className={`transition-colors hover:bg-ink-50 ${
                  msg.status === 'NOVA' ? 'bg-blue-50/40' : ''
                }`}
              >
                <td
                  className={`px-4 py-3 ${
                    msg.status === 'NOVA' ? 'font-semibold text-ink-900' : 'text-ink-700'
                  }`}
                >
                  {msg.name}
                </td>
                <td className="px-4 py-3 text-ink-600">{msg.email}</td>
                <td className="max-w-xs px-4 py-3 text-ink-600">
                  {msg.message.length > 80 ? msg.message.slice(0, 80) + '…' : msg.message}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_COLORS[msg.status] ?? 'bg-ink-100 text-ink-600'}`}>
                    {STATUS_LABELS[msg.status] ?? msg.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {msg.createdAt.toLocaleDateString('bs-BA')}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/contact-messages/${msg.id}`}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Detalji →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
