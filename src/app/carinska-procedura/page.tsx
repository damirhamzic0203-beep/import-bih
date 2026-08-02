import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Carinska procedura za uvoz u BiH — Import BiH',
  description: 'Sve o carinskoj proceduri pri uvozu robe iz Kine u Bosnu i Hercegovinu: dokumenti, dažbine, PDV i kako Import BiH organizuje carinjenje.',
};

export default function CarinskaProcedureaPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Carinska procedura za uvoz u BiH</h1>

        <p className="text-ink-600 leading-relaxed">
          Carinjenje uvezene robe jedan je od najzahtjevnijih koraka u procesu uvoza — pogrešna klasifikacija robe, nedostajuća dokumenta ili neplaćene dažbine mogu uzrokovati zadržavanje pošiljke i dodatne troškove. Import BiH surađuje s licenciranim carinskim agentima u BiH koji se brinu o cjelokupnoj carinskoj proceduri.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Carinski dokumenti za uvoz</h2>
        <ul className="space-y-2 text-ink-600">
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Komercijalna faktura (commercial invoice) od kineskog dobavljača</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Packing lista (popis pakovanja s težinama i dimenzijama)</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Tovarni list (Bill of Lading za morski, Air Waybill za vazdušni transport)</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Certifikat o porijeklu robe (Certificate of Origin) ako se primjenjuje preferencijalnu tarifu</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Tehnički ili sigurnosni certifikati za određene kategorije robe (CE, RoHS, itd.)</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink-900">Carinska dažbina i PDV</h2>
        <p className="text-ink-600 leading-relaxed">
          Stopa carinske dažbine u BiH ovisi o tarifnom broju robe (HS kod) i kretala se od 0% do 15% carinske vrijednosti, s tim da se određene kategorije robe oslobođene carine. Pored carine, na uvezenu robu plaća se i PDV od 17% koji se obračunava na carinsku vrijednost uvećanu za carinsku dažbinu i transportne troškove. Import BiH unaprijed procjenjuje sve dažbine i uračunava ih u finalnu ponudu.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Kako Import BiH organizuje carinjenje?</h2>
        <p className="text-ink-600 leading-relaxed">
          Nakon što pošiljka stigne u BiH (lučka ili granična procedura), naš carinski agent preuzima svu dokumentaciju, klasificira robu po HS kodu, podnosi uvoznu deklaraciju, organizuje pregled ako ga carina traži, i plaća dažbine u vaše ime (koje se refakturiraju). Informišemo vas o svakom koraku i šaljemo vam kopije svih carinskih dokumenata.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Koliko traje carinjenje?</h2>
        <p className="text-ink-600 leading-relaxed">
          U standardnim slučajevima, carinjenje traje 1–3 radna dana od ulaska robe u BiH. Ako carina zatraži fizički pregled robe ili dodatne dokumente (npr. certifikat za prehrambene ili sigurnosne standarde), postupak može potrajati duže. Import BiH aktivno prati status i odmah reaguje na svaki zahtjev carine.
        </p>

        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">Prepustite nam carinsku proceduru</p>
          <p className="text-sm text-ink-600 mb-4">Mi organizujemo sve — od dokumentacije do isporuke robe nakon carinjenja.</p>
          <Link href="/register" className="btn-primary">Zatražite ponudu</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
