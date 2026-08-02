import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Uvoz iz Kine u BiH — Import BiH',
  description: 'Organizujemo kompletan uvoz robe iz Kine u Bosnu i Hercegovinu: sourcing, provjera dobavljača, transport, carina i dostava.',
};

export default function UvozIzKinePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Uvoz iz Kine u BiH</h1>

        <p className="text-ink-600 leading-relaxed">
          Uvoz robe iz Kine može biti veoma isplativ, ali je istovremeno i složen proces koji uključuje pronalaženje pouzdanog dobavljača, pregovaranje cijena, organizaciju transporta, carinska dokumenta i završnu dostavu. Import BiH je vaš jedini kontakt za cijeli ovaj put — od ideje do robe na vašoj adresi.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Zašto uvoziti iz Kine?</h2>
        <p className="text-ink-600 leading-relaxed">
          Kina je najveći svjetski proizvođač robe široke potrošnje, industrijske opreme, elektronike, tekstila i bezbroj drugih kategorija. Cijene direktno od kineskih proizvođača mogu biti i do nekoliko puta niže nego na domaćem tržištu, što uvoz čini atraktivnom opcijom i za male i za srednje firme u BiH.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Šta sve obuhvata naša usluga?</h2>
        <ul className="space-y-2 text-ink-600">
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Pronalaženje i provjera dobavljača na platformama Alibaba, 1688.com i Made-in-China</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Pregovaranje cijene i uvjeta isporuke u vaše ime</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Organizacija kontrole kvaliteta (QC inspekcija) u Kini</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Odabir najpovoljnijeg transportnog puta (more, željeznica, air)</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Kompletna carinska procedura u BiH</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Dostava na vašu adresu ili u skladište</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink-900">Ko može koristiti Import BiH?</h2>
        <p className="text-ink-600 leading-relaxed">
          Naše usluge su namijenjene malim i srednjim preduzećima, poduzetnicima, ali i fizičkim licima koja žele uvesti robu za vlastite ili poslovne potrebe. Nema minimalne vrijednosti narudžbe — svaki zahtjev razmatramo individualno i prilagođavamo ponudu konkretnim potrebama.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Kako početi?</h2>
        <p className="text-ink-600 leading-relaxed">
          Registrujte se na platformi, popunite zahtjev s opisom robe (link s Alibaba ili opis), i naš tim će vas kontaktirati s individualnom ponudom. Cijeli proces je transparentan — pratite status svog zahtjeva u realnom vremenu kroz korisnički portal.
        </p>

        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">Spremni za prvi uvoz?</p>
          <p className="text-sm text-ink-600 mb-4">Pošaljite zahtjev i dobit ćete ponudu bez obaveze.</p>
          <Link href="/register" className="btn-primary">Zatražite ponudu</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
