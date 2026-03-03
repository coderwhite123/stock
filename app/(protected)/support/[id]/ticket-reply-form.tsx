'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { replyToTicket } from '@/app/actions/support';
import { toast } from 'sonner';

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = (e.currentTarget.elements.namedItem('body') as HTMLTextAreaElement).value.trim();
    if (!body) {
      toast.error('Please enter a message.');
      return;
    }
    setLoading(true);
    const r = await replyToTicket({ ticketId, body });
    setLoading(false);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('Reply sent.');
      window.location.reload();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Your reply</span>
        <textarea
          name="body"
          rows={3}
          maxLength={10000}
          placeholder="Type your message..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </label>
      <Button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reply'}</Button>
    </form>
  );
}
