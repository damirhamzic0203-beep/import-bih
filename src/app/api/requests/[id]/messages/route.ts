import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  body: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Neautorizirano.' }, { status: 401 });
  }

  if (session.user.role === 'CLIENT') {
    const importRequest = await prisma.importRequest.findUnique({
      where: { id: params.id },
      select: { clientId: true },
    });
    if (!importRequest || importRequest.clientId !== session.user.id) {
      return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
    }
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      importRequestId: params.id,
      senderId: session.user.id,
      body: parsed.data.body,
      isInternal: false,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
