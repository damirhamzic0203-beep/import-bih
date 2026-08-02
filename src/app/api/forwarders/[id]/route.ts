import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  companyName: z.string().min(1).optional(),
  contactPerson: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  originCities: z.array(z.string()).optional(),
  destinationCountries: z.array(z.string()).optional(),
  supportsSea: z.boolean().optional(),
  supportsRail: z.boolean().optional(),
  supportsAir: z.boolean().optional(),
  supportsRoad: z.boolean().optional(),
  supportsLcl: z.boolean().optional(),
  supportsFcl: z.boolean().optional(),
  supportsDoorToDoor: z.boolean().optional(),
  supportsCustoms: z.boolean().optional(),
  supportsWarehouse: z.boolean().optional(),
  pricingNotes: z.string().optional().nullable(),
  transitTimeNote: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
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

    const existing = await prisma.forwarder.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    await prisma.forwarder.update({ where: { id: params.id }, data: parsed.data });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'forwarder.updated',
        entity: 'Forwarder',
        entityId: params.id,
        newValue: { fields: Object.keys(parsed.data) },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Update forwarder error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške.' },
      { status: 500 }
    );
  }
}
