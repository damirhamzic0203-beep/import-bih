import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, phone: true, message: true, createdAt: true },
  });

  console.log(`\nUkupno ContactSubmission unosa: ${rows.length}\n`);
  console.log("=".repeat(70));

  for (const r of rows) {
    console.log(`ID:      ${r.id}`);
    console.log(`Ime:     ${r.name}`);
    console.log(`Email:   ${r.email}`);
    console.log(`Telefon: ${r.phone ?? "(nije unesen)"}`);
    console.log(`Datum:   ${r.createdAt.toISOString()}`);
    console.log(`Poruka:\n${r.message}`);
    console.log("-".repeat(70));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
