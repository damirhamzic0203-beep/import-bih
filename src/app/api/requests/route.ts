import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { ImportStatus, TransportMode } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { notify } from '@/lib/notify';

const schema = z.object({
  productName: z.string().min(1, 'Naziv proizvoda je obavezan'),
  productLink: z.string().optional().nullable(),
  alibabaLink: z.string().optional().nullable(),
  link1688: z.string().optional().nullable(),
  madeInChinaLink: z.string().optional().nullable(),
  productImageUrl: z.string().optional().nullable(),
  productDescription: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  needsSourcingHelp: z.boolean().default(false),

  quantity: z.number().int().positive().optional().nullable(),
  unit: z.string().optional().nullable(),
  estimatedPrice: z.number().positive().optional().nullable(),
  targetPrice: z.number().positive().optional().nullable(),
  moq: z.number().int().positive().optional().nullable(),

  hasOwnSupplier: z.boolean().default(false),

  originCity: z.string().optional().nullable(),
  originCountry: z.string().default('China'),
  readyDate: z.string().optional().nullable(),
  estimatedWeightKg: z.number().positive().optional().nullable(),
  estimatedCbm: z.number().positive().optional().nullable(),
  packageCount: z.number().int().positive().optional().nullable(),
  unknownWeightCbm: z.boolean().default(false),
  transportModes: z.array(z.enum(['SEA', 'RAIL', 'AIR', 'ROAD'])).default([]),

  destinationCity: z.string().optional().nullable(),
  destinationAddress: z.string().optional().nullable(),
  destinationPostcode: z.string().optional().nullable(),
  doorToDoor: z.boolean().default(false),

  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  clientNote: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const year = new Date().getFullYear();
    const count = await prisma.importRequest.count({
      where: { code: { startsWith: `IMP-${year}-` } },
    });
    const code = `IMP-${year}-${String(count + 1).padStart(6, '0')}`;

    // needsSourcingHelp is always true (sourcing is our core service), so
    // REQUIRES_ASSESSMENT is triggered only when weight/CBM is unknown.
    const needsAssessment = data.unknownWeightCbm;

    const importRequest = await prisma.importRequest.create({
      data: {
        code,
        status: needsAssessment ? 'REQUIRES_ASSESSMENT' : 'NEW',
        requiresAssessment: needsAssessment,
        clientId: session.user.id,
        companyId: session.user.companyId ?? undefined,

        productName: data.productName,
        productLink: data.productLink ?? undefined,
        alibabaLink: data.alibabaLink ?? undefined,
        link1688: data.link1688 ?? undefined,
        madeInChinaLink: data.madeInChinaLink ?? undefined,
        productImageUrl: data.productImageUrl ?? undefined,
        productDescription: data.productDescription ?? undefined,
        category: data.category ?? undefined,
        needsSourcingHelp: data.needsSourcingHelp,

        quantity: data.quantity ?? undefined,
        unit: data.unit ?? undefined,
        estimatedPrice: data.estimatedPrice ?? undefined,
        targetPrice: data.targetPrice ?? undefined,
        moq: data.moq ?? undefined,

        hasOwnSupplier: data.hasOwnSupplier,

        originCity: data.originCity ?? undefined,
        originCountry: data.originCountry,
        readyDate: data.readyDate ? new Date(data.readyDate) : undefined,
        estimatedWeightKg: data.estimatedWeightKg ?? undefined,
        estimatedCbm: data.estimatedCbm ?? undefined,
        packageCount: data.packageCount ?? undefined,
        unknownWeightCbm: data.unknownWeightCbm,
        transportModes: data.transportModes as TransportMode[],

        destinationCity: data.destinationCity ?? undefined,
        destinationAddress: data.destinationAddress ?? undefined,
        destinationPostcode: data.destinationPostcode ?? undefined,
        doorToDoor: data.doorToDoor,

        contactName: data.contactName ?? undefined,
        contactPhone: data.contactPhone ?? undefined,
        contactEmail: data.contactEmail ?? undefined,
        clientNote: data.clientNote ?? undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'request.created',
        entity: 'ImportRequest',
        entityId: importRequest.id,
        newValue: { code: importRequest.code, productName: importRequest.productName },
      },
    });

    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      await Promise.all(
        admins.map((a) =>
          notify(
            a.id,
            'new_request',
            `Novi zahtjev: ${code}`,
            importRequest.productName,
            `/admin/requests/${importRequest.id}`
          )
        )
      );
    } catch (notifyErr) {
      console.error('Notify error (new request):', notifyErr);
    }

    return NextResponse.json(
      { ok: true, id: importRequest.id, code: importRequest.code },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create request error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const validStatus =
    statusParam && Object.values(ImportStatus).includes(statusParam as ImportStatus)
      ? (statusParam as ImportStatus)
      : undefined;

  if (session.user.role === 'CLIENT') {
    const requests = await prisma.importRequest.findMany({
      where: { clientId: session.user.id, ...(validStatus ? { status: validStatus } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(requests);
  }

  const requests = await prisma.importRequest.findMany({
    where: validStatus ? { status: validStatus } : {},
    include: { client: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(requests);
}
