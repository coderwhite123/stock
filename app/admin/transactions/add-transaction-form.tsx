'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addTransactionRecord } from '@/app/actions/admin';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string;
}

export function AddTransactionForm({ profiles }: { profiles: Profile[] }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    profileId: '',
    type: 'deposit' as 'deposit' | 'withdrawal' | 'credit' | 'fee',
    amountBtc: '',
    amountUsd: '',
    status: 'confirmed' as 'pending' | 'confirmed' | 'failed' | 'rejected' | 'completed',
    txHash: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await addTransactionRecord({
      profileId: form.profileId,
      type: form.type,
      amountBtc: form.amountBtc,
      amountUsd: form.amountUsd || undefined,
      status: form.status,
      txHash: form.txHash || undefined,
    });
    setLoading(false);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('Transaction added');
      setOpen(false);
      setForm({ profileId: '', type: 'deposit', amountBtc: '', amountUsd: '', status: 'confirmed', txHash: '' });
    }
  }

  if (!open) {
    return (
      <Button className="mt-4" variant="outline" onClick={() => setOpen(true)}>
        Add transaction record
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="min-w-[160px]">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">User</label>
        <select
          required
          value={form.profileId}
          onChange={(e) => setForm((f) => ({ ...f, profileId: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="">Select user</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
      </div>
      <div className="min-w-[100px]">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="deposit">deposit</option>
          <option value="withdrawal">withdrawal</option>
          <option value="credit">credit</option>
          <option value="fee">fee</option>
        </select>
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Amount BTC</label>
        <Input
          value={form.amountBtc}
          onChange={(e) => setForm((f) => ({ ...f, amountBtc: e.target.value }))}
          placeholder="0.00"
          required
        />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">USD</label>
        <Input
          value={form.amountUsd}
          onChange={(e) => setForm((f) => ({ ...f, amountUsd: e.target.value }))}
          placeholder="0"
        />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="completed">completed</option>
          <option value="failed">failed</option>
          <option value="rejected">rejected</option>
        </select>
      </div>
      <div className="w-40">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tx Hash</label>
        <Input
          value={form.txHash}
          onChange={(e) => setForm((f) => ({ ...f, txHash: e.target.value }))}
          placeholder="Optional"
        />
      </div>
      <Button type="submit" disabled={loading}>Add</Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    </form>
  );
}
