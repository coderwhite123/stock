import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { TicketReplyForm } from './ticket-reply-form';
import { TicketStatusForm } from './ticket-status-form';

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: ticket } = await admin
    .from('support_tickets')
    .select('id, subject, status, created_at, profile_id, profiles ( full_name, email )')
    .eq('id', id)
    .single();

  if (!ticket) notFound();

  const { data: messages } = await admin
    .from('support_ticket_messages')
    .select('id, body, is_admin, created_at')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  const profileRaw = ticket.profiles;
  const profile = Array.isArray(profileRaw) ? profileRaw[0] ?? null : (profileRaw as { full_name: string; email: string } | null);

  return (
    <div className="p-0 md:p-0">
      <div className="mb-6">
        <Link href="/admin/tickets" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">← Back to tickets</Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.subject}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {profile?.full_name} — {profile?.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ticket.status === 'open' && <Badge variant="warning">Open</Badge>}
          {ticket.status === 'answered' && <Badge variant="info">Answered</Badge>}
          {ticket.status === 'closed' && <Badge variant="default">Closed</Badge>}
          <TicketStatusForm ticketId={id} currentStatus={ticket.status} />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:p-6">
        {(messages || []).map((m: Record<string, unknown>) => (
          <div
            key={m.id as string}
            className={`rounded-lg p-4 ${m.is_admin ? 'bg-slate-100 dark:bg-slate-800' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}
          >
            <div className="mb-1 flex items-center gap-2 text-sm">
              <span className="font-medium">{m.is_admin ? 'Support' : 'User'}</span>
              <span className="text-slate-500 dark:text-slate-400">{formatDate(m.created_at as string)}</span>
            </div>
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{m.body as string}</p>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <TicketReplyForm ticketId={id} />
        </div>
      )}
    </div>
  );
}
