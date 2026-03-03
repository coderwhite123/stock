import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { AdminUserActions } from './admin-user-actions';
import { formatDate } from '@/lib/utils';

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      phone,
      role,
      email_verified,
      btc_balance,
      btc_deposit_address,
      withdrawals_enabled,
      manager_id,
      created_at,
      managers ( id, name, email )
    `)
    .order('created_at', { ascending: false });

  const { data: managers } = await admin.from('managers').select('id, name, email').order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Assign BTC address, manager, and control withdrawals
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">BTC / Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Manager</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {(profiles || []).map((p: Record<string, unknown>) => (
                <tr key={p.id as string} className="bg-white dark:bg-slate-900">
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{p.full_name as string}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{p.email as string}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.email_verified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Unverified</Badge>}
                      {p.withdrawals_enabled ? <Badge variant="info">Withdraw OK</Badge> : <Badge variant="default">Withdraw locked</Badge>}
                    </div>
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {p.btc_balance as string} BTC
                    {p.btc_deposit_address ? (
                      <span className="block truncate text-xs text-slate-500">{p.btc_deposit_address as string}</span>
                    ) : (
                      <span className="block text-xs text-amber-600">No address</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {(p.managers as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(p.created_at as string)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <AdminUserActions
                      profileId={p.id as string}
                      hasAddress={!!p.btc_deposit_address}
                      withdrawalsEnabled={!!p.withdrawals_enabled}
                      managers={managers || []}
                      currentManagerId={(p.manager_id as string) || ''}
                    />
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
