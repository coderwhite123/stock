import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WithdrawForm } from './withdraw-form';
import { formatBtc } from '@/lib/utils';
import { getBtcPriceUsd } from '@/services/blockchain';

export default async function WithdrawPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, btc_balance, withdrawals_enabled')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/login');

  const { data: unpaidFees } = await supabase
    .from('fees')
    .select('id')
    .eq('profile_id', profile.id)
    .eq('paid', false);

  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('id, bank_name, bank_account, bank_routing, is_primary, country, swift_bic, iban, branch_code, account_holder_name')
    .eq('profile_id', profile.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  const canWithdraw = profile.withdrawals_enabled && (!unpaidFees || unpaidFees.length === 0);
  const balanceBtc = profile.btc_balance ?? '0';
  const btcPriceUsd = await getBtcPriceUsd();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Withdraw</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Available balance: {formatBtc(balanceBtc)} BTC
        </p>
      </div>
      <WithdrawForm
        balanceBtc={balanceBtc}
        btcPriceUsd={btcPriceUsd}
        canWithdraw={!!canWithdraw}
        unpaidFeesCount={unpaidFees?.length ?? 0}
        savedBankAccounts={bankAccounts ?? []}
      />
    </div>
  );
}
