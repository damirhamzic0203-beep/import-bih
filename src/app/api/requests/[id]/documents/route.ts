import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { notify } from '@/lib/notify';

const schema = z.object({
  folder: z.string().min(1),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  visibleToClient: z.boolean().default(false),
});

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

  const document = await prisma.document.create({
    data: {
      importRequestId: params.id,
      folder: parsed.data.folder,
      fileName: parsed.data.fileName,
      fileUrl: parsed.data.fileUrl,
      visibleToClient: parsed.data.visibleToClient,
    },
  });

  if (parsed.data.visibleToClient) {
    try {
      const importRequest = await prisma.importRequest.findUnique({
        where: { id: params.id },
        select: { clientId: true },
      });
      if (importRequest) {
        await notify(
          importRequest.clientId,
          'document_uploaded',
          'Novi dokument je dostupan',
          parsed.data.fileName,
          `/client/requests/${params.id}`
        );
      }
    } catch (notifyErr) {
      console.error('Notify error (document uploaded):', notifyErr);
    }
  }

  return NextResponse.json(document, { status: 201 });
}
