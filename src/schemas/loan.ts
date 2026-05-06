import { z } from 'zod';

export const loanFormSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  principalAmount: z
    .number({ invalid_type_error: 'Enter a number' })
    .positive('Principal must be greater than 0')
    .max(1_000_000_000, 'Principal is too large'),
  interestRate: z
    .number({ invalid_type_error: 'Enter a number' })
    .min(0, 'Rate cannot be negative')
    .max(100, 'Rate cannot exceed 100%'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
});

export type LoanFormValues = z.infer<typeof loanFormSchema>;
