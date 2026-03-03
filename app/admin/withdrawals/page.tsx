import { createAdminClient } from '@/lib/supabase/admin';
import { WithdrawalActions } from './withdrawal-actions';
import { formatDate, formatBtc } from '@/lib/utils';

export default async function AdminWithdrawalsPage() {
  const admin = createAdminClient();

  const { data: requests } = await admin
    .from('withdrawal_requests')
    .select(`
      id,
      amount_btc,
      amount_usd,
      status,
      bank_name,
      bank_account,
      bank_routing,
      created_at,
      profiles ( id, full_name, email )
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Withdrawal requests</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Approve or reject withdrawal requests
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">User</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Bank</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {(requests || []).map((r: Record<string, unknown>) => (
                <tr key={r.id as string} className="bg-white dark:bg-slate-900">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{(r.profiles as { full_name: string })?.full_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{(r.profiles as { email: string })?.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400">
                    {formatBtc(r.amount_btc as string)} BTC
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {r.bank_name as string} • {String(r.bank_account).slice(-4)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm capitalize text-slate-600 dark:text-slate-400">{r.status as string}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(r.created_at as string)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {(r.status as string) === 'pending' && (
                      <WithdrawalActions requestId={r.id as string} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
