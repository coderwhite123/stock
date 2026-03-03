import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAddressUtxos, satsToBtc, getBtcPriceUsd } from '@/services/blockchain';
import { sendDepositConfirmationEmail } from '@/services/email';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, btc_deposit_address, email, full_name')
    .not('btc_deposit_address', 'is', null);

  if (!profiles?.length) {
    return NextResponse.json({ processed: 0 });
  }

  const btcPrice = await getBtcPriceUsd();
  let processed = 0;

  for (const profile of profiles) {
    const address = profile.btc_deposit_address as string;
    const utxos = await getAddressUtxos(address);
    const confirmed = utxos.filter((u) => u.status.confirmed);

    for (const utxo of confirmed) {
      const amountBtc = satsToBtc(utxo.value);
      const { data: existing } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('tx_hash', utxo.txid)
        .eq('type', 'deposit')
        .single();

      if (existing) continue;

      const amountUsd = (parseFloat(amountBtc) * btcPrice).toFixed(2);
      const { error: txError } = await supabaseAdmin.from('transactions').insert({
        profile_id: profile.id,
        type: 'deposit',
        amount_btc: amountBtc,
        amount_usd: amountUsd,
        status: 'confirmed',
        tx_hash: utxo.txid,
      });

      if (txError) continue;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('btc_balance')
        .eq('id', profile.id)
        .single();

      const newBalance = (parseFloat(currentProfile?.btc_balance || '0') + parseFloat(amountBtc)).toFixed(8);
      await supabaseAdmin
        .from('profiles')
        .update({ btc_balance: newBalance })
        .eq('id', profile.id);

      const emailResult = await sendDepositConfirmationEmail(
        profile.email as string,
        amountBtc,
        utxo.txid,
        1,
        profile.full_name
      );
      if (emailResult?.error) {
        console.error('[check-deposits] Deposit confirmation email failed:', profile.email, emailResult.error);
      }
      processed++;
    }
  }

  return NextResponse.json({ processed });
}
