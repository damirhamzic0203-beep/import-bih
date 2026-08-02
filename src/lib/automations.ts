import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { ImportStatus } from '@prisma/client';

// Called after a Quote is ACCEPTED by the client and Order has been created.
export async function onQuoteAccepted(importRequestId: string): Promise<void> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) =>
        notify(
          a.id,
          'quote_accepted',
          'Ponuda je prihvaćena',
          undefined,
          `/admin/requests/${importRequestId}`
        )
      )
    );
  } catch (err) {
    console.error('Automation error (onQuoteAccepted):', err);
  }
}

// Called after a ShipmentEvent triggers an ImportRequest status change.
// Handles client notifications and any side-effects per status.
export async function onShipmentStatusChanged(
  importRequestId: string,
  newStatus: string,
  clientId: string
): Promise<void> {
  const NOTIFY_CONFIG: Record<string, { type: string; title: string }> = {
    [ImportStatus.IN_TRANSIT]: {
      type: 'shipment_departed',
      title: 'Pošiljka je krenula iz Kine',
    },
    [ImportStatus.DELIVERY]: {
      type: 'delivery_scheduled',
      title: 'Dostava je u toku',
    },
    [ImportStatus.COMPLETED]: {
      type: 'request_completed',
      title: 'Vaš zahtjev je završen',
    },
  };

  const notifyConfig = NOTIFY_CONFIG[newStatus];
  if (notifyConfig) {
    try {
      await notify(
        clientId,
        notifyConfig.type,
        notifyConfig.title,
        undefined,
        `/client/requests/${importRequestId}`
      );
    } catch (err) {
      console.error('Automation error (onShipmentStatusChanged notify):', err);
    }
  }

  // Auto-create a task when shipment enters customs — someone needs to follow up.
  if (newStatus === ImportStatus.CUSTOMS) {
    try {
      await prisma.task.create({
        data: {
          importRequestId,
          title: 'Provjeriti carinu',
          priority: 'HIGH',
          status: 'TODO',
        },
      });
    } catch (err) {
      console.error('Automation error (onShipmentStatusChanged customs task):', err);
    }
  }
}
