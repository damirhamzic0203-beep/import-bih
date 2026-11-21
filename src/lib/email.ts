import { Resend } from 'resend';

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  options?: { replyTo?: string }
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL - RESEND_API_KEY nije postavljen, fallback na log]', {
      to,
      subject,
      body,
    });
    return false;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Import BiH <onboarding@resend.dev>',
      to,
      subject,
      ...(options?.replyTo ? { replyTo: options.replyTo } : {}),
      html: `<div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #0e6089;">Import BiH</h2>
        <p>${body}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">
          Ovo je automatska poruka sa Import BiH platforme.
        </p>
      </div>`,
    });
    if (error) {
      console.error('[EMAIL] Resend greška:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[EMAIL] Greška pri slanju:', err);
    // Email failure ne smije srušiti glavnu akciju
    return false;
  }
}
