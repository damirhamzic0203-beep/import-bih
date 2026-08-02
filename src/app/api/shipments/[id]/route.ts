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
  currentLocation: z.string().nullish(),
  actualDeparture: z.string().nullish(),
  actualArrival: z.string().nullish(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const d = parsed.data;
  const updateData: Record<string, unknown> = {};

  if ('carrier' in d) updateData.carrier = d.carrier ?? null;
  if ('containerNumber' in d) updateData.containerNumber = d.containerNumber ?? null;
  if ('blNumber' in d) updateData.blNumber = d.blNumber ?? null;
  if ('trackingNumber' in d) updateData.trackingNumber = d.trackingNumber ?? null;
  if ('origin' in d) updateData.origin = d.origin ?? null;
  if ('destination' in d) updateData.destination = d.destination ?? null;
  if ('etd' in d) updateData.etd = d.etd ? new Date(d.etd) : null;
  if ('eta' in d) updateData.eta = d.eta ? new Date(d.eta) : null;
  if ('transportMode' in d) updateData.transportMode = d.transportMode ?? null;
  if ('currentLocation' in d) updateData.currentLocation = d.currentLocation ?? null;
  if ('actualDeparture' in d) updateData.actualDeparture = d.actualDeparture ? new Date(d.actualDeparture) : null;
  if ('actualArrival' in d) updateData.actualArrival = d.actualArrival ? new Date(d.actualArrival) : null;

  const shipment = await prisma.shipment.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(shipment);
}
