import type { Timestamp } from 'firebase/firestore';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type LoanStatus = 'active' | 'closed';

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Loan {
  id: string;
  userId: string;
  customerId: string;
  principalAmount: number;
  interestRate: number;
  monthlyInterest: number;
  startDate: Timestamp;
  status: LoanStatus;
  closedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Payment {
  id: string;
  userId: string;
  loanId: string;
  customerId: string;
  dueDate: Timestamp;
  expectedAmount: number;
  receivedAmount?: number;
  paidDate?: Timestamp;
  status: PaymentStatus;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
