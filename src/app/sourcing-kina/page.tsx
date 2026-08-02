import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Sourcing iz Kine — Import BiH',
  description: 'Pronalazimo pouzdane dobavljače u Kini za vaš proizvod. Provjera fabrike, uzorci, pregovaranje cijena — sve u vaše ime.',
};

export default function SourcingKinaPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Sourcing iz Kine</h1>

        <p className="text-ink-600 leading-relaxed">
          Sourcing — pronalaženje pravog dobavljača po pravoj cijeni — najkritičniji je korak u procesu uvoza. Pogrešan izbor dobavljača može rezultirati lošim kvalitetom, kašnjenjem isporuke ili čak gubitkom novca. Import BiH nudi profesionalnu sourcing uslugu koja eliminira te rizike i osigurava da kupujete od provjerenih fabrika.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Šta obuhvata sourcing usluga?</h2>
        <div className="space-y-3">
          {[
            ['Istraživanje tržišta', 'Pretražujemo Alibaba, 1688.com, Made-in-China i direktne fabričke baze podataka za vaš proizvod.'],
            ['Shortlisting', 'Identificiramo 3–5 potencijalnih dobavljača koji ispunjavaju vaše kriterije (cijena, MOQ, certifikati).'],
            ['Verifikacija dobavljača', 'Provjeravamo registraciju firme, historiju rada, ocjene na platformi i reference.'],
            ['Uzorak i inspekcija', 'Naručujemo uzorak u vaše ime i, po potrebi, šaljemo inspektora u fabriku.'],
            ['Pregovaranje', 'Pregovaramo cijenu, MOQ, pakovanje i rok isporuke u vaše ime.'],
            ['Konačna ponuda', 'Dobijate detaljnu ponudu s preporukom najboljeg dobavljača i obrazloženjem.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl bg-ink-50 p-4">
              <p className="font-semibold text-ink-900 text-sm">{title}</p>
              <p className="text-sm text-ink-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-ink-900">Koje kategorije robe sourciramo?</h2>
        <p className="text-ink-600 leading-relaxed">
          Imamo iskustvo s gotovo svim kategorijama robe: elektronika i elektrooprema, mašine i alati, tekstil i odjeća, auto dijelovi, građevinski materijal, dekoracija i namještaj, sport i outdoor oprema, te plastični i metalni proizvodi. Svaki zahtjev je jedinstven — kontaktirajte nas s opisom robe i razgovarat ćemo o opcijama.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Da li imam link ili opis?</h2>
        <p className="text-ink-600 leading-relaxed">
          Možete nam poslati link s Alibaba ili 1688, fotografiju, tehničku specifikaciju, ili samo tekstualni opis robe. Na osnovu toga pronalazimo odgovarajuće dobavljače. Što više detalja date (materijal, dimenzije, certifikati, godišnja količina), to preciznije možemo targetirati pravu fabriku.
        </p>

        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">Trebate pronaći dobavljača u Kini?</p>
          <p className="text-sm text-ink-600 mb-4">Pošaljite nam opis ili link i naš sourcing tim preuzima dalje.</p>
          <Link href="/register" className="btn-primary">Zatražite sourcing</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
