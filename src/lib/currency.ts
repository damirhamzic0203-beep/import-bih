import { prisma } from '@/lib/prisma';

// Returns null if no exchange rate is found for the given pair.
// Rates must be maintained manually via the admin settings panel.
// Does NOT invert automatically — store both directions if needed.
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number | null> {
  if (from === to) return amount;

  const rate = await prisma.exchangeRate.findUnique({
    where: { fromCurrency_toCurrency: { fromCurrency: from, toCurrency: to } },
  });

  if (!rate) return null;
  return amount * parseFloat(rate.rate.toString());
}
