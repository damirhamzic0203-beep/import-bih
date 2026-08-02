import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { TransportMode } from '@prisma/client';

const schema = z.object({
  carrier: z.string().nullish(),
  containerNumber: z.string().nullish(),
  blNumber: z.string().nullish(),
  trackingNumber: z.string().nullish(),
  origin: z.string().nullish(),
  destination: z.string().nullish(),
  etd: z.string().nullish(),
  eta: z.string().nullish(),
  transportMode: z.nativeEnum(TransportMode).nullish(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  const existing = await prisma.shipment.findUnique({
    where: { importRequestId: params.id },
  });
  if (existing) {
    return NextResponse.json({ message: 'Pošiljka već postoji za ovaj zahtjev.' }, { status: 409 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const d = parsed.data;
  const year = new Date().getFullYear();
  const count = await prisma.shipment.count();
  const code = `SHP-${year}-${String(count + 1).padStart(6, '0')}`;

  const shipment = await prisma.shipment.create({
    data: {
      code,
      importRequestId: params.id,
      carrier: d.carrier ?? null,
      containerNumber: d.containerNumber ?? null,
      blNumber: d.blNumber ?? null,
      trackingNumber: d.trackingNumber ?? null,
      origin: d.origin ?? null,
      destination: d.destination ?? null,
      etd: d.etd ? new Date(d.etd) : null,
      eta: d.eta ? new Date(d.eta) : null,
      transportMode: d.transportMode ?? null,
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      label: 'Pošiljka kreirana',
      occurredAt: new Date(),
    },
  });

  return NextResponse.json(shipment, { status: 201 });
}
