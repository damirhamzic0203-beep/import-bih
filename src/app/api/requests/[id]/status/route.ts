import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { ImportStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  status: z.nativeEnum(ImportStatus),
  note: z.string().optional(),
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

    const { status: newStatus, note } = parsed.data;

    const existing = await prisma.importRequest.findUnique({
      where: { id: params.id },
      select: { status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const oldStatus = existing.status;

    await prisma.importRequest.update({
      where: { id: params.id },
      data: { status: newStatus },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'request.status_changed',
        entity: 'ImportRequest',
        entityId: params.id,
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
      },
    });

    if (note?.trim()) {
      await prisma.internalNote.create({
        data: {
          importRequestId: params.id,
          authorId: session.user.id,
          body: note.trim(),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Status change error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške.' },
      { status: 500 }
    );
  }
}
