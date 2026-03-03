'use server';

import { createClient } from '@/lib/supabase/server';
import {
  sendBankAccountAddedEmail,
  sendBankAccountUpdatedEmail,
  sendBankAccountDeletedEmail,
} from '@/services/email';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

function last4(account: string): string {
  const digits = account.replace(/\D/g, '');
  return digits.slice(-4) || '****';
}

const bankAccountSchema = z.object({
  bank_name: z.string().min(1).max(200),
  bank_account: z.string().min(1).max(100),
  bank_routing: z.string().max(80).optional(),
  account_holder_name: z.string().max(200).optional(),
  is_primary: z.boolean().optional(),
  country: z.string().max(10).optional(),
  swift_bic: z.string().max(20).optional(),
  iban: z.string().max(40).optional(),
  branch_code: z.string().max(20).optional(),
});

export async function addBankAccount(input: z.infer<typeof bankAccountSchema>) {
  const parsed = bankAccountSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { _form: ['Not authenticated'] } };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('user_id', user.id)
    .single();
  if (!profile) return { error: { _form: ['Profile not found'] } };

  const { data: row, error } = await supabase
    .from('bank_accounts')
    .insert({
      profile_id: profile.id,
      bank_name: parsed.data.bank_name,
      bank_account: parsed.data.bank_account,
      bank_routing: parsed.data.bank_routing || null,
      account_holder_name: parsed.data.account_holder_name || null,
      is_primary: parsed.data.is_primary ?? false,
      country: parsed.data.country || null,
      swift_bic: parsed.data.swift_bic || null,
      iban: parsed.data.iban || null,
      branch_code: parsed.data.branch_code || null,
    })
    .select('id')
    .single();

  if (error) return { error: { _form: [error.message] } };

  if (profile.email) {
    await sendBankAccountAddedEmail(
      profile.email,
      parsed.data.bank_name,
      last4(parsed.data.bank_account),
      profile.full_name
    );
  }

  revalidatePath('/profile');
  revalidatePath('/withdraw');
  return { success: true, id: row.id };
}

export async function updateBankAccount(
  id: string,
  input: z.infer<typeof bankAccountSchema>
) {
  const parsed = bankAccountSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { _form: ['Not authenticated'] } };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('user_id', user.id)
    .single();
  if (!profile) return { error: { _form: ['Profile not found'] } };

  const { data: existing } = await supabase
    .from('bank_accounts')
    .select('id')
    .eq('id', id)
    .eq('profile_id', profile.id)
    .single();
  if (!existing) return { error: { _form: ['Bank account not found'] } };

  const { error } = await supabase
    .from('bank_accounts')
    .update({
      bank_name: parsed.data.bank_name,
      bank_account: parsed.data.bank_account,
      bank_routing: parsed.data.bank_routing || null,
      account_holder_name: parsed.data.account_holder_name || null,
      is_primary: parsed.data.is_primary ?? false,
      country: parsed.data.country || null,
      swift_bic: parsed.data.swift_bic || null,
      iban: parsed.data.iban || null,
      branch_code: parsed.data.branch_code || null,
    })
    .eq('id', id);

  if (error) return { error: { _form: [error.message] } };

  if (profile.email) {
    await sendBankAccountUpdatedEmail(
      profile.email,
      parsed.data.bank_name,
      last4(parsed.data.bank_account),
      profile.full_name
    );
  }

  revalidatePath('/profile');
  revalidatePath('/withdraw');
  return { success: true };
}

export async function deleteBankAccount(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { _form: ['Not authenticated'] } };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('user_id', user.id)
    .single();
  if (!profile) return { error: { _form: ['Profile not found'] } };

  const { data: row } = await supabase
    .from('bank_accounts')
    .select('bank_name, bank_account')
    .eq('id', id)
    .eq('profile_id', profile.id)
    .single();
  if (!row) return { error: { _form: ['Bank account not found'] } };

  const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
  if (error) return { error: { _form: [error.message] } };

  if (profile.email) {
    await sendBankAccountDeletedEmail(
      profile.email,
      row.bank_name,
      last4(row.bank_account),
      profile.full_name
    );
  }

  revalidatePath('/profile');
  revalidatePath('/withdraw');
  return { success: true };
}
