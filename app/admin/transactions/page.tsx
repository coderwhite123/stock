import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { formatBtc, formatUsd, formatDate } from '@/lib/utils';
import { AddTransactionForm } from './add-transaction-form';

export default async function AdminTransactionsPage() {
  const admin = createAdminClient();

  const { data: transactions } = await admin
    .from('transactions')
    .select(`
      id,
      profile_id,
      type,
      amount_btc,
      amount_usd,
      status,
      tx_hash,
      created_at,
      profiles ( full_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const { data: profiles } = await admin.from('profiles').select('id, full_name').order('full_name');

  const statusVariant = (s: string) => {
    if (s === 'confirmed' || s === 'completed') return 'success';
    if (s === 'pending') return 'warning';
    return 'default';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All transactions</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        View and add transaction records
      </p>

      <AddTransactionForm profiles={profiles || []} />

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {(transactions || []).map((t: Record<string, unknown>) => (
                <tr key={t.id as string} className="bg-white dark:bg-slate-900">
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {(t.profiles as { full_name: string })?.full_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm capitalize text-slate-600 dark:text-slate-400">{t.type as string}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400">
                    {formatBtc(t.amount_btc as string)} / {formatUsd(t.amount_usd as string | number | null)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={statusVariant(t.status as string)}>{t.status as string}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(t.created_at as string)}</td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{t.tx_hash as string || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
