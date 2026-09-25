import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';
import { getBtcPriceUsd, getCryptoMarketHistory, getCryptoMarketPrices } from '@/services/blockchain';
import { logUserActivity } from '@/services/activity';
import { CryptoTicker } from '@/components/dashboard/crypto-ticker';
import type { RecentTransaction } from '@/components/dashboard/recent-activity';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      email_verified,
      kyc_verified,
      btc_balance,
      btc_deposit_address,
      withdrawals_enabled,
      manager_id,
      managers ( id, name, email )
    `)
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/login');
  if (!profile.email_verified) redirect('/verify-email');

  const [btcPrice, cryptoPrices, cryptoHistory] = await Promise.all([
    getBtcPriceUsd(),
    getCryptoMarketPrices(),
    getCryptoMarketHistory(),
  ]);
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('id, type, amount_btc, amount_usd, status, created_at, tx_hash')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);
  const balanceBtc = parseFloat(profile.btc_balance || '0');
  const balanceUsd = balanceBtc * btcPrice;
  const managersData = profile.managers as { id: string; name: string; email: string } | { id: string; name: string; email: string }[] | null;
  const manager = Array.isArray(managersData) ? managersData[0] ?? null : managersData ?? null;

  await logUserActivity('dashboard_view');

  return (
    <div className="min-h-full bg-[#f5f3ef] px-4 py-6 dark:bg-slate-950 sm:px-6 md:px-8 md:py-9">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Good to see you, {profile.full_name?.split(' ')[0] || 'there'}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Keep your details current and follow each step as your recovery progresses.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Account active
          </div>
        </div>
        <CryptoTicker prices={cryptoPrices} />
        <DashboardClient
          profileId={profile.id}
          balanceBtc={profile.btc_balance ?? '0'}
          balanceUsd={balanceUsd}
          btcPrice={btcPrice}
          marketPrices={cryptoPrices}
          cryptoHistory={cryptoHistory}
          recentTransactions={(recentTransactions ?? []) as RecentTransaction[]}
          emailVerified={profile.email_verified}
          withdrawalsEnabled={profile.withdrawals_enabled}
          btcDepositAddress={profile.btc_deposit_address}
          managerName={manager?.name ?? null}
          managerEmail={manager?.email ?? null}
        />
      </div>
    </div>
  );
}
