'use server';

import { getCurrentUser } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendTicketReplyEmail } from '@/services/email';

const createTicketSchema = z.object({
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

export async function createSupportTicket(input: z.infer<typeof createTicketSchema>) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };
  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid input' };

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return { error: 'Profile not found' };

  const admin = createAdminClient();
  const { data: ticket, error: ticketError } = await admin.from('support_tickets').insert({
    profile_id: profile.id,
    subject: parsed.data.subject,
    status: 'open',
  }).select('id').single();

  if (ticketError || !ticket) return { error: ticketError?.message || 'Failed to create ticket' };

  const { error: msgError } = await admin.from('support_ticket_messages').insert({
    ticket_id: ticket.id,
    author_id: user.id,
    is_admin: false,
    body: parsed.data.body,
  });
  if (msgError) return { error: msgError.message };

  revalidatePath('/support');
  return { success: true, ticketId: ticket.id };
}

const replySchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().min(1).max(10000),
});

export async function replyToTicket(input: z.infer<typeof replySchema>) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid input' };

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).single();
  if (!profile) return { error: 'Profile not found' };

  const admin = createAdminClient();
  const { data: ticket } = await admin.from('support_tickets').select('id, profile_id, subject').eq('id', parsed.data.ticketId).single();
  if (!ticket) return { error: 'Ticket not found' };

  const isAdmin = profile.role === 'admin';
  if (!isAdmin && ticket.profile_id !== profile.id) return { error: 'Not allowed' };

  const { error } = await admin.from('support_ticket_messages').insert({
    ticket_id: parsed.data.ticketId,
    author_id: user.id,
    is_admin: isAdmin,
    body: parsed.data.body,
  });
  if (error) return { error: error.message };

  if (isAdmin) {
    await admin.from('support_tickets').update({ status: 'answered', updated_at: new Date().toISOString() }).eq('id', parsed.data.ticketId);
    const { data: owner } = await admin.from('profiles').select('email, full_name').eq('id', ticket.profile_id).single();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (owner?.email) {
      await sendTicketReplyEmail(
        owner.email,
        ticket.subject ?? 'Support ticket',
        parsed.data.ticketId,
        parsed.data.body,
        baseUrl,
        owner.full_name
      );
    }
  }

  revalidatePath('/support');
  revalidatePath(`/support/${parsed.data.ticketId}`);
  revalidatePath('/admin/tickets');
  revalidatePath(`/admin/tickets/${parsed.data.ticketId}`);
  return { success: true };
}

export async function updateTicketStatus(ticketId: string, status: 'open' | 'answered' | 'closed') {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const admin = createAdminClient();
  const { error } = await admin.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
  if (error) return { error: error.message };
  revalidatePath('/admin/tickets');
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}
