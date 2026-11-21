import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { sendEmail } from '@/lib/email';
import { checkRateLimit, getIp } from '@/lib/rate-limit';

const esc = (v: string) =>
  v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const schema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIp(req), 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: 'Previše pokušaja. Pokušajte ponovo za nekoliko minuta.' },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const { name, company, phone, email, message } = parsed.data;

  // 1) Email prvi - primarni kanal dostave poruke.
  const emailSent = await sendEmail(
    process.env.CONTACT_NOTIFY_EMAIL || 'kontakt@importbih.com',
    `Nova poruka sa sajta: ${name.replace(/[\r\n]+/g, ' ')}`,
    [
      `<strong>Ime:</strong> ${esc(name)}`,
      `<strong>Email:</strong> ${esc(email)}`,
      `<strong>Telefon:</strong> ${esc(phone || '-')}`,
      company ? `<strong>Firma:</strong> ${esc(company)}` : '',
      `<strong>Poruka:</strong><br />${esc(message).replace(/\n/g, '<br />')}`,
    ]
      .filter(Boolean)
      .join('<br />'),
    { replyTo: email }
  );

  // 2) Upis u bazu - uspjeh ako je email poslan ILI je upis uspio.
  let saved: { id: string };
  try {
    await prisma.contactSubmission.create({
      data: { name, company: company ?? null, phone: phone ?? null, email, message },
    });
    saved = await prisma.contactMessage.create({
      data: { name, phone: phone ?? null, email, message },
    });
  } catch (dbErr) {
    console.error('DB error (contact form):', dbErr);
    if (emailSent) return NextResponse.json({ ok: true });
    return NextResponse.json(
      {
        message:
          'Slanje nije uspjelo, pokušajte ponovo ili nas kontaktirajte na kontakt@importbih.com',
      },
      { status: 500 }
    );
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) =>
        notify(
          a.id,
          'contact_form',
          `Nova poruka sa kontakt forme: ${name}`,
          message,
          `/admin/contact-messages/${saved.id}`
        )
      )
    );
  } catch (notifyErr) {
    console.error('Notify error (contact form):', notifyErr);
  }

  return NextResponse.json({ ok: true });
}
