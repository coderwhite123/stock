'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateTicketStatus } from '@/app/actions/support';
import { toast } from 'sonner';

export function TicketStatusForm({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  async function setStatus(status: 'open' | 'answered' | 'closed') {
    setLoading(true);
    const r = await updateTicketStatus(ticketId, status);
    setLoading(false);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('Status updated.');
      window.location.reload();
    }
  }

  return (
    <div className="flex gap-1">
      {currentStatus !== 'open' && (
        <Button variant="outline" size="sm" onClick={() => setStatus('open')} disabled={loading}>Open</Button>
      )}
      {currentStatus !== 'answered' && (
        <Button variant="outline" size="sm" onClick={() => setStatus('answered')} disabled={loading}>Answered</Button>
      )}
      {currentStatus !== 'closed' && (
        <Button variant="outline" size="sm" onClick={() => setStatus('closed')} disabled={loading}>Close</Button>
      )}
    </div>
  );
}
