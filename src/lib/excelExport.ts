import { endOfMonth, format, startOfMonth } from 'date-fns';
import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { collections, db } from './firebase';
import { formatDate } from './formatters';
import type { Customer, Payment } from '@/types';

interface ExportArgs {
  uid: string;
  month: Date;
  customersById: Map<string, Customer>;
}

interface Row {
  customer: string;
  phone: string;
  dueDate: string;
  expected: number | null;
  received: number | null;
  paidDate: string;
  status: string;
  note: string;
}

export async function exportMonthlyPayments({
  uid,
  month,
  customersById,
}: ExportArgs): Promise<number> {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const q = query(
    collection(db, collections.payments),
    where('userId', '==', uid),
    where('dueDate', '>=', Timestamp.fromDate(start)),
    where('dueDate', '<=', Timestamp.fromDate(end)),
    orderBy('dueDate', 'desc'),
  );

  const snap = await getDocs(q);
  const payments = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }))
    .reverse();

  if (payments.length === 0) return 0;

  const rows: Row[] = payments.map((p) => {
    const customer = customersById.get(p.customerId);
    return {
      customer: customer?.name ?? 'Unknown',
      phone: customer?.phone ?? '',
      dueDate: formatDate(p.dueDate),
      expected: p.expectedAmount,
      received: p.receivedAmount ?? null,
      paidDate: p.paidDate ? formatDate(p.paidDate) : '',
      status: p.status.toUpperCase(),
      note: p.note ?? '',
    };
  });

  const totalExpected = payments.reduce((s, p) => s + p.expectedAmount, 0);
  const totalReceived = payments.reduce((s, p) => s + (p.receivedAmount ?? 0), 0);

  rows.push({
    customer: 'TOTAL',
    phone: '',
    dueDate: '',
    expected: totalExpected,
    received: totalReceived,
    paidDate: '',
    status: '',
    note: '',
  });

  const { default: writeXlsxFile } = await import('write-excel-file/browser');

  const result = writeXlsxFile<Row>(rows, {
    sheet: format(month, 'MMM yyyy'),
    columns: [
      { header: 'Customer', cell: (r) => r.customer, width: 28 },
      { header: 'Phone', cell: (r) => r.phone, width: 14 },
      { header: 'Due Date', cell: (r) => r.dueDate, width: 14 },
      {
        header: 'Expected',
        cell: (r) => ({ type: Number, value: r.expected ?? undefined, format: '#,##0' }),
        width: 12,
      },
      {
        header: 'Received',
        cell: (r) => ({ type: Number, value: r.received ?? undefined, format: '#,##0' }),
        width: 12,
      },
      { header: 'Paid Date', cell: (r) => r.paidDate, width: 14 },
      { header: 'Status', cell: (r) => r.status, width: 12 },
      { header: 'Note', cell: (r) => r.note, width: 30 },
    ],
  });

  await result.toFile(`MyDudduBook-${format(month, 'yyyy-MM')}.xlsx`);
  return payments.length;
}
