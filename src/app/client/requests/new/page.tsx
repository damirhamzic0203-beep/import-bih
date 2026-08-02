'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type TransportMode = 'SEA' | 'RAIL' | 'AIR' | 'ROAD';

const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  SEA: 'More (Sea Freight)',
  RAIL: 'Željeznica (Rail)',
  AIR: 'Avion (Air Freight)',
  ROAD: 'Kamion (Road)',
};

const STEP_LABELS = ['Proizvod', 'Količina', 'Dobavljač', 'Transport', 'Dostava', 'Kontakt'];

type FormData = {
  productName: string;
  productDescription: string;
  category: string;
  productImageUrl: string;
  quantity: string;
  unit: string;
  estimatedPrice: string;
  targetPrice: string;
  moq: string;
  hasOwnSupplier: boolean;
  originCity: string;
  originCountry: string;
  readyDate: string;
  estimatedWeightKg: string;
  estimatedCbm: string;
  packageCount: string;
  unknownWeightCbm: boolean;
  transportModes: TransportMode[];
  destinationCity: string;
  destinationAddress: string;
  destinationPostcode: string;
  doorToDoor: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  clientNote: string;
};

const INITIAL: FormData = {
  productName: '',
  productDescription: '',
  category: '',
  productImageUrl: '',
  quantity: '',
  unit: '',
  estimatedPrice: '',
  targetPrice: '',
  moq: '',
  hasOwnSupplier: false,
  originCity: '',
  originCountry: 'China',
  readyDate: '',
  estimatedWeightKg: '',
  estimatedCbm: '',
  packageCount: '',
  unknownWeightCbm: false,
  transportModes: [],
  destinationCity: '',
  destinationAddress: '',
  destinationPostcode: '',
  doorToDoor: false,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  clientNote: '',
};

type Setter = <K extends keyof FormData>(field: K, value: FormData[K]) => void;

function toNum(s: string): number | undefined {
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
}
function toInt(s: string): number | undefined {
  const n = parseInt(s, 10);
  return isNaN(n) ? undefined : n;
}
function orUndef(s: string): string | undefined {
  return s.trim() || undefined;
}

// ─── Step components ──────────────────────────────────────────────────────────

