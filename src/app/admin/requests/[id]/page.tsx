import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  IMPORT_STATUS_LABELS,
  IMPORT_STATUS_COLORS,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_STATUS_COLORS,
  formatCurrency,
} from '@/lib/status';
import { StatusTimeline } from '@/components/status-timeline';
import { StatusChangeForm } from '@/components/status-change-form';
import { InternalNoteForm } from '@/components/internal-note-form';
import { TaskCheckbox } from '@/components/task-checkbox';
import { TaskForm } from '@/components/task-form';
import { TransportRequestForm } from '@/components/transport-request-form';
import { ForwarderSelect } from '@/components/forwarder-select';
import { ForwarderQuoteForm } from '@/components/forwarder-quote-form';
import { ForwarderQuotesTable } from '@/components/forwarder-quotes-table';
import { SupplierQuoteForm } from '@/components/supplier-quote-form';
import { LandedCostCalculator } from '@/components/landed-cost-calculator';
import { QuoteForm } from '@/components/quote-form';
import { QuoteSendButton } from '@/components/quote-send-button';
import { ShipmentForm } from '@/components/shipment-form';
import { ShipmentEventForm } from '@/components/shipment-event-form';
import { DocumentForm } from '@/components/document-form';
import { DeleteDocumentButton } from '@/components/document-delete-button';
import { MessageForm } from '@/components/message-form';
import { InvoiceForm } from '@/components/invoice-form';
import { SupplierAssignForm } from '@/components/supplier-assign-form';
import { HsCodeAssignForm } from '@/components/hs-code-assign-form';

const TRANSPORT_LABELS: Record<string, string> = {
  SEA: 'More',
  RAIL: 'Željeznica',
  AIR: 'Avion',
  ROAD: 'Kamion',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Nizak',
  MEDIUM: 'Srednji',
  HIGH: 'Visok',
  URGENT: 'Hitan',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-ink-100 text-ink-600',
  MEDIUM: 'bg-brand-100 text-brand-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
};

const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nacrt',
  SENT: 'Poslana klijentu',
  ACCEPTED: 'Prihvaćena',
  CHANGES_REQUESTED: 'Zatražene izmjene',
  DECLINED: 'Odbijena',
  EXPIRED: 'Istekla',
};

const QUOTE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-ink-100 text-ink-700',
  SENT: 'bg-brand-100 text-brand-800',
  ACCEPTED: 'bg-emerald-600 text-white',
  CHANGES_REQUESTED: 'bg-amber-100 text-amber-800',
  DECLINED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-ink-200 text-ink-500',
};

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 text-sm">
      <span className="w-48 shrink-0 text-ink-500">{label}</span>
      <span className="text-ink-900">{value ?? '—'}</span>
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

