import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { TransportMode } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  importRequestId: z.string().min(1),
  cargoDescription: z.string().optional().nullable(),
  quantity: z.number().int().min(1).optional().nullable(),
  weightKg: z.number().optional().nullable(),
  volumeCbm: z.number().optional().nullable(),
  originCity: z.string().optional().nullable(),
  destinationCity: z.string().optional().nullable(),
  readyDate: z.string().optional().nullable(),
  requestedModes: z.array(z.nativeEnum(TransportMode)).default([]),
  requiresPickupChina: z.boolean().default(false),
  requiresExportCustoms: z.boolean().default(false),
  requiresFreight: z.boolean().default(true),
  requiresEuTransit: z.boolean().default(false),
  requiresBihCustoms: z.boolean().default(false),
  requiresDelivery: z.boolean().default(false),
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

    const { importRequestId, readyDate, ...rest } = parsed.data;

    const importRequest = await prisma.importRequest.findUnique({
      where: { id: importRequestId },
      select: { id: true },
    });
    if (!importRequest) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const transportRequest = await prisma.transportRequest.create({
      data: {
        importRequestId,
        readyDate: readyDate ? new Date(readyDate) : null,
        ...rest,
      },
    });

    return NextResponse.json({ ok: true, id: transportRequest.id }, { status: 201 });
  } catch (err) {
    console.error('Create transport request error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
