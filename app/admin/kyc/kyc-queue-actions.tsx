'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { approveKycDocument, rejectKycDocument, getKycDocumentViewUrl } from '@/app/actions/admin';
import { toast } from 'sonner';
import { Eye, Check, X } from 'lucide-react';

export function KycQueueActions({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  async function handleView() {
    setLoading('view');
    const r = await getKycDocumentViewUrl(documentId);
    setLoading(null);
    if (r?.url) window.open(r.url, '_blank');
    else toast.error(r?.error || 'Could not open document');
  }

  async function handleApprove() {
    setLoading('approve');
    const r = await approveKycDocument(documentId);
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('KYC approved. User has been notified by email.');
      window.location.reload();
    }
  }

  async function handleReject() {
    setLoading('reject');
    const r = await rejectKycDocument(documentId, rejectReason || undefined);
    setLoading(null);
    setShowReject(false);
    setRejectReason('');
    if (r?.error) toast.error(r.error);
    else {
      toast.success('KYC rejected.');
      window.location.reload();
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleView}
        disabled={!!loading}
      >
        <Eye className="mr-1 h-4 w-4" />
        View
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={handleApprove}
        disabled={!!loading}
      >
        <Check className="mr-1 h-4 w-4" />
        Approve
      </Button>
      {!showReject ? (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setShowReject(true)}
          disabled={!!loading}
        >
          <X className="mr-1 h-4 w-4" />
          Reject
        </Button>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <div className="flex gap-1">
            <Button variant="danger" size="sm" onClick={handleReject} disabled={!!loading}>
              Confirm reject
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowReject(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
