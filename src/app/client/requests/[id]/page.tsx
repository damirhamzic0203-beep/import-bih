import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IMPORT_STATUS_LABELS, IMPORT_STATUS_COLORS, formatCurrency } from '@/lib/status';
import { StatusTimeline } from '@/components/status-timeline';
import { QuoteResponse } from '@/components/quote-response';
import { ShipmentTracker } from '@/components/shipment-tracker';
import { MessageForm } from '@/components/message-form';

const TRANSPORT_LABELS: Record<string, string> = {
  SEA: 'More',
  RAIL: 'Željeznica',
  AIR: 'Avion',
  ROAD: 'Kamion',
};

const QUOTE_STATUS_LABELS: Record<string, string> = {
  SENT: 'Čeka vaš odgovor',
  ACCEPTED: 'Prihvaćena',
  CHANGES_REQUESTED: 'Zatražene izmjene',
  DECLINED: 'Odbijena',
};

const QUOTE_STATUS_COLORS: Record<string, string> = {
  SENT: 'bg-brand-100 text-brand-800',
  ACCEPTED: 'bg-emerald-600 text-white',
  CHANGES_REQUESTED: 'bg-amber-100 text-amber-800',
  DECLINED: 'bg-red-100 text-red-700',
};

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 text-sm">
      <span className="w-32 shrink-0 text-ink-500 sm:w-44">{label}</span>
      <span className="min-w-0 break-words text-ink-900">{value ?? '—'}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-3 border-b border-ink-100 pb-2 text-sm font-semibold text-ink-700">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default async function ClientRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const request = await prisma.importRequest.findUnique({
    where: { id: params.id, clientId: session.user.id },
    include: {
      shipment: {
        include: {
          events: {
            select: { label: true, occurredAt: true },
            orderBy: { occurredAt: 'asc' },
          },
        },
      },
      documents: {
        where: { visibleToClient: true },
        select: { id: true, folder: true, fileName: true, fileUrl: true },
        orderBy: { uploadedAt: 'asc' },
      },
      messages: {
        where: { isInternal: false },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!request) notFound();

  // Fetch quote WITHOUT internalCost / grossProfit / marginPct
  const quote = await prisma.quote.findFirst({
    where: {
      importRequestId: params.id,
      importRequest: { clientId: session.user.id },
      status: { in: ['SENT', 'ACCEPTED', 'CHANGES_REQUESTED', 'DECLINED'] },
    },
    select: {
      id: true,
      code: true,
      status: true,
      productCost: true,
      logisticsCost: true,
      customsCost: true,
      deliveryCost: true,
      serviceCost: true,
      vatAmount: true,
      totalAmount: true,
      currency: true,
      validUntil: true,
      sentAt: true,
      // internalCost / grossProfit / marginPct intentionally excluded
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedQuote = quote
    ? {
        id: quote.id,
        code: quote.code,
        status: quote.status,
        productCost: quote.productCost?.toString() ?? null,
        logisticsCost: quote.logisticsCost?.toString() ?? null,
        customsCost: quote.customsCost?.toString() ?? null,
        deliveryCost: quote.deliveryCost?.toString() ?? null,
        serviceCost: quote.serviceCost?.toString() ?? null,
        vatAmount: quote.vatAmount?.toString() ?? null,
        totalAmount: quote.totalAmount?.toString() ?? null,
        currency: quote.currency,
        validUntil: quote.validUntil?.toLocaleDateString('bs-BA') ?? null,
        sentAt: quote.sentAt?.toLocaleDateString('bs-BA') ?? null,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">{request.code}</h1>
          <p className="mt-1 text-sm text-ink-500">
            Kreirano: {request.createdAt.toLocaleDateString('bs-BA')}
          </p>
        </div>
        <span className={`badge px-3 py-1 text-sm ${IMPORT_STATUS_COLORS[request.status]}`}>
          {IMPORT_STATUS_LABELS[request.status]}
        </span>
      </div>

      {/* Quote section — shown when sent to client */}
      {serializedQuote && (
        <div className="card p-5 border-2 border-brand-200">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-ink-900">Ponuda</h2>
              <span className="font-mono text-sm text-ink-500">{serializedQuote.code}</span>
              <span
                className={`badge ${
                  QUOTE_STATUS_COLORS[serializedQuote.status] ?? 'bg-ink-100 text-ink-700'
                }`}
              >
                {QUOTE_STATUS_LABELS[serializedQuote.status] ?? serializedQuote.status}
              </span>
            </div>
            {serializedQuote.totalAmount && (
              <span className="text-2xl font-bold text-ink-900">
                {formatCurrency(serializedQuote.totalAmount, serializedQuote.currency)}
              </span>
            )}
          </div>

          {/* Cost breakdown */}
          <div className="mb-5 rounded-lg bg-ink-50 divide-y divide-ink-100">
            {serializedQuote.productCost && (
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink-600">Trošak proizvoda</span>
                <span className="font-medium">
                  {formatCurrency(serializedQuote.productCost, serializedQuote.currency)}
                </span>
              </div>
            )}
            {serializedQuote.logisticsCost && (
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink-600">Logistika i transport</span>
                <span className="font-medium">
                  {formatCurrency(serializedQuote.logisticsCost, serializedQuote.currency)}
                </span>
              </div>
            )}
            {serializedQuote.customsCost && (
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink-600">Carina i špedicija</span>
                <span className="font-medium">
                  {formatCurrency(serializedQuote.customsCost, serializedQuote.currency)}
                </span>
              </div>
            )}
            {serializedQuote.deliveryCost && (
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink-600">Dostava</span>
                <span className="font-medium">
                  {formatCurrency(serializedQuote.deliveryCost, serializedQuote.currency)}
                </span>
              </div>
            )}
            {serializedQuote.serviceCost && (
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink-600">Usluga Import BiH</span>
                <span className="font-medium">
                  {formatCurrency(serializedQuote.serviceCost, serializedQuote.currency)}
                </span>
              </div>
            )}
            {serializedQuote.vatAmount && (
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink-600">PDV</span>
                <span className="font-medium">
                  {formatCurrency(serializedQuote.vatAmount, serializedQuote.currency)}
                </span>
              </div>
            )}
            {serializedQuote.totalAmount && (
              <div className="flex justify-between px-4 py-2 text-sm font-semibold bg-ink-100 rounded-b-lg">
                <span className="text-ink-900">UKUPNO</span>
                <span className="text-ink-900">
                  {formatCurrency(serializedQuote.totalAmount, serializedQuote.currency)}
                </span>
              </div>
            )}
          </div>

          {serializedQuote.validUntil && (
            <p className="text-xs text-ink-400 mb-4">
              Ponuda vrijedi do: {serializedQuote.validUntil}
            </p>
          )}

          {/* Response buttons only when SENT */}
          {serializedQuote.status === 'SENT' && (
            <QuoteResponse quoteId={serializedQuote.id} />
          )}

          {serializedQuote.status === 'ACCEPTED' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              ✓ Prihvatili ste ovu ponudu. Naš tim će vas kontaktirati s daljnjim koracima.
            </div>
          )}

          {serializedQuote.status === 'CHANGES_REQUESTED' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Zatražili ste izmjene ponude. Naš tim će vas kontaktirati.
            </div>
          )}

          {serializedQuote.status === 'DECLINED' && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              Odbili ste ovu ponudu.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-4 lg:col-span-2">
          <Card title="Proizvod">
            {request.productImageUrl ? (
              <div className="mb-4">
                <img
                  src={request.productImageUrl}
                  alt={request.productName}
                  className="h-48 w-full rounded-lg border border-ink-100 bg-ink-50 object-contain"
                />
              </div>
            ) : (
              <div className="mb-4 flex h-24 items-center justify-center rounded-lg border border-ink-100 bg-ink-50 text-ink-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
              </div>
            )}
            <Row label="Naziv" value={request.productName} />
            <Row label="Opis" value={request.productDescription} />
            <Row label="Kategorija" value={request.category} />
          </Card>

          <Card title="Količina i cijena">
            <Row
              label="Količina"
              value={
                request.quantity != null
                  ? `${request.quantity} ${request.unit ?? ''}`
                  : undefined
              }
            />
            <Row
              label="Procijenjena cijena"
              value={formatCurrency(request.estimatedPrice?.toString())}
            />
            <Row
              label="Ciljana cijena"
              value={formatCurrency(request.targetPrice?.toString())}
            />
            <Row
              label="MOQ"
              value={request.moq != null ? `${request.moq} kom` : undefined}
            />
          </Card>

          <Card title="Transport">
            <Row label="Grad polaska" value={request.originCity} />
            <Row label="Zemlja polaska" value={request.originCountry} />
            <Row
              label="Datum spremnosti"
              value={request.readyDate?.toLocaleDateString('bs-BA')}
            />
            <Row
              label="Težina (kg)"
              value={request.estimatedWeightKg?.toString()}
            />
            <Row label="Volumen (CBM)" value={request.estimatedCbm?.toString()} />
            <Row
              label="Broj paketa"
              value={request.packageCount != null ? String(request.packageCount) : undefined}
            />
            <Row
              label="Način transporta"
              value={
                request.transportModes.length > 0
                  ? request.transportModes
                      .map((m) => TRANSPORT_LABELS[m] ?? m)
                      .join(', ')
                  : undefined
              }
            />
          </Card>

          <Card title="Dostava">
            <Row label="Grad" value={request.destinationCity} />
            <Row label="Adresa" value={request.destinationAddress} />
            <Row label="Poštanski broj" value={request.destinationPostcode} />
            <Row label="Door-to-door" value={request.doorToDoor ? 'Da' : 'Ne'} />
          </Card>

          <Card title="Kontakt">
            <Row label="Kontakt osoba" value={request.contactName} />
            <Row label="Telefon" value={request.contactPhone} />
            <Row label="Email" value={request.contactEmail} />
            <Row label="Napomena" value={request.clientNote} />
          </Card>
        </div>

        {/* Sidebar: timeline */}
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-700">Status zahtjeva</h2>
          <StatusTimeline currentStatus={request.status} />
        </div>
      </div>

      {/* Shipment tracking */}
      {request.shipment && (
        <div className="card p-5">
          <h2 className="mb-4 text-base font-semibold text-ink-900">Praćenje pošiljke</h2>

          {(request.shipment.carrier ||
            request.shipment.trackingNumber ||
            request.shipment.etd ||
            request.shipment.eta) && (
            <div className="mb-5 rounded-lg bg-ink-50 px-4 py-3 text-sm space-y-1.5">
              {request.shipment.carrier && (
                <p>
                  <span className="text-ink-500">Prijevoznik:</span>{' '}
                  <span className="font-medium">{request.shipment.carrier}</span>
                </p>
              )}
              {request.shipment.trackingNumber && (
                <p>
                  <span className="text-ink-500">Tracking:</span>{' '}
                  <span className="font-medium font-mono">{request.shipment.trackingNumber}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-x-5">
                {request.shipment.etd && (
                  <p>
                    <span className="text-ink-500">ETD:</span>{' '}
                    <span className="font-medium">
                      {request.shipment.etd.toLocaleDateString('bs-BA')}
                    </span>
                  </p>
                )}
                {request.shipment.eta && (
                  <p>
                    <span className="text-ink-500">ETA:</span>{' '}
                    <span className="font-medium">
                      {request.shipment.eta.toLocaleDateString('bs-BA')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          <ShipmentTracker
            eventLabels={request.shipment.events.map((e) => e.label)}
            currentStatus={request.status}
          />
        </div>
      )}

      {/* Documents */}
      {request.documents.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-4 text-base font-semibold text-ink-900">Dokumenti</h2>
          {(() => {
            const byFolder: Record<string, typeof request.documents> = {};
            for (const doc of request.documents) {
              if (!byFolder[doc.folder]) byFolder[doc.folder] = [];
              byFolder[doc.folder].push(doc);
            }
            return Object.entries(byFolder)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([folder, docs]) => (
                <div key={folder} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
                    {folder}
                  </p>
                  <div className="space-y-1.5">
                    {docs.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-brand-700 hover:bg-ink-100"
                      >
                        <span>📄</span>
                        <span className="hover:underline">{doc.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ));
          })()}
        </div>
      )}

      {/* Poruke */}
      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-ink-900">Poruke</h2>

        {request.messages.length === 0 ? (
          <p className="mb-5 text-sm text-ink-400">
            Nema poruka. Pošaljite poruku timu Import BiH.
          </p>
        ) : (
          <div className="mb-5 space-y-2">
            {request.messages.map((msg) => {
              const isFromStaff = msg.sender.role !== 'CLIENT';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isFromStaff ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isFromStaff
                        ? 'bg-ink-100 text-ink-900'
                        : 'bg-brand-600 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <p
                      className={`mt-1 text-xs ${
                        isFromStaff ? 'text-ink-500' : 'text-brand-200'
                      }`}
                    >
                      {isFromStaff ? 'Import BiH' : 'Vi'} ·{' '}
                      {msg.createdAt.toLocaleDateString('bs-BA')}{' '}
                      {msg.createdAt.toLocaleTimeString('bs-BA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={request.messages.length > 0 ? 'border-t border-ink-100 pt-4' : ''}>
          <MessageForm importRequestId={request.id} />
        </div>
      </div>
    </div>
  );
}
