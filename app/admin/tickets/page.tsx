import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default async function AdminTicketsPage() {
  const admin = createAdminClient();

  const { data: tickets } = await admin
    .from('support_tickets')
    .select('id, subject, status, created_at, updated_at, profiles ( full_name, email )')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support tickets</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        View and reply to user support requests.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          {tickets?.length ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tickets.map((t: Record<string, unknown>) => {
                  const profile = t.profiles as { full_name: string; email: string } | null;
                  return (
                    <tr key={t.id as string} className="bg-white dark:bg-slate-900">
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-slate-900 dark:text-white" title={t.subject as string}>{t.subject as string}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {profile?.full_name ?? '—'} ({profile?.email ?? '—'})
                      </td>
                      <td className="px-4 py-3">
                        {t.status === 'open' && <Badge variant="warning">Open</Badge>}
                        {t.status === 'answered' && <Badge variant="info">Answered</Badge>}
                        {t.status === 'closed' && <Badge variant="default">Closed</Badge>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(t.updated_at as string)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link href={`/admin/tickets/${t.id}`} className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">View</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No tickets.</p>
          )}
        </div>
      </div>
    </div>
  );
}
