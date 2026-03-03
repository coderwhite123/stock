import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Users, Wallet, ArrowLeftRight, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminPage() {
  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: pendingWithdrawals },
    { data: transactions },
    { data: auditLogs },
    { data: btcInRows },
    { data: btcOutRows },
    { data: recentSignups },
  ] = await Promise.all([
    admin.from('profiles').select('id').eq('role', 'user'),
    admin.from('withdrawal_requests').select('id, amount_btc').eq('status', 'pending'),
    admin.from('transactions').select('id'),
    admin.from('audit_logs').select('id'),
    admin.from('transactions').select('amount_btc').in('type', ['deposit', 'credit']),
    admin.from('withdrawal_requests').select('amount_btc').eq('status', 'approved'),
    admin.from('profiles').select('id, full_name, email, created_at').eq('role', 'user').order('created_at', { ascending: false }).limit(8),
  ]);

  const totalBtcIn = (btcInRows || []).reduce((s, r) => s + parseFloat(String(r.amount_btc || 0)), 0);
  const totalBtcOut = (btcOutRows || []).reduce((s, r) => s + parseFloat(String(r.amount_btc || 0)), 0);
  const pendingCount = pendingWithdrawals?.length ?? 0;
  const pendingBtc = (pendingWithdrawals || []).reduce((s, r) => s + parseFloat(String(r.amount_btc || 0)), 0);

  const cards = [
    { href: '/admin/users', label: 'Total users', value: profiles?.length ?? 0, icon: Users },
    { href: '/admin/withdrawals', label: 'Pending withdrawals', value: pendingCount, sub: `${pendingBtc.toFixed(8)} BTC`, icon: Wallet },
    { href: '/admin/transactions', label: 'BTC in (deposits + credits)', value: `${totalBtcIn.toFixed(8)}`, icon: TrendingUp },
    { href: '/admin/transactions', label: 'BTC out (approved)', value: `${totalBtcOut.toFixed(8)}`, icon: TrendingDown },
    { href: '/admin/transactions', label: 'Transactions', value: transactions?.length ?? 0, icon: ArrowLeftRight },
    { href: '/admin/audit', label: 'Audit logs', value: auditLogs?.length ?? 0, icon: FileText },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin overview</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        KPIs, recent signups, and quick links
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href + card.label}
              href={card.href}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800 sm:p-6"
            >
              <Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
              {'sub' in card && card.sub && <p className="mt-1 text-xs text-slate-400">{card.sub}</p>}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          Recent signups
        </h2>
        <div className="overflow-x-auto">
          {recentSignups?.length ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {recentSignups.map((p: Record<string, unknown>) => (
                  <tr key={p.id as string} className="bg-white dark:bg-slate-900">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{p.full_name as string}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{p.email as string}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(p.created_at as string)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/admin/users?highlight=${p.id}`} className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
