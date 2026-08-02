import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ExchangeRateForm } from '@/components/exchange-rate-form';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin');
  }

  const [userCount, companyCount, requestCount, invoiceCount, exchangeRates] =
    await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.importRequest.count(),
      prisma.invoice.count(),
      prisma.exchangeRate.findMany({ orderBy: [{ fromCurrency: 'asc' }, { toCurrency: 'asc' }] }),
    ]);

  const stats = [
    { label: 'Korisnici', value: userCount },
    { label: 'Kompanije', value: companyCount },
    { label: 'Zahtjevi', value: requestCount },
    { label: 'Fakture', value: invoiceCount },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Postavke</h1>
        <p className="text-sm text-ink-500 mt-1">
          Vidljivo samo ADMIN korisnicima.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-xs text-ink-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Exchange Rates */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink-900">Valutni kursevi</h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Kursevi se koriste za interno konvertovanje cijena. Unesite smjer koji vam treba (npr. USD → EUR).
          </p>
        </div>

        {exchangeRates.length > 0 && (
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead>
              <tr>
                {['Od', 'Do', 'Kurs', 'Ažurirano'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {exchangeRates.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 font-mono font-medium text-ink-900">{r.fromCurrency}</td>
                  <td className="py-2 font-mono font-medium text-ink-900">{r.toCurrency}</td>
                  <td className="py-2 text-ink-700">{parseFloat(r.rate.toString()).toFixed(6)}</td>
                  <td className="py-2 text-xs text-ink-400">
                    {r.updatedAt.toLocaleDateString('bs-BA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pt-2 border-t border-ink-100">
          <p className="text-sm font-medium text-ink-700 mb-3">
            {exchangeRates.length > 0 ? 'Dodaj ili ažuriraj kurs' : 'Dodaj prvi kurs'}
          </p>
          <ExchangeRateForm />
        </div>
      </div>

      <div className="card bg-ink-50 border border-ink-200">
        <h2 className="text-base font-semibold text-ink-900 mb-2">Faza 2</h2>
        <p className="text-sm text-ink-600">
          Napredne postavke (e-mail notifikacije, API ključevi, branding, uloge i
          dozvole, integracije) bit će dostupne u Fazi 2 razvoja platforme.
        </p>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-ink-900 mb-3">Alati</h2>
        <Link
          href="/admin/settings/audit-log"
          className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
        >
          Pregledaj audit log →
        </Link>
      </div>
    </div>
  );
}
