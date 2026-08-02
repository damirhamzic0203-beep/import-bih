import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SupplierForm } from '@/components/supplier-form';

export default async function EditSupplierPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/');

  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      phone: true,
      email: true,
      wechat: true,
      website: true,
      alibabaUrl: true,
      url1688: true,
      country: true,
      city: true,
      isFactory: true,
      categories: true,
      moq: true,
      rating: true,
      notes: true,
    },
  });

  if (!supplier) notFound();

  const initialData = {
    companyName: supplier.companyName,
    contactPerson: supplier.contactPerson ?? '',
    phone: supplier.phone ?? '',
    email: supplier.email ?? '',
    wechat: supplier.wechat ?? '',
    website: supplier.website ?? '',
    alibabaUrl: supplier.alibabaUrl ?? '',
    url1688: supplier.url1688 ?? '',
    country: supplier.country,
    city: supplier.city ?? '',
    isFactory: supplier.isFactory,
    categories: supplier.categories.join(', '),
    moq: supplier.moq?.toString() ?? '',
    rating: supplier.rating?.toString() ?? '',
    notes: supplier.notes ?? '',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/suppliers/${supplier.id}`} className="text-ink-500 hover:text-ink-700 text-sm">
          ← {supplier.companyName}
        </Link>
        <span className="text-ink-300">/</span>
        <h1 className="text-2xl font-bold text-ink-900">Uredi dobavljača</h1>
      </div>

      <SupplierForm supplierId={supplier.id} initialData={initialData} />
    </div>
  );
}
