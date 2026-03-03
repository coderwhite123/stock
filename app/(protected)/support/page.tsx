import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { SupportTicketForm } from './support-ticket-form';
import { MessageCircle, Plus } from 'lucide-react';

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) redirect('/login');

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('id, subject, status, created_at, updated_at')
    .eq('profile_id', profile.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Open a ticket or view your existing conversations.
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Plus className="h-5 w-5" />
          New ticket
        </h2>
        <SupportTicketForm />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 font-medium text-slate-900 dark:border-slate-800 dark:text-white">
          <MessageCircle className="h-5 w-5" />
          Your tickets
        </h2>
        <div className="overflow-x-auto">
          {tickets?.length ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tickets.map((t: Record<string, unknown>) => (
                  <tr key={t.id as string}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.subject as string}</td>
                    <td className="px-4 py-3">
                      {t.status === 'open' && <Badge variant="warning">Open</Badge>}
                      {t.status === 'answered' && <Badge variant="info">Answered</Badge>}
                      {t.status === 'closed' && <Badge variant="default">Closed</Badge>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(t.updated_at as string)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/support/${t.id}`} className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No tickets yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
