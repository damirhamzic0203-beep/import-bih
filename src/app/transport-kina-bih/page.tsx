import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Transport Kina–BiH — Import BiH',
  description: 'Organizujemo morski, željezni i air freight iz Kine u Bosnu i Hercegovinu. FCL, LCL i express dostava.',
};

export default function TransportKinaBihPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Transport Kina–BiH</h1>

        <p className="text-ink-600 leading-relaxed">
          Organizacija transporta iz Kine u Bosnu i Hercegovinu zahtijeva dobro poznavanje dostupnih ruta, tranzitnih rokova i troškova. Import BiH surađuje s mrežom provjerenih špeditera i nudi vam najpovoljniju kombinaciju cijene i brzine za vašu specifičnu pošiljku.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Dostupni načini transporta</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: '🚢', name: 'Morski transport', desc: 'FCL i LCL kontejneri. Najpovoljnija opcija za veće pošiljke. Tranzit tipično 30–45 dana do luka u EU.' },
            { icon: '🚂', name: 'Željeznica', desc: 'Kina–Europa željezničkim koridorom. Dobar balans cijene i brzine. Tranzit oko 18–25 dana.' },
            { icon: '✈️', name: 'Air freight', desc: 'Za hitne ili visoko vrijedne pošiljke. Tranzit 5–10 radnih dana, viša cijena po kilogramu.' },
          ].map((m) => (
            <div key={m.name} className="card p-4 text-center">
              <div className="text-3xl mb-2">{m.icon}</div>
              <p className="font-semibold text-ink-900 text-sm mb-1">{m.name}</p>
              <p className="text-xs text-ink-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-ink-900">FCL ili LCL — šta je bolje za vas?</h2>
        <p className="text-ink-600 leading-relaxed">
          FCL (Full Container Load) znači da unajmljujete cijeli kontejner — isplativo za pošiljke iznad 10–15 CBM. LCL (Less than Container Load) je grupni utovar — vaša roba dijeli kontejner s drugom robom, što je bolje za manje pošiljke. Import BiH procjenjuje koja opcija je isplativija za vaš konkretni zahtjev.
        </p>

        <h2 className="text-xl font-semibold text-ink-900">Šta je uključeno u uslugu?</h2>
        <ul className="space-y-2 text-ink-600">
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Pribavljanje ponuda od više provjerenih špeditera</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Preuzimanje robe od dobavljača u Kini (pickup)</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Izvozna carina i dokumentacija na kineskoj strani</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Praćenje pošiljke i obavještavanje o statusu</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Uvozna carina i PDV procedura u BiH</li>
          <li className="flex gap-2"><span className="text-brand-600 font-bold">→</span> Dostava na krajnju adresu u BiH</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink-900">Koliko košta transport?</h2>
        <p className="text-ink-600 leading-relaxed">
          Cijena transporta ovisi o težini i volumenu pošiljke, načinu transporta, polazištu u Kini i odredištu u BiH. Koristite naš kalkulator za okvirnu procjenu, ili pošaljite zahtjev i dobit ćete konkretnu ponudu.
        </p>

        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">Trebate organizovati pošiljku iz Kine?</p>
          <p className="text-sm text-ink-600 mb-4">Pošaljite zahtjev i dobit ćete ponudu za transport u roku od 24 sata.</p>
          <Link href="/register" className="btn-primary">Zatražite ponudu</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
