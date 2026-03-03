import { z } from 'zod';

export const withdrawalRequestSchema = z.object({
  amountBtc: z.string().refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Invalid amount'),
  bankAccountId: z.string().uuid(),
}).strict();

export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
