import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils';

export default async function AdminActivityPage() {
  const admin = createAdminClient();

  const { data: logs } = await admin
    .from('user_activity_logs')
    .select(`
      id,
      action,
      details,
      ip_address,
      created_at,
      profiles ( full_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User activity</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Recent user actions
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {(logs || []).map((log: Record<string, unknown>) => (
                <tr key={log.id as string} className="bg-white dark:bg-slate-900">
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {(log.profiles as { full_name: string; email: string })?.full_name}
                    <span className="block text-xs text-slate-500">{(log.profiles as { email: string })?.email}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{log.action as string}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(log.created_at as string)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
