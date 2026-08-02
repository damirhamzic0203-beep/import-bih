import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const TRANSPORT_LABELS: { key: string; label: string }[] = [
  { key: 'supportsSea', label: 'More' },
  { key: 'supportsRail', label: 'Željeznica' },
  { key: 'supportsAir', label: 'Zrak' },
  { key: 'supportsRoad', label: 'Cestovni' },
  { key: 'supportsLcl', label: 'LCL' },
  { key: 'supportsFcl', label: 'FCL' },
  { key: 'supportsDoorToDoor', label: 'Door to Door' },
  { key: 'supportsCustoms', label: 'Carina' },
  { key: 'supportsWarehouse', label: 'Skladište' },
];

export default async function AdminForwarderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  const forwarder = await prisma.forwarder.findUnique({
    where: { id: params.id },
  });

  if (!forwarder) notFound();

  const activeTransport = TRANSPORT_LABELS.filter(
    ({ key }) => forwarder[key as keyof typeof forwarder] === true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/forwarders" className="text-ink-500 hover:text-ink-700 text-sm">
            ← Transporteri
          </Link>
          <span className="text-ink-300">/</span>
          <h1 className="text-2xl font-bold text-ink-900">{forwarder.companyName}</h1>
        </div>
        <Link href={`/admin/forwarders/${forwarder.id}/edit`} className="btn-secondary">
          Uredi
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-ink-900">Kontakt</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ink-500">Kontakt osoba</dt>
              <dd className="text-ink-900 font-medium">{forwarder.contactPerson || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Email</dt>
              <dd className="text-ink-900 font-medium">{forwarder.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Telefon</dt>
              <dd className="text-ink-900 font-medium">{forwarder.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Website</dt>
              <dd className="text-ink-900 font-medium">
                {forwarder.website ? (
                  <a href={forwarder.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                    {forwarder.website}
                  </a>
                ) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">Ocjena</dt>
              <dd className="text-ink-900 font-medium">
                {forwarder.rating ? '★'.repeat(forwarder.rating) + '☆'.repeat(5 - forwarder.rating) : '—'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-ink-900">Rute</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ink-500">Gradovi polaska</dt>
              <dd className="text-ink-900 font-medium">
                {forwarder.originCities.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {forwarder.originCities.map((city) => (
                      <span key={city} className="badge bg-ink-100 text-ink-700">{city}</span>
                    ))}
                  </div>
                ) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">Odredišne države</dt>
              <dd className="text-ink-900 font-medium">
                {forwarder.destinationCountries.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {forwarder.destinationCountries.map((country) => (
                      <span key={country} className="badge bg-brand-100 text-brand-800">{country}</span>
                    ))}
                  </div>
                ) : '—'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-ink-900">Vrste transporta i usluge</h2>
          {activeTransport.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeTransport.map(({ key, label }) => (
                <span key={key} className="badge bg-brand-100 text-brand-800">{label}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400">Nisu navedene vrste transporta</p>
          )}
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-ink-900">Napomene</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ink-500">Cijene</dt>
              <dd className="text-ink-900 whitespace-pre-wrap">{forwarder.pricingNotes || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Tranzitno vrijeme</dt>
              <dd className="text-ink-900 whitespace-pre-wrap">{forwarder.transitTimeNote || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Interne napomene</dt>
              <dd className="text-ink-900 whitespace-pre-wrap">{forwarder.internalNotes || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
