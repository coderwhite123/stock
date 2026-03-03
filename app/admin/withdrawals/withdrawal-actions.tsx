'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { approveWithdrawal, rejectWithdrawal } from '@/app/actions/admin';
import { toast } from 'sonner';

export function WithdrawalActions({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  async function handleApprove() {
    setLoading('approve');
    const r = await approveWithdrawal(requestId);
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else toast.success('Withdrawal approved');
  }

  async function handleReject() {
    setLoading('reject');
    const r = await rejectWithdrawal(requestId, rejectReason || undefined);
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('Withdrawal rejected');
      setRejectReason('');
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={handleApprove} disabled={!!loading}>
        {loading === 'approve' ? '...' : 'Approve'}
      </Button>
      <input
        type="text"
        placeholder="Reject reason (optional)"
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        className="w-32 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
      <Button size="sm" variant="danger" onClick={handleReject} disabled={!!loading}>
        {loading === 'reject' ? '...' : 'Reject'}
      </Button>
    </div>
  );
}
