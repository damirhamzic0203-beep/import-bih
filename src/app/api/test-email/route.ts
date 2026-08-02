// PRIVREMENA TEST RUTA — može se ukloniti nakon što se potvrdi da Resend radi.
// Poziv: GET /api/test-email (samo admin)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  await sendEmail(
    session.user.email ?? 'test@example.com',
    'Import BiH — test email',
    'Ovo je testna poruka poslana sa Import BiH platforme. Ako ovo vidite, Resend radi ispravno.'
  );

  return NextResponse.json({ ok: true, message: 'Test email poslat na ' + session.user.email });
}
