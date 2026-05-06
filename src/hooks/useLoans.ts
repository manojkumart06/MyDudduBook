import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addMonths, startOfDay } from 'date-fns';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useCurrentUserId } from '@/features/auth/AuthContext';
import { collections, db } from '@/lib/firebase';
import { computeMonthlyInterest } from '@/lib/formatters';
import type { LoanFormValues } from '@/schemas/loan';
import type { Loan, Payment } from '@/types';
import { queryKeys } from './queryKeys';

const INITIAL_PAYMENT_COUNT = 12;

function toLoan(snap: { id: string; data: () => Record<string, unknown> }): Loan {
  return { id: snap.id, ...(snap.data() as Omit<Loan, 'id'>) };
}

export function useLoans(filter?: { customerId?: string; status?: Loan['status'] }) {
  const uid = useCurrentUserId();
  const key = filter?.customerId
    ? queryKeys.loansByCustomer(uid, filter.customerId)
    : queryKeys.loans(uid);

  return useQuery({
    queryKey: [...key, filter?.status ?? 'all'],
    queryFn: async (): Promise<Loan[]> => {
      const constraints = [where('userId', '==', uid)];
      if (filter?.customerId) constraints.push(where('customerId', '==', filter.customerId));
      if (filter?.status) constraints.push(where('status', '==', filter.status));
      const q = query(collection(db, collections.loans), ...constraints, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(toLoan);
    },
    staleTime: 5 * 60_000,
  });
}

export function useLoan(id: string | undefined) {
  const uid = useCurrentUserId();
  return useQuery({
    enabled: !!id,
    queryKey: ['loan', uid, id ?? 'unknown'],
    queryFn: async (): Promise<Loan | null> => {
      if (!id) return null;
      const snap = await getDoc(doc(db, collections.loans, id));
      if (!snap.exists()) return null;
      const data = snap.data() as Omit<Loan, 'id'>;
      if (data.userId !== uid) return null;
      return { id: snap.id, ...data };
    },
    staleTime: 5 * 60_000,
  });
}

export function useCreateLoan() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (values: LoanFormValues) => {
      const monthlyInterest = computeMonthlyInterest(values.principalAmount, values.interestRate);
      const startDate = Timestamp.fromDate(startOfDay(new Date(values.startDate)));
      const loanRef = doc(collection(db, collections.loans));

      const batch = writeBatch(db);
      batch.set(loanRef, {
        userId: uid,
        customerId: values.customerId,
        principalAmount: values.principalAmount,
        interestRate: values.interestRate,
        monthlyInterest,
        startDate,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      for (let i = 1; i <= INITIAL_PAYMENT_COUNT; i += 1) {
        const paymentRef = doc(collection(db, collections.payments));
        const due = Timestamp.fromDate(addMonths(startDate.toDate(), i));
        batch.set(paymentRef, {
          userId: uid,
          loanId: loanRef.id,
          customerId: values.customerId,
          dueDate: due,
          expectedAmount: monthlyInterest,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        } satisfies Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> & {
          createdAt: ReturnType<typeof serverTimestamp>;
          updatedAt: ReturnType<typeof serverTimestamp>;
        });
      }

      await batch.commit();
      return loanRef.id;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.loans(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.payments(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardPayments(uid) });
    },
  });
}

export function useCloseLoan() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (loanId: string) => {
      const loanRef = doc(db, collections.loans, loanId);
      const paymentsSnap = await getDocs(
        query(
          collection(db, collections.payments),
          where('userId', '==', uid),
          where('loanId', '==', loanId),
          where('status', '==', 'pending'),
        ),
      );

      const batch = writeBatch(db);
      batch.update(loanRef, {
        status: 'closed',
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      paymentsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return paymentsSnap.size;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.loans(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.payments(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardPayments(uid) });
    },
  });
}

export function useDeleteLoan() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (loanId: string) => {
      const paymentsSnap = await getDocs(
        query(
          collection(db, collections.payments),
          where('userId', '==', uid),
          where('loanId', '==', loanId),
        ),
      );
      const batch = writeBatch(db);
      paymentsSnap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(doc(db, collections.loans, loanId));
      await batch.commit();
      return paymentsSnap.size;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.loans(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.payments(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardPayments(uid) });
    },
  });
}

