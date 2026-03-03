import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';
import { getBtcPriceUsd } from '@/services/blockchain';
import { logUserActivity } from '@/services/activity';

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

  const btcPrice = await getBtcPriceUsd();
  const balanceBtc = parseFloat(profile.btc_balance || '0');
  const balanceUsd = balanceBtc * btcPrice;
  const managersData = profile.managers as { id: string; name: string; email: string } | { id: string; name: string; email: string }[] | null;
  const manager = Array.isArray(managersData) ? managersData[0] ?? null : managersData ?? null;

  await logUserActivity('dashboard_view');

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Welcome back, {profile.full_name}
        </p>
      </div>

      <DashboardClient
        profileId={profile.id}
        balanceBtc={profile.btc_balance ?? '0'}
        balanceUsd={balanceUsd}
        btcPrice={btcPrice}
        emailVerified={profile.email_verified}
        withdrawalsEnabled={profile.withdrawals_enabled}
        btcDepositAddress={profile.btc_deposit_address}
        managerName={manager?.name ?? null}
        managerEmail={manager?.email ?? null}
      />
    </div>
  );
}
