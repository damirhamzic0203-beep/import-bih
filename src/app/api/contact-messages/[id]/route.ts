import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === 'archive') {
    try {
      await prisma.contactMessage.update({
        where: { id: params.id },
        data: { status: 'ARHIVIRANO' },
      });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ message: 'Poruka nije pronađena.' }, { status: 404 });
    }
  }

  if (action === 'reply') {
    const { reply } = body;
    if (!reply || typeof reply !== 'string' || !reply.trim()) {
      return NextResponse.json({ message: 'Odgovor je obavezan.' }, { status: 400 });
    }

    const msg = await prisma.contactMessage.findUnique({ where: { id: params.id } });
    if (!msg) {
      return NextResponse.json({ message: 'Poruka nije pronađena.' }, { status: 404 });
    }

    await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        reply: reply.trim(),
        repliedAt: new Date(),
        repliedBy: session.user.name,
        status: 'ODGOVORENO',
      },
    });

    const emailBody = `
      Poštovani/a ${msg.name},<br><br>
      Hvala vam što ste nas kontaktirali. U nastavku vam dostavljamo odgovor na vaš upit.<br><br>
      <strong>Vaša poruka:</strong><br>
      <div style="border-left: 3px solid #e2e8f0; padding-left: 12px; color: #64748b; margin: 8px 0;">
        ${msg.message.replace(/\n/g, '<br>')}
      </div>
      <br>
      <strong>Naš odgovor:</strong><br>
      ${reply.trim().replace(/\n/g, '<br>')}<br><br>
      Srdačni pozdrav,<br>
      <strong>Isu Hamzić d.o.o.</strong><br>
      Import BiH tim
    `;

    await sendEmail(msg.email, 'Odgovor na vaš upit — Import BiH', emailBody);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ message: 'Nepoznata akcija.' }, { status: 400 });
}
