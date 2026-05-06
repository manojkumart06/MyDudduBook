import { format, formatDistanceToNowStrict, isValid } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

const STORAGE_KEY = 'myduddubook:currency';

export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

export function getCurrency(): SupportedCurrency {
  if (typeof window === 'undefined') return 'INR';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'INR' || stored === 'USD' || stored === 'EUR' || stored === 'GBP') {
    return stored;
  }
  return 'INR';
}

export function setCurrency(currency: SupportedCurrency): void {
  window.localStorage.setItem(STORAGE_KEY, currency);
}

export function formatCurrency(amount: number, currency: SupportedCurrency = getCurrency()): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Timestamp ? value.toDate() : value;
  return isValid(date) ? date : null;
}

export function formatDate(value: Timestamp | Date | null | undefined, pattern = 'dd MMM yyyy'): string {
  const date = toDate(value);
  return date ? format(date, pattern) : '—';
}

export function formatRelative(value: Timestamp | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return '—';
  return `${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

export function computeMonthlyInterest(principal: number, ratePercent: number): number {
  return Math.round((principal * ratePercent) / 100);
}
