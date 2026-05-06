import { z } from 'zod';

export const markPaidSchema = z.object({
  receivedAmount: z
    .number({ invalid_type_error: 'Enter a number' })
    .nonnegative('Amount cannot be negative'),
  paidDate: z
    .string()
    .min(1, 'Paid date is required')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  note: z
    .string()
    .trim()
    .max(300, 'Note is too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type MarkPaidValues = z.infer<typeof markPaidSchema>;

export const paymentEditSchema = markPaidSchema.extend({
  expectedAmount: z
    .number({ invalid_type_error: 'Enter a number' })
    .nonnegative('Amount cannot be negative'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['paid', 'pending', 'overdue']),
});

export type PaymentEditValues = z.infer<typeof paymentEditSchema>;

export const authSignInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

export const authSignUpSchema = authSignInSchema.extend({
  confirm: z.string().min(6, 'At least 6 characters'),
}).refine((v) => v.password === v.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export type SignInValues = z.infer<typeof authSignInSchema>;
export type SignUpValues = z.infer<typeof authSignUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
