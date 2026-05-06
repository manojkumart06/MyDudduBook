import { isBefore, startOfDay } from 'date-fns';
import type { Payment, PaymentStatus } from '@/types';
import { toDate } from './formatters';

export function isOverdue(payment: Pick<Payment, 'status' | 'dueDate'>, now: Date = new Date()): boolean {
  if (payment.status === 'paid') return false;
  const due = toDate(payment.dueDate);
  if (!due) return false;
  return isBefore(startOfDay(due), startOfDay(now));
}

export function derivedStatus(payment: Pick<Payment, 'status' | 'dueDate'>, now: Date = new Date()): PaymentStatus {
  if (payment.status === 'paid') return 'paid';
  return isOverdue(payment, now) ? 'overdue' : 'pending';
}
