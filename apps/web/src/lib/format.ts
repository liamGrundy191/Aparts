// shortcut: one currency for the whole app, change it here when the app needs another one.
const CURRENCY = 'USD';

/** Formats an amount from the API (a Decimal string like "5200") or a number as money. */
export function formatMoney(amount: string | number): string {
  return Number(amount).toLocaleString(undefined, { style: 'currency', currency: CURRENCY });
}

// Lease dates are stored as UTC midnight, so they are always shown in UTC.
// In the viewer's own timezone, "Jan 1" could come out as "Dec 31".
const inUtc = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString(undefined, { timeZone: 'UTC', ...options });

/** e.g. "Jan 1, 2026" */
export const formatDate = (iso: string) =>
  inUtc(iso, { year: 'numeric', month: 'short', day: 'numeric' });

/** e.g. "Jan 2026" */
export const formatMonthYear = (iso: string) => inUtc(iso, { year: 'numeric', month: 'short' });

/** A Date as the YYYY-MM-DD value an <input type="date"> uses, in the user's own timezone. */
export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
