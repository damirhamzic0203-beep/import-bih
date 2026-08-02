import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  hsCodeId: z.string().cuid().nullable(),
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

  const { hsCodeId } = parsed.data;

  const current = await prisma.importRequest.findUnique({
    where: { id: params.id },
    select: { hsCodeId: true },
  });
  if (!current) {
    return NextResponse.json({ message: 'Zahtjev nije pronađen.' }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.importRequest.update({
      where: { id: params.id },
      data: { hsCodeId },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: hsCodeId ? 'request.hs_code_assigned' : 'request.hs_code_unassigned',
        entity: 'ImportRequest',
        entityId: params.id,
        oldValue: { hsCodeId: current.hsCodeId },
        newValue: { hsCodeId },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
