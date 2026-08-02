import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: '1688.com naručivanje za BiH — Import BiH',
  description: 'Naručujemo robu direktno s 1688.com (kineska B2B platforma) i dostavljamo u BiH po najnižim cijenama direktno od proizvođača.',
};

export default function Page1688BihPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">1688.com naručivanje za BiH</h1>

        <p className="text-ink-600 leading-relaxed">
          1688.com je kineska B2B platforma u vlasništvu Alibaba grupe, namijenjena isključivo domaćem kineskom tržištu. Cijene na 1688 su obično znatno niže nego na međunarodnom Alibaba.com, jer se radi o direktnim fabričkim cijenama bez međunarodne marže. Međutim, platforma je dostupna samo na kineskom jeziku i prihvata plaćanje isključivo putem kineskih platnih metoda — što stranima iz BiH čini direktno naručivanje gotovo nemogućim.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Kako Import BiH naručuje s 1688?</h2>
        <p className="text-ink-600 leading-relaxed">
          Naš tim u Kini ima pristup 1688 platformi i direktne kontakte s fabrikama. Kada nam pošaljete link s 1688 (ili opis robe), mi kontaktiramo dobavljača, pregovaramo uvjete i MOQ, organizujemo inspekciju ako je potrebna, i šaljemo vam finalnu ponudu uključujući transport do BiH.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Prednosti naručivanja s 1688</h2>
        <ul className="space-y-2 text-ink-600">
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Direktne fabričke cijene — često 20–50% niže nego na Alibaba.com</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Pristup hiljadama manjih, specijaliziranih dobavljača koji nisu na međunarodnoj platformi</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Mogućnost naručivanja manjih količina direktno od fabrike</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Brže dostupni uzorci jer se radi o domaćoj kineskoj logistici</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink-900">Kako pronaći pravi link na 1688?</h2>
        <p className="text-ink-600 leading-relaxed">
          Posjetite 1688.com i potražite proizvod koristeći pretraživač (Google Translate može pomoći s prevodom pretraživačkih termina). Kada pronađete odgovarajući listing, kopirajte URL i priložite ga u zahtjevu. Ako vam pretraživanje na kineskom otežano, naš sourcing tim može pronaći dobavljača na 1688 na osnovu vašeg opisa ili slike.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Šta ako nemam link?</h2>
        <p className="text-ink-600 leading-relaxed">
          Ništa ne brini — možete opisati robu riječima, priložiti sliku ili link s nekog drugog sajta, i naš tim će pronaći odgovarajući proizvod na 1688 ili drugoj kineskoj platformi. Sourcing je jedna od naših ključnih kompetencija.
        </p>

        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">Pronašli ste nešto na 1688.com?</p>
          <p className="text-sm text-ink-600 mb-4">Pošaljite nam link i dobit ćete ponudu s transportom do BiH.</p>
          <Link href="/register" className="btn-primary">Pošaljite zahtjev</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
