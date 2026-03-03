import { createAdminClient } from '@/lib/supabase/admin';
import { KycQueueActions } from './kyc-queue-actions';
import { formatDate } from '@/lib/utils';

export default async function AdminKycPage() {
  const admin = createAdminClient();

  const { data: pending } = await admin
    .from('kyc_documents')
    .select('id, file_path, document_type, status, created_at, profiles ( id, full_name, email )')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">KYC review queue</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Review and approve or reject identity document uploads.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          {pending?.length ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {pending.map((row: Record<string, unknown>) => {
                  const profile = row.profiles as { id: string; full_name: string; email: string } | null;
                  return (
                    <tr key={row.id as string} className="bg-white dark:bg-slate-900">
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{profile?.full_name ?? '—'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">Government ID</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(row.created_at as string)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <KycQueueActions documentId={row.id as string} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No pending KYC documents.</p>
          )}
        </div>
      </div>
    </div>
  );
}
