import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Alibaba naručivanje za BiH — Import BiH',
  description: 'Naručite robu s Alibaba i dostavljamo je u BiH. Mi pregovaramo, organizujemo transport i carinu umjesto vas.',
};

export default function AlibabaBihPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Alibaba naručivanje za BiH</h1>

        <p className="text-ink-600 leading-relaxed">
          Alibaba.com je najveća svjetska B2B platforma s milijunima kineskih dobavljača i gotovo neograničenim spektrom proizvoda. Ali direktno naručivanje s Alibaba za kupce iz BiH nosi niz izazova: jezična barijera, nesigurnost u kvalitet, transport, carina i plaćanje međunarodnih faktura. Import BiH eliminiše sve te prepreke.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Kako funkcioniše narudžba putem Alibaba?</h2>
        <p className="text-ink-600 leading-relaxed">
          Kada pronađete proizvod koji vas zanima na Alibaba.com, jednostavno kopirajte link i priložite ga u vaš zahtjev na Import BiH platformi. Naš tim kontaktira dobavljača, pregovara finalnu cijenu i MOQ (minimalnu količinu), traži uzorke ako je potrebno, i organizuje plaćanje i isporuku.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Zašto ne naručiti direktno?</h2>
        <ul className="space-y-2 text-ink-600">
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Mnogi Alibaba prodavači traže T/T bankarskim transferom u USD — što je za privatne osobe komplicirano</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Bez iskustva, teško je procijeniti da li je dobavljač pouzdan ili lažan</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Direktan uvoz iznad određene vrijednosti zahtijeva uvoznu dozvolu i carinski postupak u BiH</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Organizacija transporta (FCL/LCL) iz Kine zahtijeva kontakte s međunarodnim špediterima</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink-900">Šta vam je potrebno da počnete?</h2>
        <p className="text-ink-600 leading-relaxed">
          Dovoljno je da pronađete proizvod na Alibaba i kopirate link. Import BiH se brine o svemu ostalom — kontaktu s dobavljačem, uzorcima, transportu, carini i dostavi. Ako još niste pronašli dobavljača, naš sourcing tim to može učiniti umjesto vas.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Da li postoji minimalna narudžba?</h2>
        <p className="text-ink-600 leading-relaxed">
          Svaki dobavljač na Alibaba ima vlastiti MOQ (minimum order quantity). Mi pregovaramo MOQ u vaše ime i tražimo najpovoljnije uvjete. Za pošiljke manjih vrijednosti koristimo LCL (grupni) transport kako bi trošak dostave ostao prihvatljiv.
        </p>

        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">Pronašli ste proizvod na Alibaba?</p>
          <p className="text-sm text-ink-600 mb-4">Kopirajte link i pošaljite nam zahtjev — mi ćemo dogovoriti sve ostalo.</p>
          <Link href="/register" className="btn-primary">Pošaljite zahtjev</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
