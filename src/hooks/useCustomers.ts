import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useCurrentUserId } from '@/features/auth/AuthContext';
import { collections, db } from '@/lib/firebase';
import type { CustomerFormValues } from '@/schemas/customer';
import type { Customer } from '@/types';
import { queryKeys } from './queryKeys';

function toCustomer(snap: { id: string; data: () => Record<string, unknown> }): Customer {
  return { id: snap.id, ...(snap.data() as Omit<Customer, 'id'>) };
}

export function useCustomers() {
  const uid = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.customers(uid),
    queryFn: async (): Promise<Customer[]> => {
      const q = query(
        collection(db, collections.customers),
        where('userId', '==', uid),
        orderBy('name', 'asc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map(toCustomer);
    },
    staleTime: 5 * 60_000,
  });
}

export function useCustomer(id: string | undefined) {
  const uid = useCurrentUserId();
  return useQuery({
    enabled: !!id,
    queryKey: id ? queryKeys.customer(uid, id) : ['customer', 'unknown'],
    queryFn: async (): Promise<Customer | null> => {
      if (!id) return null;
      const snap = await getDoc(doc(db, collections.customers, id));
      if (!snap.exists()) return null;
      const data = snap.data() as Omit<Customer, 'id'>;
      if (data.userId !== uid) return null;
      return { id: snap.id, ...data };
    },
    staleTime: 5 * 60_000,
  });
}

export function useCreateCustomer() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const now = serverTimestamp();
      const ref = await addDoc(collection(db, collections.customers), {
        userId: uid,
        name: values.name,
        phone: values.phone ?? null,
        notes: values.notes ?? null,
        createdAt: now,
        updatedAt: now,
      });
      return ref.id;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.customers(uid) });
    },
  });
}

export function useUpdateCustomer() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; values: CustomerFormValues }) => {
      await updateDoc(doc(db, collections.customers, args.id), {
        name: args.values.name,
        phone: args.values.phone ?? null,
        notes: args.values.notes ?? null,
        updatedAt: serverTimestamp(),
        userId: uid,
      });
    },
    onSuccess: (_, args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.customers(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.customer(uid, args.id) });
    },
  });
}

export function useDeleteCustomerCascade() {
  const uid = useCurrentUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: string) => {
      const [loansSnap, paymentsSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, collections.loans),
            where('userId', '==', uid),
            where('customerId', '==', customerId),
          ),
        ),
        getDocs(
          query(
            collection(db, collections.payments),
            where('userId', '==', uid),
            where('customerId', '==', customerId),
          ),
        ),
      ]);

      const batch = writeBatch(db);
      loansSnap.docs.forEach((d) => batch.delete(d.ref));
      paymentsSnap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(doc(db, collections.customers, customerId));
      await batch.commit();
      return { loans: loansSnap.size, payments: paymentsSnap.size };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.customers(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.loans(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.payments(uid) });
    },
  });
}

export async function countCustomerDependents(uid: string, customerId: string) {
  const [loans, payments] = await Promise.all([
    getDocs(
      query(
        collection(db, collections.loans),
        where('userId', '==', uid),
        where('customerId', '==', customerId),
      ),
    ),
    getDocs(
      query(
        collection(db, collections.payments),
        where('userId', '==', uid),
        where('customerId', '==', customerId),
      ),
    ),
  ]);
  return { loans: loans.size, payments: payments.size };
}

export function nowTimestamp(): Timestamp {
  return Timestamp.now();
}
