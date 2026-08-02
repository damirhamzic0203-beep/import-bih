import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function notify(
  userId: string,
  type: string,
  title: string,
  body?: string,
  link?: string
): Promise<void> {
  const [notification, user] = await Promise.all([
    prisma.notification.create({
      data: { userId, type, title, body: body ?? null, link: link ?? null },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
  ]);

  if (user?.email) {
    await sendEmail(user.email, title, body ?? title);
  }

  void notification;
}
