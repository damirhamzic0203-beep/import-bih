import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContactMessageReplyForm } from '@/components/contact-message-reply-form';

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

export default async function ContactMessageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  const msg = await prisma.contactMessage.findUnique({ where: { id: params.id } });
  if (!msg) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2 text-sm text-ink-400">
          <Link href="/admin/contact-messages" className="hover:text-ink-700">
            Poruke sa sajta
          </Link>
          <span>/</span>
          <span>{msg.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-ink-900">{msg.name}</h1>
          <span className={`badge ${STATUS_COLORS[msg.status] ?? 'bg-ink-100 text-ink-600'}`}>
            {STATUS_LABELS[msg.status] ?? msg.status}
          </span>
        </div>
      </div>

      {/* Detalji kontakta i poruka */}
      <div className="card space-y-4 p-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-ink-400">Email</p>
            <a href={`mailto:${msg.email}`} className="text-brand-600 hover:underline">
              {msg.email}
            </a>
          </div>
          {msg.phone && (
            <div>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-ink-400">Telefon</p>
              <a href={`tel:${msg.phone}`} className="text-ink-900 hover:underline">
                {msg.phone}
              </a>
            </div>
          )}
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-ink-400">Datum</p>
            <p className="text-ink-700">
              {msg.createdAt.toLocaleDateString('bs-BA')}{' '}
              {msg.createdAt.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Poruka</p>
          <div className="rounded-lg bg-ink-50 p-4 text-sm text-ink-900 whitespace-pre-wrap">
            {msg.message}
          </div>
        </div>
      </div>

      {/* Postojeći odgovor */}
      {msg.reply && (
        <div className="card space-y-2 border-l-4 border-emerald-400 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-emerald-700">Vaš odgovor</p>
            {msg.repliedAt && (
              <span className="text-xs text-ink-400">
                {msg.repliedAt.toLocaleDateString('bs-BA')}{' '}
                {msg.repliedAt.toLocaleTimeString('bs-BA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {msg.repliedBy && ` · ${msg.repliedBy}`}
              </span>
            )}
          </div>
          <p className="text-sm text-ink-700 whitespace-pre-wrap">{msg.reply}</p>
        </div>
      )}

      {/* Forma za odgovor */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-900">
          {msg.reply ? 'Izmijeni / pošalji novi odgovor' : 'Odgovorite klijentu'}
        </h2>
        <ContactMessageReplyForm
          messageId={msg.id}
          existingReply={msg.reply}
          currentStatus={msg.status}
        />
      </div>
    </div>
  );
}
