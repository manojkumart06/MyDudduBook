export const queryKeys = {
  customers: (uid: string) => ['customers', uid] as const,
  customer: (uid: string, id: string) => ['customers', uid, id] as const,
  loans: (uid: string) => ['loans', uid] as const,
  loansByCustomer: (uid: string, customerId: string) => ['loans', uid, 'customer', customerId] as const,
  payments: (uid: string) => ['payments', uid] as const,
  paymentsByLoan: (uid: string, loanId: string) => ['payments', uid, 'loan', loanId] as const,
  paymentsByCustomer: (uid: string, customerId: string) =>
    ['payments', uid, 'customer', customerId] as const,
  dashboardPayments: (uid: string) => ['dashboard', 'payments', uid] as const,
};
