import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'O nama — Import BiH',
  description:
    'Upoznajte Damira Hamzića, osnivača Import BiH — stručnjaka za uvoz iz Kine s višegodišnjim iskustvom na vodećim europskim e-commerce platformama.',
};

const WHY_US = [
  {
    num: '01',
    gradient: 'from-brand-600 to-brand-800',
    title: 'Dugogodišnje praktično iskustvo',
    body: 'Od 2018. aktivno u e-commerce industriji i uvozu iz Kine — svaka odluka temelji se na stotinama stvarnih narudžbi, ne na teoriji.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: '02',
    gradient: 'from-brand-500 to-brand-700',
    title: 'Vodeće evropske platforme',
    body: 'Rad na Cdiscount, Amazon, eBay i Rakuten formira standarde koji se primjenjuju i za vaš uvoz — od pakiranja do dokumentacije.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    num: '03',
    gradient: 'from-brand-700 to-brand-950',
    title: 'Direktni kontakti s kineskim tržištem',
    body: 'Provjereni dobavljači, iskustvo u pregovaranju i kontroli kvaliteta — znamo kako pronaći pravo rješenje za svaku kategoriju robe.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: '04',
    gradient: 'from-gold-600 to-brand-700',
    title: 'Lični pristup, ne call centar',
    body: 'Import BiH je mala, fokusirana firma. Svaki klijent komunicira direktno s osnivačem — bez posrednika i bez izgubljenih informacija.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function ONamaPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* ── HERO ── */}
        <section
          className="relative overflow-hidden py-20 md:py-28"
          style={{ background: 'linear-gradient(135deg, #04263a 0%, #0a4d70 50%, #063a56 100%)' }}
        >
          {/* ambient orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-6">
            <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:gap-14 md:text-left">
              {/* photo */}
              <div className="shrink-0">
                <div className="relative inline-block">
                  <Image
                    src="/images/damir-hamzic.jpg"
                    alt="Damir Hamzić, osnivač Import BiH"
                    width={220}
                    height={220}
                    className="rounded-2xl object-cover shadow-elevated ring-4 ring-brand-400/40"
                    priority
                  />
                  <div className="absolute -bottom-3 -right-3 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    Osnivač
                  </div>
                </div>
              </div>

              {/* headline */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-300">
                  O nama
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
                  Ko stoji iza Import BiH
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-200/80">
                  Više od šest godina rada na vodećim europskim e-commerce platformama — iskustvo
                  koje sada stavljamo na raspolaganje firmama i poduzetnicima u Bosni i
                  Hercegovini.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                  {['Cdiscount', 'Amazon', 'eBay', 'Rakuten'].map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STORY ── */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl space-y-6 px-6 text-base leading-relaxed text-ink-600">
            <p>
              Damir Hamzić počeo je svoju karijeru u e-commerce sektoru 2018. godine u Francuskoj,
              gdje je stekao iskustvo radeći na nekima od najvećih europskih online prodajnih
              platforma — Cdiscount, Amazon, eBay i Rakuten. Taj rad nije podrazumijevao samo
              prodaju: svaka narudžba pratila se od izvora do krajnjeg kupca, a Kina je bila — i
              ostala — centralna tačka u lancu snabdijevanja.
            </p>
            <p>
              Kroz višegodišnju svakodnevnu praksu izgrađeno je konkretno, operativno znanje o
              kineskom tržištu: kako pronaći pravog dobavljača, kako pregovarati o cijeni i uvjetima
              isporuke, kako organizovati kontrolu kvaliteta prije otpreme i koji transportni put
              odabrati ovisno o vrsti robe i rokovima. To nije znanje iz udžbenika — to je znanje
              stečeno rješavanjem stvarnih problema na stvarnim narudžbama, godinama unazad.
            </p>
            <p>
              Firma Isu Hamzić d.o.o. osnovana je 2026. godine u Srebreniku s jednim jasnim ciljem:
              da isto iskustvo i iste kontakte stavi na raspolaganje firmama i poduzetnicima u Bosni
              i Hercegovini. Mnogi žele uvoziti robu iz Kine, ali nemaju iskustvo, ne znaju gdje
              početi, ne govore jezik i ne znaju kome vjerovati. Import BiH popunjava tu prazninu —
              kao iskusni partner koji je prošao sve što vas čeka i koji zna kako to uraditi
              efikasno i bez nepotrebnih grešaka.
            </p>
            <p>
              Import BiH je namjerno mala i fokusirana firma. Svaki klijent komunicira direktno s
              osobom koja razumije njegov slučaj — bez birokratije, bez posrednika, bez izgubljenih
              poruka u velikom call centru. Taj lični pristup nije slabost male firme; to je naša
              prednost u odnosu na bezlične agencije.
            </p>
          </div>
        </section>

        {/* ── ZAŠTO RADITI S NAMA ── */}
        <section
          className="py-20"
          style={{ background: 'linear-gradient(180deg, #e6f4fa 0%, #ffffff 100%)' }}
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
                Prednosti
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
                Zašto raditi s nama
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_US.map((item, i) => (
                <div
                  key={item.num}
                  className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl${i % 2 === 1 ? ' lg:translate-y-4' : ''}`}
                >
                  {/* decorative number */}
                  <span className="pointer-events-none absolute right-4 top-3 select-none text-6xl font-black leading-none text-ink-100">
                    {item.num}
                  </span>

                  {/* animated bottom border */}
                  <div
                    className={`absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r ${item.gradient} transition-transform duration-300 group-hover:scale-x-100`}
                  />

                  {/* icon */}
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-md`}
                  >
                    {item.icon}
                  </div>

                  <h3 className="mb-2 font-bold text-ink-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="relative overflow-hidden py-24 text-center"
          style={{ background: 'linear-gradient(135deg, #04263a 0%, #0a4d70 50%, #1c92c9 100%)' }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-300">
              Počnimo zajedno
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Spremni da počnemo?
            </h2>
            <p className="mt-4 text-base text-brand-200/80">
              Pošaljite zahtjev i dobit ćete individualnu ponudu bez obaveze. Razgovarajmo o tome
              šta trebate uvesti.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-brand-800 shadow-lg transition duration-300 hover:bg-brand-50 hover:shadow-[0_0_40px_rgba(28,146,201,0.45)]"
              >
                Zatražite ponudu
              </Link>
              <Link
                href="/#kontakt"
                className="rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white/90 transition duration-300 hover:border-white/60 hover:bg-white/10"
              >
                Kontaktirajte nas
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
