'use server';

import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deriveAddress } from '@/services/bitcoin';
import { sendWalletAssignedEmail } from '@/services/email';
import { revalidatePath } from 'next/cache';

export async function requestBtcAddress() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, email, full_name, btc_deposit_address')
    .eq('user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };
  if (profile.btc_deposit_address) return { error: 'You already have a BTC address' };

  const xpub = process.env.MASTER_BTC_XPUB;
  if (!xpub) return { error: 'BTC address generation is not configured. Contact support.' };

  const { data: maxRow } = await admin
    .from('profiles')
    .select('btc_address_index')
    .not('btc_address_index', 'is', null)
    .order('btc_address_index', { ascending: false })
    .limit(1)
    .single();

  const nextIndex = (maxRow?.btc_address_index ?? -1) + 1;
  const address = deriveAddress(xpub, nextIndex);

  const { error: updateError } = await admin
    .from('profiles')
    .update({ btc_deposit_address: address, btc_address_index: nextIndex })
    .eq('id', profile.id);

  if (updateError) return { error: updateError.message };

  await sendWalletAssignedEmail(profile.email, address, profile.full_name);
  revalidatePath('/dashboard');
  return { success: true };
}
