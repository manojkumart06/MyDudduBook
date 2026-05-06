import { z } from 'zod';

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone is too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes are too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
