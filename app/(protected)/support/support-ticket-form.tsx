'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createSupportTicket } from '@/app/actions/support';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SupportTicketForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const subject = (form.elements.namedItem('subject') as HTMLInputElement).value.trim();
    const body = (form.elements.namedItem('body') as HTMLTextAreaElement).value.trim();
    if (!subject || !body) {
      toast.error('Please fill subject and message.');
      return;
    }
    setLoading(true);
    const r = await createSupportTicket({ subject, body });
    setLoading(false);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('Ticket created.');
      form.reset();
      if (r.ticketId) router.push(`/support/${r.ticketId}`);
      else router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</span>
        <input
          type="text"
          name="subject"
          maxLength={500}
          placeholder="Brief description"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</span>
        <textarea
          name="body"
          rows={4}
          maxLength={10000}
          placeholder="Describe your issue or question..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </label>
      <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create ticket'}</Button>
    </form>
  );
}
