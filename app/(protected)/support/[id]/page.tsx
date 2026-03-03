import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { TicketReplyForm } from './ticket-reply-form';

export default async function SupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data: profile } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).single();
  if (!profile) redirect('/login');

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id, subject, status, created_at, profile_id')
    .eq('id', id)
    .single();

  if (!ticket || (ticket.profile_id !== profile.id && profile.role !== 'admin')) notFound();

  const { data: messages } = await supabase
    .from('support_ticket_messages')
    .select('id, body, is_admin, created_at')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  const canReply = ticket.status !== 'closed' && (profile.role === 'admin' || ticket.profile_id === profile.id);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <Link href="/support" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">← Back to Support</Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.subject}</h1>
        {ticket.status === 'open' && <Badge variant="warning">Open</Badge>}
        {ticket.status === 'answered' && <Badge variant="info">Answered</Badge>}
        {ticket.status === 'closed' && <Badge variant="default">Closed</Badge>}
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:p-6">
        {(messages || []).map((m: Record<string, unknown>) => (
          <div
            key={m.id as string}
            className={`rounded-lg p-4 ${m.is_admin ? 'bg-slate-100 dark:bg-slate-800' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}
          >
            <div className="mb-1 flex items-center gap-2 text-sm">
              <span className="font-medium">{m.is_admin ? 'Support' : 'You'}</span>
              <span className="text-slate-500 dark:text-slate-400">{formatDate(m.created_at as string)}</span>
            </div>
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{m.body as string}</p>
          </div>
        ))}
      </div>

      {canReply && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <TicketReplyForm ticketId={id} />
        </div>
      )}
    </div>
  );
}
