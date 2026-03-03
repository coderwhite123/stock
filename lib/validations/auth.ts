import { z } from 'zod';

const phoneRegex = /^\+[1-9]\d{1,14}$/;

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(phoneRegex, 'Phone must include country code (e.g. +1234567890)'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(300),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