function Step1({ form, set }: { form: FormData; set: Setter }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-ink-900">Korak 1 — Proizvod</h2>

      {/* Info box */}
      <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
        Ne morate imati link ka proizvodu — samo nam recite šta trebate i pošaljite primjer
        slike ako imate. Mi ćemo pronaći i provjeriti odgovarajućeg dobavljača za vas.
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Naziv proizvoda <span className="text-red-500">*</span>
        </label>
        <input
          className="input-field"
          value={form.productName}
          onChange={(e) => set('productName', e.target.value)}
          placeholder="npr. USB punjač 65W GaN"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Opis / specifikacije</label>
        <textarea
          className="input-field min-h-[120px] resize-y"
          value={form.productDescription}
          onChange={(e) => set('productDescription', e.target.value)}
          placeholder="Opišite proizvod što detaljnije — materijal, veličina, boja, specifikacije, namjena, certifikati, posebni zahtjevi..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Kategorija</label>
        <input
          className="input-field"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          placeholder="npr. Elektronika, Tekstil, Građevinski materijal..."
        />
      </div>

      {/* Image URL — styled as upload zone */}
      {/* TODO: zamijeniti pravim file upload kad bude dostupan Cloudinary/S3 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-ink-700">
          Fotografija / primjer proizvoda
        </label>
        <div className="rounded-xl border-2 border-dashed border-ink-200 p-5 transition hover:border-brand-300">
          <div className="mb-3 flex flex-col items-center gap-1.5 text-center">
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-ink-300"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            <p className="text-sm font-medium text-ink-600">Zalijepite link slike proizvoda</p>
            <p className="text-xs text-ink-400">
              npr. sa Google slika, screenshot upload servisa, ili bilo kojeg izvora
            </p>
          </div>
          <input
            className="input-field"
            value={form.productImageUrl}
            onChange={(e) => {
              set('productImageUrl', e.target.value);
              setImgError(false);
            }}
            placeholder="https://"
          />
          {form.productImageUrl && !imgError && (
            <div className="mt-3">
              <img
                src={form.productImageUrl}
                alt="Pregled slike"
                className="max-h-48 w-full rounded-lg object-contain bg-ink-50"
                onError={() => setImgError(true)}
              />
            </div>
          )}
          {form.productImageUrl && imgError && (
            <p className="mt-2 text-xs text-red-500">
              Link slike nije ispravan ili slika nije dostupna.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Step2({ form, set }: { form: FormData; set: Setter }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-ink-900">Korak 2 — Količina i cijena</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Količina</label>
          <input
            type="number"
            className="input-field"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
            placeholder="npr. 500"
            min="1"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Jedinica</label>
          <input
            className="input-field"
            value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
            placeholder="komad, kg, set, karton..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Procijenjena cijena (EUR/kom)
          </label>
          <input
            type="number"
            className="input-field"
            value={form.estimatedPrice}
            onChange={(e) => set('estimatedPrice', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Ciljana cijena (EUR/kom)
          </label>
          <input
            type="number"
            className="input-field"
            value={form.targetPrice}
            onChange={(e) => set('targetPrice', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Minimalna narudžba dobavljača (MOQ)
        </label>
        <input
          type="number"
          className="input-field"
          value={form.moq}
          onChange={(e) => set('moq', e.target.value)}
          placeholder="npr. 100"
          min="1"
        />
      </div>
    </div>
  );
}

function Step3({ form, set }: { form: FormData; set: Setter }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-ink-900">Korak 3 — Dobavljač</h2>

      <div className="space-y-3">
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
            !form.hasOwnSupplier ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:bg-ink-50'
          }`}
        >
          <input
            type="radio"
            name="supplierOption"
            className="mt-0.5 h-4 w-4 accent-brand-600"
            checked={!form.hasOwnSupplier}
            onChange={() => set('hasOwnSupplier', false)}
          />
          <div>
            <p className="text-sm font-medium text-ink-800">
              Import BiH pronalazi dobavljača
            </p>
            <p className="text-xs text-ink-500">
              Naš tim pronalazi, provjerava i pregovara s dobavljačem u Kini
            </p>
          </div>
        </label>

        <label
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
            form.hasOwnSupplier ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:bg-ink-50'
          }`}
        >
          <input
            type="radio"
            name="supplierOption"
            className="mt-0.5 h-4 w-4 accent-brand-600"
            checked={form.hasOwnSupplier}
            onChange={() => set('hasOwnSupplier', true)}
          />
          <div>
            <p className="text-sm font-medium text-ink-800">Imam svog dobavljača</p>
            <p className="text-xs text-ink-500">
              Već imam dobavljača — trebam samo logistiku, carinu i dostavu
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

function Step4({
  form,
  set,
  toggleMode,
}: {
  form: FormData;
  set: Setter;
  toggleMode: (m: TransportMode) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-ink-900">Korak 4 — Transport</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Grad polaska (Kina)
          </label>
          <input
            className="input-field"
            value={form.originCity}
            onChange={(e) => set('originCity', e.target.value)}
            placeholder="npr. Shenzhen, Guangzhou"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Datum spremnosti robe
          </label>
          <input
            type="date"
            className="input-field"
            value={form.readyDate}
            onChange={(e) => set('readyDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink-700">Način transporta</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(TRANSPORT_MODE_LABELS) as [TransportMode, string][]).map(
            ([mode, label]) => (
              <label
                key={mode}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                  form.transportModes.includes(mode)
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-ink-200 text-ink-700 hover:bg-ink-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brand-600"
                  checked={form.transportModes.includes(mode)}
                  onChange={() => toggleMode(mode)}
                />
                {label}
              </label>
            )
          )}
        </div>
      </div>

      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
          form.unknownWeightCbm
            ? 'border-brand-400 bg-brand-50'
            : 'border-ink-200 hover:bg-ink-50'
        }`}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-brand-600"
          checked={form.unknownWeightCbm}
          onChange={(e) => set('unknownWeightCbm', e.target.checked)}
        />
        <div>
          <p className="text-sm font-medium text-ink-800">Ne znam težinu / volumen</p>
          <p className="text-xs text-ink-500">
            Naš tim će procijeniti na osnovu specifikacija proizvoda
          </p>
        </div>
      </label>

      {!form.unknownWeightCbm && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Težina (kg)</label>
            <input
              type="number"
              className="input-field"
              value={form.estimatedWeightKg}
              onChange={(e) => set('estimatedWeightKg', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Volumen (CBM)</label>
            <input
              type="number"
              className="input-field"
              value={form.estimatedCbm}
              onChange={(e) => set('estimatedCbm', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.001"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Broj paketa</label>
            <input
              type="number"
              className="input-field"
              value={form.packageCount}
              onChange={(e) => set('packageCount', e.target.value)}
              placeholder="1"
              min="1"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Step5({ form, set }: { form: FormData; set: Setter }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-ink-900">Korak 5 — Dostava</h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Grad dostave (BiH)</label>
        <input
          className="input-field"
          value={form.destinationCity}
          onChange={(e) => set('destinationCity', e.target.value)}
          placeholder="npr. Sarajevo, Banja Luka..."
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Adresa</label>
          <input
            className="input-field"
            value={form.destinationAddress}
            onChange={(e) => set('destinationAddress', e.target.value)}
            placeholder="Ulica i broj"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Poštanski broj</label>
          <input
            className="input-field"
            value={form.destinationPostcode}
            onChange={(e) => set('destinationPostcode', e.target.value)}
            placeholder="71000"
          />
        </div>
      </div>

      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
          form.doorToDoor ? 'border-brand-400 bg-brand-50' : 'border-ink-200 hover:bg-ink-50'
        }`}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-brand-600"
          checked={form.doorToDoor}
          onChange={(e) => set('doorToDoor', e.target.checked)}
        />
        <div>
          <p className="text-sm font-medium text-ink-800">Door-to-door dostava</p>
          <p className="text-xs text-ink-500">
            Dostava direktno na vašu adresu — carina i logistika u BiH uključeni
          </p>
        </div>
      </label>
    </div>
  );
}

function Step6({ form, set }: { form: FormData; set: Setter }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-ink-900">Korak 6 — Kontakt i napomene</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Kontakt osoba</label>
          <input
            className="input-field"
            value={form.contactName}
            onChange={(e) => set('contactName', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Telefon</label>
          <input
            className="input-field"
            value={form.contactPhone}
            onChange={(e) => set('contactPhone', e.target.value)}
            placeholder="+387..."
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Email za kontakt</label>
        <input
          type="email"
          className="input-field"
          value={form.contactEmail}
          onChange={(e) => set('contactEmail', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Napomena</label>
        <textarea
          className="input-field min-h-[100px] resize-y"
          value={form.clientNote}
          onChange={(e) => set('clientNote', e.target.value)}
          placeholder="Posebni zahtjevi, napomene za tim, pitanja..."
        />
      </div>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function NewRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleMode(mode: TransportMode) {
    setForm((f) => ({
      ...f,
      transportModes: f.transportModes.includes(mode)
        ? f.transportModes.filter((m) => m !== mode)
        : [...f.transportModes, mode],
    }));
  }

  function next() {
    if (step === 1 && !form.productName.trim()) {
      setError('Naziv proizvoda je obavezan.');
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const payload = {
      productName: form.productName,
      productDescription: orUndef(form.productDescription),
      category: orUndef(form.category),
      productImageUrl: orUndef(form.productImageUrl),
      // Sourcing is always provided by Import BiH — always true
      needsSourcingHelp: true,
      quantity: toInt(form.quantity),
      unit: orUndef(form.unit),
      estimatedPrice: toNum(form.estimatedPrice),
      targetPrice: toNum(form.targetPrice),
      moq: toInt(form.moq),
      hasOwnSupplier: form.hasOwnSupplier,
      originCity: orUndef(form.originCity),
      originCountry: form.originCountry || 'China',
      readyDate: form.readyDate || undefined,
      estimatedWeightKg: toNum(form.estimatedWeightKg),
      estimatedCbm: toNum(form.estimatedCbm),
      packageCount: toInt(form.packageCount),
      unknownWeightCbm: form.unknownWeightCbm,
      transportModes: form.transportModes,
      destinationCity: orUndef(form.destinationCity),
      destinationAddress: orUndef(form.destinationAddress),
      destinationPostcode: orUndef(form.destinationPostcode),
      doorToDoor: form.doorToDoor,
      contactName: orUndef(form.contactName),
      contactPhone: orUndef(form.contactPhone),
      contactEmail: orUndef(form.contactEmail),
      clientNote: orUndef(form.clientNote),
    };

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message ?? 'Došlo je do greške. Pokušajte ponovo.');
      return;
    }

    router.push(`/client/requests/${data.id}`);
  }

  const stepComponents = [
    <Step1 key="1" form={form} set={set} />,
    <Step2 key="2" form={form} set={set} />,
    <Step3 key="3" form={form} set={set} />,
    <Step4 key="4" form={form} set={set} toggleMode={toggleMode} />,
    <Step5 key="5" form={form} set={set} />,
    <Step6 key="6" form={form} set={set} />,
  ];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Novi zahtjev za uvoz</h1>
        <p className="mt-1 text-sm text-ink-500">
          Popunite korake ispod da zatražite uvoz robe iz Kine.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="mb-2 hidden justify-between text-[11px] text-ink-500 sm:flex">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={i + 1 === step ? 'font-semibold text-brand-700' : ''}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-200">
          <div
            className="h-1.5 rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-ink-400">Korak {step} od 6</p>
      </div>

      {/* Step content */}
      <div className="card p-6">
        {stepComponents[step - 1]}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-between border-t border-ink-100 pt-5">
          {step > 1 ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setError(null);
                setStep((s) => s - 1);
              }}
            >
              ← Nazad
            </button>
          ) : (
            <Link href="/client/requests" className="btn-secondary">
              Odustani
            </Link>
          )}

          {step < 6 ? (
            <button type="button" className="btn-primary" onClick={next}>
              Dalje →
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Kreiranje…' : 'Pošalji zahtjev'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
