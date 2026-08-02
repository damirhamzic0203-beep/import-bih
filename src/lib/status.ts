export const IMPORT_STATUS_LABELS: Record<string, string> = {
  NEW: 'Novo',
  UNDER_REVIEW: 'U pregledu',
  SOURCING: 'Traženje dobavljača',
  SUPPLIER_SELECTED: 'Dobavljač odabran',
  NEGOTIATION: 'Pregovaranje',
  QUALITY_CONTROL: 'Kontrola kvaliteta',
  TRANSPORT_QUOTATION: 'Ponude za transport',
  CLIENT_APPROVAL: 'Čeka odobrenje klijenta',
  ORDER_CONFIRMED: 'Narudžba potvrđena',
  GOODS_READY: 'Roba spremna',
  IN_TRANSIT: 'U transportu',
  CUSTOMS: 'Carina',
  DELIVERY: 'Dostava',
  COMPLETED: 'Završeno',
  REQUIRES_ASSESSMENT: 'Potrebna procjena',
};

export const IMPORT_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-ink-100 text-ink-700',
  UNDER_REVIEW: 'bg-brand-100 text-brand-800',
  SOURCING: 'bg-brand-100 text-brand-800',
  SUPPLIER_SELECTED: 'bg-brand-100 text-brand-800',
  NEGOTIATION: 'bg-gold-400/20 text-gold-600',
  QUALITY_CONTROL: 'bg-gold-400/20 text-gold-600',
  TRANSPORT_QUOTATION: 'bg-brand-200 text-brand-900',
  CLIENT_APPROVAL: 'bg-gold-400/20 text-gold-600',
  ORDER_CONFIRMED: 'bg-emerald-100 text-emerald-800',
  GOODS_READY: 'bg-emerald-100 text-emerald-800',
  IN_TRANSIT: 'bg-brand-200 text-brand-900',
  CUSTOMS: 'bg-amber-100 text-amber-800',
  DELIVERY: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-emerald-600 text-white',
  REQUIRES_ASSESSMENT: 'bg-red-100 text-red-700',
};

export const SUPPLIER_STATUS_LABELS: Record<string, string> = {
  NEW: 'Novi',
  CONTACTED: 'Kontaktiran',
  VERIFIED: 'Verificiran',
  ACTIVE: 'Aktivan',
  BLOCKED: 'Blokiran',
};

export const SUPPLIER_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-ink-100 text-ink-700',
  CONTACTED: 'bg-brand-100 text-brand-800',
  VERIFIED: 'bg-emerald-100 text-emerald-800',
  ACTIVE: 'bg-emerald-600 text-white',
  BLOCKED: 'bg-red-100 text-red-700',
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nacrt',
  SENT: 'Poslano',
  ACCEPTED: 'Prihvaćeno',
  CHANGES_REQUESTED: 'Izmjene zatražene',
  DECLINED: 'Odbijeno',
  EXPIRED: 'Isteklo',
};

export const QUOTE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-ink-100 text-ink-600',
  SENT: 'bg-brand-100 text-brand-800',
  ACCEPTED: 'bg-emerald-600 text-white',
  CHANGES_REQUESTED: 'bg-amber-100 text-amber-800',
  DECLINED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-ink-200 text-ink-500',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: 'Neplaćeno',
  PARTIALLY_PAID: 'Djelimično plaćeno',
  PAID: 'Plaćeno',
  REFUNDED: 'Refundirano',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-800',
  PAID: 'bg-emerald-600 text-white',
  REFUNDED: 'bg-ink-100 text-ink-600',
};

export function formatCurrency(value: number | string | null | undefined, currency = 'EUR') {
  if (value === null || value === undefined) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('bs-BA', { style: 'currency', currency }).format(n);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'upravo sada';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `prije ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `prije ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `prije ${diffD} d`;
  return d.toLocaleDateString('bs-BA');
}
