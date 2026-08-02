import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ImportStatus } from '@prisma/client';
import { onShipmentStatusChanged } from '@/lib/automations';

const schema = z.object({
  label: z.string().min(1),
  occurredAt: z.string(),
  note: z.string().nullish(),
});

const LABEL_TO_STATUS: Record<string, ImportStatus> = {
  'Departed China': ImportStatus.IN_TRANSIT,
  'Bosnia Customs': ImportStatus.CUSTOMS,
  'Delivery': ImportStatus.DELIVERY,
  'Completed': ImportStatus.COMPLETED,
};


export async function POST(
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

  const shipment = await prisma.shipment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      importRequestId: true,
      importRequest: { select: { clientId: true } },
    },
  });
  if (!shipment) {
    return NextResponse.json({ message: 'Pošiljka nije pronađena.' }, { status: 404 });
  }

  const { label, occurredAt, note } = parsed.data;
  const newStatus = LABEL_TO_STATUS[label];

  if (newStatus) {
    const results = await prisma.$transaction([
      prisma.shipmentEvent.create({
        data: {
          shipmentId: params.id,
          label,
          occurredAt: new Date(occurredAt),
          note: note ?? null,
        },
      }),
      prisma.importRequest.update({
        where: { id: shipment.importRequestId },
        data: { status: newStatus },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'importRequest.statusUpdated',
          entity: 'ImportRequest',
          entityId: shipment.importRequestId,
          newValue: { status: newStatus },
        },
      }),
    ]);

    await onShipmentStatusChanged(
      shipment.importRequestId,
      newStatus,
      shipment.importRequest.clientId
    );

    return NextResponse.json(results[0], { status: 201 });
  }

  const event = await prisma.shipmentEvent.create({
    data: {
      shipmentId: params.id,
      label,
      occurredAt: new Date(occurredAt),
      note: note ?? null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
