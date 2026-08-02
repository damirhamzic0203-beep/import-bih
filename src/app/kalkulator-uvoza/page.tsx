import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ImportCostCalculator } from '@/components/import-cost-calculator';

export const metadata: Metadata = {
  title: 'Kalkulator troškova uvoza iz Kine — Import BiH',
  description: 'Izračunajte okvirne troškove uvoza iz Kine u BiH: cijena robe, transport, carina i PDV. Besplatan online kalkulator.',
};

export default function KalkulatorUvozaPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Kalkulator troškova uvoza</h1>

        <p className="text-ink-600 leading-relaxed">
          Koristite ovaj kalkulator za okvirnu procjenu ukupnih troškova uvoza robe iz Kine u BiH. Unesite cijenu robe, procjenu transporta i očekivanu carinsku stopu — kalkulator automatski računa carinsku dažbinu, PDV (17%) i ukupni landed cost.
        </p>

        <ImportCostCalculator />

        <h2 className="text-xl font-semibold text-ink-900">Šta je landed cost?</h2>
        <p className="text-ink-600 leading-relaxed">
          Landed cost je ukupni trošak uvoza robe do vaše adrese — uključuje cijenu robe, međunarodni transport, carinsku dažbinu i PDV. To je stvarna cijena koja određuje koliko ćete platiti za robu "na zidu". Import BiH uračunava i svoju naknadu za organizaciju usluge u finalnu ponudu.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Kako odrediti carinsku stopu?</h2>
        <p className="text-ink-600 leading-relaxed">
          Carinska stopa u BiH određuje se na osnovu HS (Harmonized System) tarifnog broja robe. Svaka vrsta robe ima vlastiti HS kod i stopu koja se kreće od 0% (npr. za određenu industrijsku opremu) do 15% (za neke kategroije tekstila i prehrambenih proizvoda). Naš carinski agent određuje tačnu stopu za vašu robu pri izradi ponude.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Da li je ovo tačna cijena?</h2>
        <p className="text-ink-600 leading-relaxed">
          Kalkulator daje samo okvirnu procjenu za planiranje budžeta. Stvarna cijena može se razlikovati zbog tačnog HS koda, deklarirane vrijednosti na fakturi, eventualnih carinskih pregleda, kursnih razlika i specifičnih uvjeta transporta. Pošaljite zahtjev za preciznu i obavezujuću ponudu.
        </p>

        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">Zainteresovani za uvoz?</p>
          <p className="text-sm text-ink-600 mb-4">Dobijte preciznu ponudu — besplatno i bez obaveze.</p>
          <Link href="/register" className="btn-primary">Zatražite ponudu</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
