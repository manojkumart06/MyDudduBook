import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfDay } from 'date-fns';
import {
  QueryConstraint,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect } from 'react';
import { useCurrentUserId } from '@/features/auth/AuthContext';
import { collections, db } from '@/lib/firebase';
import type { MarkPaidValues, PaymentEditValues } from '@/schemas/payment';
import type { Payment } from '@/types';
import { queryKeys } from './queryKeys';

function toPayment(snap: { id: string; data: () => Record<string, unknown> }): Payment {
  return { id: snap.id, ...(snap.data() as Omit<Payment, 'id'>) };
}

export interface PaymentFilter {
  customerId?: string;
  loanId?: string;
  status?: Payment['status'];
  monthStart?: Date;
  monthEnd?: Date;
  pageSize?: number;
}

export function usePayments(filter: PaymentFilter = {}) {
  const uid = useCurrentUserId();

  return useQuery({
    queryKey: [
      ...queryKeys.payments(uid),
      filter.customerId ?? 'all',
      filter.loanId ?? 'all',
      filter.status ?? 'all',
      filter.monthStart?.toISOString() ?? '',
      filter.monthEnd?.toISOString() ?? '',
      filter.pageSize ?? 50,
    ],
    queryFn: async (): Promise<Payment[]> => {
      const constraints: QueryConstraint[] = [where('userId', '==', uid)];
      if (filter.customerId) constraints.push(where('customerId', '==', filter.customerId));
      if (filter.loanId) constraints.push(where('loanId', '==', filter.loanId));
      if (filter.status && filter.status !== 'overdue') {
        constraints.push(where('status', '==', filter.status));
      }
      if (filter.monthStart) constraints.push(where('dueDate', '>=', Timestamp.fromDate(filter.monthStart)));
      if (filter.monthEnd) constraints.push(where('dueDate', '<=', Timestamp.fromDate(filter.monthEnd)));
      constraints.push(orderBy('dueDate', 'desc'));
      constraints.push(limit(filter.pageSize ?? 50));

      const snap = await getDocs(query(collection(db, collections.payments), ...constraints));
      return snap.docs.map(toPayment);
    },
    staleTime: 2 * 60_000,
  });
}

export function useDashboardPayments() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();

  useEffect(() => {
    const q = query(
      collection(db, collections.payments),
      where('userId', '==', uid),
      orderBy('dueDate', 'desc'),
      limit(250),
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(toPayment);
      qc.setQueryData(queryKeys.dashboardPayments(uid), items);
    });
    return unsub;
  }, [uid, qc]);

  return useQuery({
    queryKey: queryKeys.dashboardPayments(uid),
    queryFn: async (): Promise<Payment[]> => {
      const q = query(
        collection(db, collections.payments),
        where('userId', '==', uid),
        orderBy('dueDate', 'desc'),
        limit(250),
      );
      const snap = await getDocs(q);
      return snap.docs.map(toPayment);
    },
    staleTime: 60_000,
  });
}

export function useMarkPaid() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; values: MarkPaidValues }) => {
      await updateDoc(doc(db, collections.payments, args.id), {
        status: 'paid',
        receivedAmount: args.values.receivedAmount,
        paidDate: Timestamp.fromDate(startOfDay(new Date(args.values.paidDate))),
        note: args.values.note ?? null,
        updatedAt: serverTimestamp(),
        userId: uid,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.payments(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardPayments(uid) });
    },
  });
}

export function useUpdatePayment() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; values: PaymentEditValues }) => {
      await updateDoc(doc(db, collections.payments, args.id), {
        expectedAmount: args.values.expectedAmount,
        receivedAmount: args.values.receivedAmount,
        dueDate: Timestamp.fromDate(startOfDay(new Date(args.values.dueDate))),
        paidDate: args.values.paidDate
          ? Timestamp.fromDate(startOfDay(new Date(args.values.paidDate)))
          : null,
        status: args.values.status,
        note: args.values.note ?? null,
        updatedAt: serverTimestamp(),
        userId: uid,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.payments(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardPayments(uid) });
    },
  });
}

export function useDeletePayment() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, collections.payments, id));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.payments(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardPayments(uid) });
    },
  });
}

export function useSyncOverdue() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const now = startOfDay(new Date());
      const q = query(
        collection(db, collections.payments),
        where('userId', '==', uid),
        where('status', '==', 'pending'),
      );
      const snap = await getDocs(q);
      const updates = snap.docs.filter((d) => {
        const due = (d.data() as Payment).dueDate?.toDate();
        return due && due < now;
      });
      await Promise.all(
        updates.map((d) =>
          updateDoc(d.ref, { status: 'overdue', updatedAt: serverTimestamp(), userId: uid }),
        ),
      );
      return updates.length;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.payments(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardPayments(uid) });
    },
  });
}
