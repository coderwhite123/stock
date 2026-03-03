'use server';

import { createClient } from '@/lib/supabase/server';
import { withdrawalRequestSchema } from '@/lib/validations/withdrawal';
import { sendWithdrawalRequestEmail } from '@/services/email';
import { logUserActivity } from '@/services/activity';
import { revalidatePath } from 'next/cache';

export async function submitWithdrawalRequest(input: {
  amountBtc: string;
  bankAccountId: string;
}) {
  const parsed = withdrawalRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { _form: ['Not authenticated'] } };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, btc_balance, withdrawals_enabled')
    .eq('user_id', user.id)
    .single();

  if (!profile) return { error: { _form: ['Profile not found'] } };
  if (!profile.withdrawals_enabled) {
    return { error: { _form: ['Withdrawals are not approved for your account yet.'] } };
  }

  const balance = parseFloat(profile.btc_balance || '0');
  const amount = parseFloat(parsed.data.amountBtc);
  if (amount > balance) {
    return { error: { _form: ['Insufficient balance'] } };
  }

  const { data: unpaidFees } = await supabase
    .from('fees')
    .select('id')
    .eq('profile_id', profile.id)
    .eq('paid', false);

  if (unpaidFees?.length) {
    return { error: { _form: ['Please pay required fees before withdrawing.'] } };
  }

  const { data: bankAccount } = await supabase
    .from('bank_accounts')
    .select('id, bank_name, bank_account, bank_routing')
    .eq('id', parsed.data.bankAccountId)
    .eq('profile_id', profile.id)
    .single();

  if (!bankAccount) {
    return { error: { _form: ['Please select a saved bank account from your Profile.'] } };
  }

  const btcPrice = 0;
  const { error: insertError } = await supabase.from('withdrawal_requests').insert({
    profile_id: profile.id,
    amount_btc: parsed.data.amountBtc,
    amount_usd: btcPrice > 0 ? (amount * btcPrice).toFixed(2) : null,
    bank_name: bankAccount.bank_name,
    bank_account: bankAccount.bank_account,
    bank_routing: bankAccount.bank_routing || null,
    status: 'pending',
  });

  if (insertError) {
    return { error: { _form: [insertError.message] } };
  }

  await sendWithdrawalRequestEmail(profile.email, parsed.data.amountBtc, profile.full_name);
  await logUserActivity('withdrawal_request_submitted', { amountBtc: parsed.data.amountBtc });
  revalidatePath('/withdraw');
  revalidatePath('/dashboard');
  return { success: true };
}
