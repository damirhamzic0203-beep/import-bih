import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  companyName: z.string().min(1, 'Naziv firme je obavezan'),
  contactPerson: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  originCities: z.array(z.string()).default([]),
  destinationCountries: z.array(z.string()).default([]),
  supportsSea: z.boolean().default(false),
  supportsRail: z.boolean().default(false),
  supportsAir: z.boolean().default(false),
  supportsRoad: z.boolean().default(false),
  supportsLcl: z.boolean().default(false),
  supportsFcl: z.boolean().default(false),
  supportsDoorToDoor: z.boolean().default(false),
  supportsCustoms: z.boolean().default(false),
  supportsWarehouse: z.boolean().default(false),
  pricingNotes: z.string().optional().nullable(),
  transitTimeNote: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
});

export async function POST(request: Request) {
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

    const forwarder = await prisma.forwarder.create({ data: parsed.data });

    return NextResponse.json({ ok: true, id: forwarder.id }, { status: 201 });
  } catch (err) {
    console.error('Create forwarder error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške.' },
      { status: 500 }
    );
  }
}
