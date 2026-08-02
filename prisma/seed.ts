import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const company = await prisma.company.upsert({
    where: { id: 'seed-company-abc' },
    update: {},
    create: {
      id: 'seed-company-abc',
      name: 'ABC d.o.o.',
      taxId: '4200000000001',
      city: 'Sarajevo',
      country: 'Bosna i Hercegovina',
    },
  });

  const users: Array<{ email: string; name: string; role: Role; companyId?: string }> = [
    { email: 'admin@importbih.ba', name: 'Admin Korisnik', role: Role.ADMIN },
    { email: 'ops@importbih.ba', name: 'Operativa Korisnik', role: Role.OPERATIONS },
    { email: 'sales@importbih.ba', name: 'Prodaja Korisnik', role: Role.SALES },
    {
      email: 'klijent@abc.ba',
      name: 'Klijent Test',
      role: Role.CLIENT,
      companyId: company.id,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: password,
        companyId: u.companyId,
      },
    });
  }

  console.log('Seed complete. Test login for every role: password123');
  console.log(users.map((u) => u.email).join('\n'));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });