import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Uvoz robe iz Kine — Import BiH',
  description: 'Sve što trebate znati o uvozu robe iz Kine u BiH: procedure, troškovi, dokumentacija i kako Import BiH ubrzava cijeli proces.',
};

export default function UvozRobeIzKinePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Uvoz robe iz Kine u BiH</h1>

        <p className="text-ink-600 leading-relaxed">
          Uvoz robe iz Kine postaje sve popularniji izbor za bosanskohercegovačke firme i poduzetnike koji žele smanjiti troškove nabavke. Međutim, bez iskustva i poznanstava u Kini, proces može biti rizičan i vremenski zahtevan. Import BiH rješava upravo taj problem — mi upravljamo cijelim lancem od kineskog dobavljača do vaše adrese.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Koje vrste robe uvozimo?</h2>
        <p className="text-ink-600 leading-relaxed">
          Imamo iskustvo u uvozu širokog spektra roba: električna i elektronska oprema, mašine, alati, tekstil i odjeća, nameštaj, dekoracija, sportska oprema, auto dijelovi, i mnogo više. Ako postoji legitimna potražnja i legalni uvoz, možemo organizovati nabavku.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Koraci procesa uvoza</h2>
        <div className="space-y-3">
          {[
            ['1', 'Podnošenje zahtjeva', 'Registrujete se i opisujete robu — link, opis, željene količine.'],
            ['2', 'Sourcing i ponuda', 'Naš tim pronalazi dobavljače, pregovara uvjete i šalje vam ponudu.'],
            ['3', 'Potvrda narudžbe', 'Prihvatate ponudu — mi koordiniramo plaćanje i narudžbu kod dobavljača.'],
            ['4', 'QC inspekcija', 'Ako je zatražena, inspektor provjerava robu u Kini prije ukrcaja.'],
            ['5', 'Transport', 'Organizujemo ukrcaj, pratimo pošiljku i informišemo vas o statusu.'],
            ['6', 'Carina i dostava', 'Carinska procedura u BiH, PDV i isporuka na vašu adresu.'],
          ].map(([num, title, desc]) => (
            <div key={num} className="flex gap-4 rounded-xl bg-ink-50 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {num}
              </span>
              <div>
                <p className="font-semibold text-ink-900 text-sm">{title}</p>
                <p className="text-sm text-ink-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-ink-900">Koji su troškovi uvoza?</h2>
        <p className="text-ink-600 leading-relaxed">
          Ukupni troškovi uvoza uključuju cijenu robe, transport, carinsku dažbinu (ovisi o tarifnom broju robe), PDV od 17% i naknadu Import BiH za organizaciju usluge. Svaka narudžba je individualna — pošaljite zahtjev za konkretnu ponudu.
        </p>

        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">Počnite s prvim uvozom danas</p>
          <p className="text-sm text-ink-600 mb-4">Registrujte se i pošaljite zahtjev — u roku od 24h imate ponudu.</p>
          <Link href="/register" className="btn-primary">Registrujte se</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