export default async function AdminRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const request = await prisma.importRequest.findUnique({
    where: { id: params.id },
    include: {
      client: { include: { company: true } },
      tasks: {
        include: { assignedTo: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      internalNotes: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      transportRequests: {
        include: {
          recipients: {
            include: {
              forwarder: { select: { id: true, companyName: true } },
            },
            orderBy: { sentAt: 'asc' },
          },
          forwarderQuotes: {
            include: {
              forwarder: { select: { id: true, companyName: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      supplier: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          phone: true,
          email: true,
          status: true,
          verificationScore: true,
        },
      },
      supplierQuotes: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      quotes: {
        include: {
          versions: {
            include: { changedBy: { select: { name: true } } },
            orderBy: { versionNo: 'asc' },
          },
          order: {
            include: {
              invoices: { select: { id: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      shipment: {
        include: {
          events: { orderBy: { occurredAt: 'desc' } },
        },
      },
      documents: { orderBy: { uploadedAt: 'desc' } },
      messages: {
        where: { isInternal: false },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      hsCode: true,
    },
  });

  if (!request) notFound();

  const [allForwarders, allSuppliers, allHsCodes] = await Promise.all([
    prisma.forwarder.findMany({
      select: {
        id: true,
        companyName: true,
        supportsSea: true,
        supportsRail: true,
        supportsAir: true,
        supportsRoad: true,
      },
      orderBy: { companyName: 'asc' },
    }),
    prisma.supplier.findMany({
      select: { id: true, companyName: true, status: true },
      orderBy: { companyName: 'asc' },
    }),
    prisma.hsCode.findMany({
      select: { id: true, code: true, description: true, dutyRate: true },
      orderBy: { code: 'asc' },
    }),
  ]);

  const transportRequest = request.transportRequests[0] ?? null;

  const serializedQuotes =
    transportRequest?.forwarderQuotes
      .slice()
      .sort((a, b) => {
        const aTotal = a.totalCost ? parseFloat(a.totalCost.toString()) : Infinity;
        const bTotal = b.totalCost ? parseFloat(b.totalCost.toString()) : Infinity;
        return aTotal - bTotal;
      })
      .map((q) => ({
        id: q.id,
        forwarderName: q.forwarder.companyName,
        freightCost: q.freightCost?.toString() ?? null,
        customsCost: q.customsCost?.toString() ?? null,
        deliveryCost: q.deliveryCost?.toString() ?? null,
        totalCost: q.totalCost?.toString() ?? null,
        transitDays: q.transitDays,
        validUntil: q.validUntil?.toISOString() ?? null,
        isRecommended: q.isRecommended,
        recommendReason: q.recommendReason,
        isSelected: q.isSelected,
        currency: q.currency,
      })) ?? [];

  const selectedForwarderQuote =
    transportRequest?.forwarderQuotes.find((q) => q.isSelected) ?? null;
  const latestSupplierQuote = request.supplierQuotes[0] ?? null;
  const existingQuote = request.quotes[0] ?? null;

  const serializedExistingQuote = existingQuote
    ? {
        id: existingQuote.id,
        code: existingQuote.code,
        status: existingQuote.status,
        productCost: existingQuote.productCost?.toString() ?? '',
        logisticsCost: existingQuote.logisticsCost?.toString() ?? '',
        customsCost: existingQuote.customsCost?.toString() ?? '',
        deliveryCost: existingQuote.deliveryCost?.toString() ?? '',
        serviceCost: existingQuote.serviceCost?.toString() ?? '',
        vatAmount: existingQuote.vatAmount?.toString() ?? '',
        totalAmount: existingQuote.totalAmount?.toString() ?? null,
        internalCost: existingQuote.internalCost?.toString() ?? '',
        grossProfit: existingQuote.grossProfit?.toString() ?? null,
        marginPct: existingQuote.marginPct?.toString() ?? null,
        currency: existingQuote.currency,
        validUntil: existingQuote.validUntil?.toISOString().split('T')[0] ?? '',
        sentAt: existingQuote.sentAt?.toLocaleDateString('bs-BA') ?? null,
        order: existingQuote.order
          ? { id: existingQuote.order.id, hasInvoice: existingQuote.order.invoices.length > 0 }
          : null,
        versions: existingQuote.versions.map((v) => ({
          versionNo: v.versionNo,
          changedByName: v.changedBy.name,
          createdAt: v.createdAt.toLocaleDateString('bs-BA'),
          createdAtTime: v.createdAt.toLocaleTimeString('bs-BA', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          changeNote: v.changeNote,
        })),
      }
    : null;

  const SHIPMENT_ELIGIBLE_STATUSES = [
    'ORDER_CONFIRMED', 'GOODS_READY', 'IN_TRANSIT',
    'CUSTOMS', 'DELIVERY', 'COMPLETED',
  ];
  const shipmentEligible = SHIPMENT_ELIGIBLE_STATUSES.includes(request.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">{request.code}</h1>
          <p className="mt-1 text-sm text-ink-500">
            Kreirano: {request.createdAt.toLocaleDateString('bs-BA')} · Ažurirano:{' '}
            {request.updatedAt.toLocaleDateString('bs-BA')}
          </p>
        </div>
        <span className={`badge px-3 py-1 text-sm ${IMPORT_STATUS_COLORS[request.status]}`}>
          {IMPORT_STATUS_LABELS[request.status]}
        </span>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: detail cards */}
        <div className="space-y-4 lg:col-span-2">
          <Card title="Klijent">
            <Row label="Ime i prezime" value={request.client.name} />
            <Row label="Email" value={request.client.email} />
            <Row label="Telefon" value={request.client.phone} />
            <Row label="Firma" value={request.client.company?.name} />
            <Row label="JIB" value={request.client.company?.taxId} />
            <Row label="Adresa" value={request.client.company?.address} />
            <Row label="Grad" value={request.client.company?.city} />
          </Card>

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

          <Card title="Dobavljač">
            <Row
              label="Ima vlastitog dobavljača"
              value={request.hasOwnSupplier ? 'Da' : 'Ne — Import BiH pronalazi'}
            />
            <Row
              label="Dodijeljeni dobavljač"
              value={
                request.supplier ? (
                  <Link
                    href={`/admin/suppliers/${request.supplier.id}`}
                    className="text-brand-700 hover:underline"
                  >
                    {request.supplier.companyName}
                  </Link>
                ) : (
                  <span className="italic text-ink-400">Nije dodijeljen</span>
                )
              }
            />
          </Card>

          <Card title="Transport">
            <Row label="Grad polaska" value={request.originCity} />
            <Row label="Zemlja polaska" value={request.originCountry} />
            <Row
              label="Datum spremnosti"
              value={request.readyDate?.toLocaleDateString('bs-BA')}
            />
            <Row label="Težina (kg)" value={request.estimatedWeightKg?.toString()} />
            <Row label="Volumen (CBM)" value={request.estimatedCbm?.toString()} />
            <Row
              label="Broj paketa"
              value={
                request.packageCount != null ? String(request.packageCount) : undefined
              }
            />
            <Row
              label="Nepoznata težina/volumen"
              value={request.unknownWeightCbm ? 'Da' : 'Ne'}
            />
            <Row
              label="Način transporta"
              value={
                request.transportModes.length > 0
                  ? request.transportModes.map((m) => TRANSPORT_LABELS[m] ?? m).join(', ')
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
            <Row label="Napomena klijenta" value={request.clientNote} />
          </Card>
        </div>

        {/* Right: timeline + status change */}
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-700">Status zahtjeva</h2>
          <StatusTimeline currentStatus={request.status} />
          <StatusChangeForm
            importRequestId={request.id}
            currentStatus={request.status}
          />
        </div>
      </div>

      {/* ── Tasks ── */}
      <div className="card p-5">
        <h2 className="mb-5 text-base font-semibold text-ink-900">
          Taskovi
          <span className="ml-2 text-sm font-normal text-ink-400">
            ({request.tasks.length})
          </span>
        </h2>

        {request.tasks.length > 0 && (
          <div className="mb-6 divide-y divide-ink-100">
            {request.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-3">
                <TaskCheckbox
                  taskId={task.id}
                  isDone={task.status === 'DONE'}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      task.status === 'DONE'
                        ? 'text-ink-400 line-through'
                        : 'text-ink-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  {(task.deadline || task.assignedTo) && (
                    <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-ink-500">
                      {task.deadline && (
                        <span>Rok: {task.deadline.toLocaleDateString('bs-BA')}</span>
                      )}
                      {task.assignedTo && (
                        <span>Dodijeljeno: {task.assignedTo.name}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className={`badge shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className={request.tasks.length > 0 ? 'border-t border-ink-100 pt-5' : ''}>
          <p className="mb-3 text-sm font-medium text-ink-700">Dodaj novi task</p>
          <TaskForm importRequestId={request.id} />
        </div>
      </div>

      {/* ── Internal Notes ── */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Interne bilješke</h2>
        <p className="mb-5 text-xs text-ink-400">Vidljivo samo staff-u — klijent ne vidi ove bilješke</p>

        <div className="mb-6 space-y-3">
          {request.internalNotes.length === 0 ? (
            <p className="text-sm text-ink-400">Nema internih bilješki za ovaj zahtjev.</p>
          ) : (
            request.internalNotes.map((note) => (
              <div key={note.id} className="rounded-lg bg-ink-50 p-4">
                <p className="whitespace-pre-wrap text-sm text-ink-800">{note.body}</p>
                <p className="mt-2 text-xs text-ink-400">
                  {note.author.name} ·{' '}
                  {note.createdAt.toLocaleDateString('bs-BA')}{' '}
                  u{' '}
                  {note.createdAt.toLocaleTimeString('bs-BA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-ink-100 pt-5">
          <InternalNoteForm importRequestId={request.id} />
        </div>
      </div>

      {/* ── Dodjela dobavljača ── */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Dobavljač</h2>
        <p className="mb-4 text-xs text-ink-400">
          Povežite zahtjev sa Supplier zapisom iz CRM-a kako bi Trošak dobavljača bio dostupan.
        </p>

        {/* Context note when client indicated they already have a supplier */}
        {request.hasOwnSupplier && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-800">
              Napomena klijenta o dobavljaču:
            </p>
            <p className="mt-0.5 text-sm text-amber-700">
              Klijent je naveo da već ima dobavljača i treba samo logistiku, carinu i dostavu.
              Dodijelite odgovarajući Supplier zapis ili kreirajte novi na osnovu klijentovih
              informacija.
            </p>
          </div>
        )}

        {request.supplierId && request.supplier ? (
          <>
            {/* Assigned supplier summary */}
            <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-4 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink-900">
                    {request.supplier.companyName}
                  </span>
                  <span
                    className={`badge ${
                      SUPPLIER_STATUS_COLORS[request.supplier.status] ??
                      'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {SUPPLIER_STATUS_LABELS[request.supplier.status] ??
                      request.supplier.status}
                  </span>
                </div>
                <Link
                  href={`/admin/suppliers/${request.supplier.id}`}
                  className="text-sm text-brand-600 hover:underline"
                >
                  Vidi profil →
                </Link>
              </div>

              {(request.supplier.contactPerson ||
                request.supplier.phone ||
                request.supplier.email) && (
                <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-ink-600">
                  {request.supplier.contactPerson && (
                    <span>Kontakt: {request.supplier.contactPerson}</span>
                  )}
                  {request.supplier.phone && <span>📞 {request.supplier.phone}</span>}
                  {request.supplier.email && <span>✉ {request.supplier.email}</span>}
                </div>
              )}

              {request.supplier.verificationScore !== null && (
                <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
                  <span>Verifikacija:</span>
                  <div className="h-1.5 w-28 rounded-full bg-ink-200">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${request.supplier.verificationScore}%` }}
                    />
                  </div>
                  <span>{request.supplier.verificationScore}%</span>
                </div>
              )}
            </div>

            <SupplierAssignForm
              importRequestId={request.id}
              suppliers={allSuppliers}
              currentSupplierId={request.supplierId}
            />
          </>
        ) : (
          <SupplierAssignForm
            importRequestId={request.id}
            suppliers={allSuppliers}
          />
        )}
      </div>

      {/* ── Trošak dobavljača ── */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Trošak dobavljača</h2>
        <p className="mb-5 text-xs text-ink-400">Interno — klijent ne vidi</p>

        {!request.supplierId ? (
          <p className="text-sm text-ink-400 italic">
            Zahtjev nema odabranog dobavljača — prvo dodijelite dobavljača.
          </p>
        ) : (
          <>
            {latestSupplierQuote && (
              <div className="mb-5 rounded-lg bg-ink-50 border border-ink-200 px-4 py-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-ink-800">
                    Dobavljač: {request.supplier?.companyName}
                  </span>
                  {latestSupplierQuote.supplierTotal && (
                    <span className="font-bold text-ink-900">
                      {parseFloat(latestSupplierQuote.supplierTotal.toString()).toLocaleString('bs-BA', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      {latestSupplierQuote.currency}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-500">
                  {latestSupplierQuote.unitPrice && (
                    <span>Cijena/kom: {latestSupplierQuote.unitPrice.toString()}</span>
                  )}
                  {latestSupplierQuote.quantity && (
                    <span>Kol: {latestSupplierQuote.quantity}</span>
                  )}
                </div>
              </div>
            )}
            <div className={latestSupplierQuote ? 'border-t border-ink-100 pt-4' : ''}>
              {latestSupplierQuote && (
                <p className="mb-3 text-sm font-medium text-ink-700">Dodaj novi trošak</p>
              )}
              <SupplierQuoteForm importRequestId={request.id} />
            </div>
          </>
        )}
      </div>

      {/* ── Transport upit ── */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Transport upit</h2>
        <p className="mb-5 text-xs text-ink-400">
          Interno — klijent ne vidi ovaj modul za sada
        </p>

        {!transportRequest ? (
          <TransportRequestForm
            importRequestId={request.id}
            defaultOriginCity={request.originCity ?? undefined}
            defaultDestinationCity={request.destinationCity ?? undefined}
            defaultWeightKg={request.estimatedWeightKg?.toString() ?? undefined}
            defaultVolumeCbm={request.estimatedCbm?.toString() ?? undefined}
          />
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-lg bg-ink-50 border border-ink-200 px-4 py-3 text-sm space-y-1">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-ink-700">
                {transportRequest.originCity && (
                  <span>
                    <span className="text-ink-500">Polazak:</span>{' '}
                    {transportRequest.originCity}
                  </span>
                )}
                {transportRequest.destinationCity && (
                  <span>
                    <span className="text-ink-500">Odredište:</span>{' '}
                    {transportRequest.destinationCity}
                  </span>
                )}
                {transportRequest.weightKg && (
                  <span>
                    <span className="text-ink-500">Težina:</span>{' '}
                    {transportRequest.weightKg.toString()} kg
                  </span>
                )}
                {transportRequest.volumeCbm && (
                  <span>
                    <span className="text-ink-500">Volumen:</span>{' '}
                    {transportRequest.volumeCbm.toString()} CBM
                  </span>
                )}
                {transportRequest.requestedModes.length > 0 && (
                  <span>
                    <span className="text-ink-500">Načini:</span>{' '}
                    {transportRequest.requestedModes
                      .map((m) => TRANSPORT_LABELS[m] ?? m)
                      .join(', ')}
                  </span>
                )}
              </div>
              {transportRequest.sentAt && (
                <p className="text-ink-500 text-xs">
                  Upit prvi put poslan:{' '}
                  {transportRequest.sentAt.toLocaleDateString('bs-BA')}
                </p>
              )}
            </div>

            {/* Already sent */}
            {transportRequest.recipients.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink-700">
                  Poslano transporterima:
                </p>
                <div className="flex flex-wrap gap-2">
                  {transportRequest.recipients.map((r) => (
                    <span
                      key={r.id}
                      className="badge bg-emerald-100 text-emerald-800"
                    >
                      ✓ {r.forwarder.companyName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Send to forwarders */}
            {allForwarders.length > 0 && (
              <ForwarderSelect
                transportRequestId={transportRequest.id}
                requestedModes={transportRequest.requestedModes}
                forwarders={allForwarders}
                alreadySentIds={transportRequest.recipients.map((r) => r.forwarderId)}
              />
            )}

            {/* Add quote */}
            {transportRequest.recipients.length > 0 && (
              <>
                <div className="border-t border-ink-100" />
                <div>
                  <p className="mb-3 text-sm font-medium text-ink-700">
                    Dodaj ponudu transportera
                  </p>
                  <ForwarderQuoteForm
                    transportRequestId={transportRequest.id}
                    recipients={transportRequest.recipients.map((r) => ({
                      forwarderId: r.forwarderId,
                      forwarderName: r.forwarder.companyName,
                    }))}
                  />
                </div>
              </>
            )}

            {/* Quotes comparison */}
            {serializedQuotes.length > 0 && (
              <>
                <div className="border-t border-ink-100" />
                <div>
                  <p className="mb-3 text-sm font-medium text-ink-700">
                    Poređenje ponuda ({serializedQuotes.length})
                  </p>
                  <ForwarderQuotesTable quotes={serializedQuotes} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── HS kod / Carinska klasifikacija ── */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">HS kod / Carinska klasifikacija</h2>
        <p className="mb-4 text-xs text-ink-400">
          Dodijelite harmonizovanu tarifnu oznaku kako bi kalkulator mogao procijeniti carinsku stopu.
          Stopa se uzima iz interne baze i primjenjuje se samo kao procjena.
        </p>
        <HsCodeAssignForm
          importRequestId={request.id}
          hsCodes={allHsCodes.map((c) => ({
            id: c.id,
            code: c.code,
            description: c.description,
            dutyRate: c.dutyRate.toString(),
          }))}
          currentHsCode={
            request.hsCode
              ? {
                  id: request.hsCode.id,
                  code: request.hsCode.code,
                  description: request.hsCode.description,
                  dutyRate: request.hsCode.dutyRate.toString(),
                  source: request.hsCode.source,
                  notes: request.hsCode.notes,
                }
              : null
          }
        />
      </div>

      {/* ── Landed Cost ── */}
      {latestSupplierQuote && (
        <div className="card p-5">
          <h2 className="mb-1 text-base font-semibold text-ink-900">Landed Cost kalkulator</h2>
          <p className="mb-5 text-xs text-ink-400">Interno — okvirni prikaz ukupnih troškova</p>
          <LandedCostCalculator
            supplierTotal={latestSupplierQuote.supplierTotal?.toString() ?? null}
            freightCost={selectedForwarderQuote?.freightCost?.toString() ?? null}
            forwarderCustomsCost={selectedForwarderQuote?.customsCost?.toString() ?? null}
            deliveryCost={selectedForwarderQuote?.deliveryCost?.toString() ?? null}
            pickupCost={selectedForwarderQuote?.pickupCost?.toString() ?? null}
            insuranceCost={selectedForwarderQuote?.insuranceCost?.toString() ?? null}
            otherFees={selectedForwarderQuote?.otherFees?.toString() ?? null}
            hasSelectedQuote={!!selectedForwarderQuote}
            currency={latestSupplierQuote.currency}
            hsCode={
              request.hsCode
                ? { code: request.hsCode.code, dutyRate: request.hsCode.dutyRate.toString() }
                : null
            }
          />
        </div>
      )}

      {/* ── Ponuda za klijenta ── */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Ponuda za klijenta</h2>

        {serializedExistingQuote ? (
          <div className="space-y-6">
            {/* Quote summary */}
            <div className="rounded-lg bg-ink-50 border border-ink-200 px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink-900 text-lg">
                    {serializedExistingQuote.code}
                  </span>
                  <span className={`badge ${QUOTE_STATUS_COLORS[serializedExistingQuote.status]}`}>
                    {QUOTE_STATUS_LABELS[serializedExistingQuote.status] ?? serializedExistingQuote.status}
                  </span>
                </div>
                {serializedExistingQuote.totalAmount && (
                  <span className="text-xl font-bold text-ink-900">
                    {parseFloat(serializedExistingQuote.totalAmount).toLocaleString('bs-BA', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    {serializedExistingQuote.currency}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                {serializedExistingQuote.productCost && (
                  <div>
                    <span className="text-ink-500">Proizvod</span>
                    <p className="font-medium">
                      {parseFloat(serializedExistingQuote.productCost).toLocaleString('bs-BA', { minimumFractionDigits: 2 })}{' '}
                      {serializedExistingQuote.currency}
                    </p>
                  </div>
                )}
                {serializedExistingQuote.logisticsCost && (
                  <div>
                    <span className="text-ink-500">Logistika</span>
                    <p className="font-medium">
                      {parseFloat(serializedExistingQuote.logisticsCost).toLocaleString('bs-BA', { minimumFractionDigits: 2 })}{' '}
                      {serializedExistingQuote.currency}
                    </p>
                  </div>
                )}
                {serializedExistingQuote.validUntil && (
                  <div>
                    <span className="text-ink-500">Vrijedi do</span>
                    <p className="font-medium">{serializedExistingQuote.validUntil}</p>
                  </div>
                )}
              </div>

              {(serializedExistingQuote.grossProfit || serializedExistingQuote.marginPct) && (
                <div className="rounded bg-ink-200 px-3 py-2 flex gap-6 text-xs text-ink-600">
                  <span>🔒 Interno:</span>
                  {serializedExistingQuote.grossProfit && (
                    <span>
                      Profit:{' '}
                      <strong>
                        {parseFloat(serializedExistingQuote.grossProfit).toLocaleString('bs-BA', { minimumFractionDigits: 2 })}{' '}
                        {serializedExistingQuote.currency}
                      </strong>
                    </span>
                  )}
                  {serializedExistingQuote.marginPct && (
                    <span>
                      Marža: <strong>{parseFloat(serializedExistingQuote.marginPct).toFixed(1)}%</strong>
                    </span>
                  )}
                </div>
              )}

              {serializedExistingQuote.status === 'DRAFT' && (
                <QuoteSendButton quoteId={serializedExistingQuote.id} />
              )}
              {serializedExistingQuote.sentAt && (
                <p className="text-xs text-ink-400">Poslana: {serializedExistingQuote.sentAt}</p>
              )}
            </div>

            {/* Edit form */}
            <div>
              <p className="mb-3 text-sm font-medium text-ink-700">
                {serializedExistingQuote.status === 'DRAFT'
                  ? 'Uredi nacrt'
                  : 'Izmijeni ponudu (nova verzija)'}
              </p>
              <QuoteForm
                quoteId={serializedExistingQuote.id}
                existingStatus={serializedExistingQuote.status}
                defaultValues={{
                  productCost: serializedExistingQuote.productCost,
                  logisticsCost: serializedExistingQuote.logisticsCost,
                  customsCost: serializedExistingQuote.customsCost,
                  deliveryCost: serializedExistingQuote.deliveryCost,
                  serviceCost: serializedExistingQuote.serviceCost,
                  vatAmount: serializedExistingQuote.vatAmount,
                  internalCost: serializedExistingQuote.internalCost,
                  currency: serializedExistingQuote.currency,
                  validUntil: serializedExistingQuote.validUntil,
                }}
              />
            </div>

            {/* Version history */}
            {serializedExistingQuote.versions.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink-700">Historija verzija</p>
                <div className="space-y-2">
                  {serializedExistingQuote.versions.map((v) => (
                    <div
                      key={v.versionNo}
                      className="flex items-start gap-3 rounded-lg bg-ink-50 px-3 py-2 text-sm"
                    >
                      <span className="shrink-0 rounded bg-ink-200 px-2 py-0.5 text-xs font-medium text-ink-700">
                        v{v.versionNo}
                      </span>
                      <div className="flex-1">
                        <span className="text-ink-600">{v.changeNote ?? 'Bez bilješke'}</span>
                      </div>
                      <span className="shrink-0 text-xs text-ink-400">
                        {v.changedByName} · {v.createdAt} {v.createdAtTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="mb-5 text-xs text-ink-400">
              Kreirajte ponudu za klijenta na osnovu prikupljenih troškova.
            </p>
            <QuoteForm
              importRequestId={request.id}
              defaultValues={{
                productCost: latestSupplierQuote?.supplierTotal?.toString() ?? '',
                logisticsCost: selectedForwarderQuote?.totalCost?.toString() ?? '',
              }}
            />
          </>
        )}
      </div>

      {/* ── Fakturiranje ── */}
      {serializedExistingQuote?.order && (
        <div className="card p-5">
          <h2 className="mb-1 text-base font-semibold text-ink-900">Fakturiranje</h2>

          {serializedExistingQuote.order.hasInvoice ? (
            <div className="flex items-center gap-3">
              <span className="badge bg-emerald-100 text-emerald-800">Faktura kreirana</span>
              <a
                href={`/admin/invoices?orderId=${serializedExistingQuote.order.id}`}
                className="text-sm text-brand-600 hover:underline"
              >
                Pregledaj fakture →
              </a>
            </div>
          ) : (
            <>
              <p className="mb-5 text-xs text-ink-400">
                Kreirajte fakturu za potvrđenu narudžbu.
              </p>
              <InvoiceForm
                orderId={serializedExistingQuote.order.id}
                defaultAmount={serializedExistingQuote.totalAmount ?? undefined}
                currency={serializedExistingQuote.currency}
              />
            </>
          )}
        </div>
      )}

      {/* ── Pošiljka ── */}
      {shipmentEligible && (
        <div className="card p-5">
          <h2 className="mb-1 text-base font-semibold text-ink-900">Pošiljka</h2>

          {!request.shipment ? (
            <>
              <p className="mb-5 text-xs text-ink-400">
                Kreirajte pošiljku i pratite transport robe.
              </p>
              <ShipmentForm importRequestId={request.id} />
            </>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="rounded-lg bg-ink-50 border border-ink-200 px-4 py-3 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink-900">{request.shipment.code}</span>
                  {request.shipment.currentLocation && (
                    <span className="text-ink-600">📍 {request.shipment.currentLocation}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-ink-600">
                  {request.shipment.carrier && (
                    <span><span className="text-ink-400">Prijevoznik:</span> {request.shipment.carrier}</span>
                  )}
                  {request.shipment.trackingNumber && (
                    <span><span className="text-ink-400">Tracking:</span> {request.shipment.trackingNumber}</span>
                  )}
                  {request.shipment.containerNumber && (
                    <span><span className="text-ink-400">Kontejner:</span> {request.shipment.containerNumber}</span>
                  )}
                  {request.shipment.blNumber && (
                    <span><span className="text-ink-400">B/L:</span> {request.shipment.blNumber}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-ink-600">
                  {request.shipment.etd && (
                    <span><span className="text-ink-400">ETD:</span> {request.shipment.etd.toLocaleDateString('bs-BA')}</span>
                  )}
                  {request.shipment.eta && (
                    <span><span className="text-ink-400">ETA:</span> {request.shipment.eta.toLocaleDateString('bs-BA')}</span>
                  )}
                  {request.shipment.actualDeparture && (
                    <span><span className="text-ink-400">Stvarni polazak:</span> {request.shipment.actualDeparture.toLocaleDateString('bs-BA')}</span>
                  )}
                  {request.shipment.actualArrival && (
                    <span><span className="text-ink-400">Stvarni dolazak:</span> {request.shipment.actualArrival.toLocaleDateString('bs-BA')}</span>
                  )}
                </div>
              </div>

              {/* Events list */}
              <div>
                <p className="mb-3 text-sm font-medium text-ink-700">Događaji pošiljke</p>
                {request.shipment.events.length === 0 ? (
                  <p className="text-sm text-ink-400 mb-4">Nema zabilježenih događaja.</p>
                ) : (
                  <div className="space-y-2 mb-5">
                    {request.shipment.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 rounded-lg bg-ink-50 px-3 py-2 text-sm"
                      >
                        <span className="shrink-0 rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                          {event.label}
                        </span>
                        <div className="flex-1">
                          {event.note && (
                            <span className="text-ink-600">{event.note}</span>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-ink-400">
                          {event.occurredAt.toLocaleDateString('bs-BA')}{' '}
                          {event.occurredAt.toLocaleTimeString('bs-BA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-ink-100 pt-4">
                  <p className="mb-3 text-sm font-medium text-ink-700">Dodaj događaj</p>
                  <ShipmentEventForm shipmentId={request.shipment.id} />
                </div>
              </div>

              {/* Edit form */}
              <div className="border-t border-ink-100 pt-4">
                <p className="mb-3 text-sm font-medium text-ink-700">Uredi detalje pošiljke</p>
                <ShipmentForm
                  shipmentId={request.shipment.id}
                  defaultValues={{
                    carrier: request.shipment.carrier ?? undefined,
                    containerNumber: request.shipment.containerNumber ?? undefined,
                    blNumber: request.shipment.blNumber ?? undefined,
                    trackingNumber: request.shipment.trackingNumber ?? undefined,
                    origin: request.shipment.origin ?? undefined,
                    destination: request.shipment.destination ?? undefined,
                    etd: request.shipment.etd?.toISOString().split('T')[0] ?? undefined,
                    eta: request.shipment.eta?.toISOString().split('T')[0] ?? undefined,
                    transportMode: request.shipment.transportMode ?? undefined,
                    currentLocation: request.shipment.currentLocation ?? undefined,
                    actualDeparture: request.shipment.actualDeparture?.toISOString().split('T')[0] ?? undefined,
                    actualArrival: request.shipment.actualArrival?.toISOString().split('T')[0] ?? undefined,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Dokumenti ── */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Dokumenti</h2>

        {request.documents.length > 0 && (
          <div className="mb-6 space-y-4">
            {(() => {
              const byFolder: Record<string, typeof request.documents> = {};
              for (const doc of request.documents) {
                if (!byFolder[doc.folder]) byFolder[doc.folder] = [];
                byFolder[doc.folder].push(doc);
              }
              return Object.entries(byFolder)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([folder, docs]) => (
                  <div key={folder}>
                    <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
                      {folder}
                    </p>
                    <div className="space-y-1.5">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm"
                        >
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-700 hover:underline truncate"
                          >
                            {doc.fileName}
                          </a>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`badge ${
                                doc.visibleToClient
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-ink-100 text-ink-600'
                              }`}
                            >
                              {doc.visibleToClient ? 'Vidljivo klijentu' : 'Interno'}
                            </span>
                            <DeleteDocumentButton documentId={doc.id} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
            })()}
          </div>
        )}

        <div className={request.documents.length > 0 ? 'border-t border-ink-100 pt-5' : ''}>
          {request.documents.length === 0 && (
            <p className="mb-4 text-sm text-ink-400">Nema dokumenata za ovaj zahtjev.</p>
          )}
          <p className="mb-3 text-sm font-medium text-ink-700">Dodaj dokument</p>
          <DocumentForm importRequestId={request.id} />
        </div>
      </div>

      {/* ── Poruke ── */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Poruke</h2>
        <p className="mb-5 text-xs text-ink-400">
          Komunikacija sa klijentom — vidljivo klijentu
        </p>

        {/* Chat history */}
        {request.messages.length === 0 ? (
          <p className="mb-5 text-sm text-ink-400">Nema poruka za ovaj zahtjev.</p>
        ) : (
          <div className="mb-5 space-y-2">
            {request.messages.map((msg) => {
              const isFromClient = msg.sender.role === 'CLIENT';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isFromClient ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isFromClient
                        ? 'bg-ink-100 text-ink-900'
                        : 'bg-brand-600 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <p
                      className={`mt-1 text-xs ${
                        isFromClient ? 'text-ink-500' : 'text-brand-200'
                      }`}
                    >
                      {msg.sender.name} ·{' '}
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

        {/* Send form */}
        <div className={request.messages.length > 0 ? 'border-t border-ink-100 pt-4' : ''}>
          <MessageForm importRequestId={request.id} />
        </div>
      </div>
    </div>
  );
}
