import { createAdminClient } from '@/lib/supabase/admin';
import { AddManagerForm } from './add-manager-form';
import { DeleteManagerButtonClient } from './delete-manager-button';
import { formatDate } from '@/lib/utils';

export default async function AdminManagersPage() {
  const admin = createAdminClient();
  const { data: managers } = await admin.from('managers').select('id, name, email, phone, created_at').order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Managers</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Add and manage refund managers. Assign them to users from the Users page.
      </p>

      <AddManagerForm />

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Added</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {(managers || []).map((m: Record<string, unknown>) => (
                <tr key={m.id as string} className="bg-white dark:bg-slate-900">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">{m.name as string}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{m.email as string}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{m.phone as string || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(m.created_at as string)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <DeleteManagerButtonClient managerId={m.id as string} managerName={m.name as string} />
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

