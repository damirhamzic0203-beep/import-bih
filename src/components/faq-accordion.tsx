'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'Kako mogu uvesti robu iz Kine?',
    a: 'Jednostavno popunite zahtjev na našoj platformi sa opisom robe i željenim količinama. Naš tim preuzima cijeli proces: pronalaženje dobavljača, pregovore, transport i carinu — sve do dostave robe na vašu adresu.',
  },
  {
    q: 'Da li možete pronaći dobavljača?',
    a: 'Da, pronalaženje dobavljača je jedna od naših osnovnih usluga. Naš sourcing tim istražuje Alibaba, 1688.com i Made-in-China, provjera kandidate i predlaže vam najpouzdanije opcije s najboljim cijenama.',
  },
  {
    q: 'Da li provjeravate dobavljače?',
    a: 'Svaki dobavljač s kojim sarađujemo prolazi kroz našu internu provjeru: registracija firme, historija rada, uzorci i/ili referentni uvozi. Potencijalni problem otkrivamo prije nego što platite robu.',
  },
  {
    q: 'Koji transport koristite?',
    a: 'Radimo s morskim kontejnerskim prijevozom (FCL i LCL), željezničkim koridorima (Kina–Europa), air freightom i cestovnim transportom — ovisno o roku, težini i budžetu vaše pošiljke. Predložit ćemo najpovoljniju kombinaciju.',
  },
  {
    q: 'Koliko traje transport?',
    a: 'Morski transport tipično traje 30–45 dana, željeznica 18–25 dana, a air freight 5–10 radnih dana. Tačno vrijeme ovisi o polazištu u Kini, odredištu u BiH i odabranom načinu prijevoza.',
  },
  {
    q: 'Da li radite door-to-door?',
    a: 'Da, nudimo kompletnu door-to-door uslugu: preuzimanje robe od dobavljača u Kini, pretovar, carinjenje u BiH i isporuku direktno na vašu adresu ili u vaše skladište.',
  },
  {
    q: 'Da li organizujete carinu?',
    a: 'Da, carinska procedura je sastavni dio naše usluge. Sarađujemo s licenciranim carinskim agentima u BiH koji se brinu o svim dokumentima, PDV-om i carinskim dažbinama u skladu s važećim propisima.',
  },
  {
    q: 'Da li mogu poslati Alibaba link?',
    a: 'Naravno — u zahtjevu možete priložiti direktan link s Alibaba, 1688.com ili druge platforme. Na osnovu linka identificiramo tačan proizvod, kontaktiramo dobavljača i pregovaramo uvjete isporuke u vaše ime.',
  },
  {
    q: 'Da li možete kontrolisati robu prije slanja?',
    a: 'Da, nudimo uslugu kontrole kvaliteta (QC inspekcija) u kineskom skladištu dobavljača prije nego roba krene na put. Inspekcija uključuje provjeru uzoraka, pakovanja i označavanja prema vašim specifikacijama.',
  },
  {
    q: 'Koliko košta vaša usluga?',
    a: 'Naša naknada ovisi o vrsti robe, količini, načinu transporta i opsegu usluga (samo sourcing, samo transport, ili full-service). Nakon što pošaljete zahtjev, dobijate individualnu ponudu — bez skrivenih troškova.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-ink-200">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between py-5 text-left"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="text-base font-medium text-ink-900">{item.q}</span>
            <span className="ml-4 shrink-0 text-ink-400 text-xl leading-none">
              {openIndex === i ? '−' : '+'}
            </span>
          </button>
          {openIndex === i && (
            <p className="pb-5 text-sm leading-relaxed text-ink-600">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
