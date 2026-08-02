import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { ForwarderForm } from '@/components/forwarder-form';

export default async function EditForwarderPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  const forwarder = await prisma.forwarder.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      email: true,
      phone: true,
      website: true,
      originCities: true,
      destinationCountries: true,
      supportsSea: true,
      supportsRail: true,
      supportsAir: true,
      supportsRoad: true,
      supportsLcl: true,
      supportsFcl: true,
      supportsDoorToDoor: true,
      supportsCustoms: true,
      supportsWarehouse: true,
      pricingNotes: true,
      transitTimeNote: true,
      internalNotes: true,
      rating: true,
    },
  });

  if (!forwarder) notFound();

  const initialData = {
    companyName: forwarder.companyName,
    contactPerson: forwarder.contactPerson ?? '',
    email: forwarder.email ?? '',
    phone: forwarder.phone ?? '',
    website: forwarder.website ?? '',
    originCities: forwarder.originCities.join(', '),
    destinationCountries: forwarder.destinationCountries.join(', '),
    supportsSea: forwarder.supportsSea,
    supportsRail: forwarder.supportsRail,
    supportsAir: forwarder.supportsAir,
    supportsRoad: forwarder.supportsRoad,
    supportsLcl: forwarder.supportsLcl,
    supportsFcl: forwarder.supportsFcl,
    supportsDoorToDoor: forwarder.supportsDoorToDoor,
    supportsCustoms: forwarder.supportsCustoms,
    supportsWarehouse: forwarder.supportsWarehouse,
    pricingNotes: forwarder.pricingNotes ?? '',
    transitTimeNote: forwarder.transitTimeNote ?? '',
    internalNotes: forwarder.internalNotes ?? '',
    rating: forwarder.rating?.toString() ?? '',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/forwarders/${forwarder.id}`} className="text-ink-500 hover:text-ink-700 text-sm">
          ← {forwarder.companyName}
        </Link>
        <span className="text-ink-300">/</span>
        <h1 className="text-2xl font-bold text-ink-900">Uredi transportera</h1>
      </div>

      <ForwarderForm forwarderId={forwarder.id} initialData={initialData} />
    </div>
  );
}
