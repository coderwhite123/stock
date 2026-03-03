'use server';

import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signupSchema, loginSchema } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { sendVerificationEmail } from '@/services/email';
import type { SignupInput, LoginInput } from '@/lib/validations/auth';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function signup(input: SignupInput) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      address: parsed.data.address,
    },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes('rate limit') || authError.message.includes('429')) {
      return { error: { _form: ['Email rate limit exceeded. Please try again in a few minutes.'] } };
    }
    return { error: { _form: [authError.message] } };
  }

  if (!authData.user) {
    return { error: { _form: ['Could not create account.'] } };
  }

  const { error: profileError } = await admin.from('profiles').insert({
    user_id: authData.user.id,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    address: parsed.data.address,
    email_verified: false,
  });

  if (profileError) {
    return { error: { _form: [profileError.message] } };
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error: tokenError } = await admin.from('email_verification_tokens').insert({
    user_id: authData.user.id,
    token,
    expires_at: expiresAt,
  });

  if (!tokenError) {
    await sendVerificationEmail(parsed.data.email, token, BASE_URL, parsed.data.fullName);
  }

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  redirect('/verify-email?message=Check your email to verify your account.');
}

export async function login(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
