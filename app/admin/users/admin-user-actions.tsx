'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  assignBtcAddress,
  removeBtcAddress,
  assignManager,
  setWithdrawalsEnabled,
  creditBalance,
  debitBalance,
} from '@/app/actions/admin';
import { toast } from 'sonner';

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface AdminUserActionsProps {
  profileId: string;
  hasAddress: boolean;
  withdrawalsEnabled: boolean;
  managers: Manager[];
  currentManagerId: string;
}

export function AdminUserActions({
  profileId,
  hasAddress,
  withdrawalsEnabled,
  managers,
  currentManagerId,
}: AdminUserActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCredit, setShowCredit] = useState(false);
  const [showDebit, setShowDebit] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [debitAmount, setDebitAmount] = useState('');
  const [debitNote, setDebitNote] = useState('');

  async function handleAssignAddress() {
    setLoading('address');
    const r = await assignBtcAddress(profileId);
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else toast.success('Address assigned');
  }

  async function handleToggleWithdrawals() {
    setLoading('withdraw');
    const r = await setWithdrawalsEnabled(profileId, !withdrawalsEnabled);
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else toast.success(withdrawalsEnabled ? 'Withdrawals locked' : 'Withdrawals enabled');
  }

  async function handleAssignManager(managerId: string) {
    if (!managerId) return;
    setLoading('manager');
    const r = await assignManager(profileId, managerId);
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else toast.success('Manager assigned');
  }

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    setLoading('credit');
    const r = await creditBalance({ profileId, amountBtc: creditAmount, note: creditNote });
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('Balance credited; user will receive an email.');
      setShowCredit(false);
      setCreditAmount('');
      setCreditNote('');
    }
  }

  async function handleRemoveAddress() {
    setLoading('remove');
    const r = await removeBtcAddress(profileId);
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else toast.success('Address removed; user notified by email.');
  }

  async function handleDebit(e: React.FormEvent) {
    e.preventDefault();
    setLoading('debit');
    const r = await debitBalance({ profileId, amountBtc: debitAmount, note: debitNote });
    setLoading(null);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('Balance debited; user notified by email.');
      setShowDebit(false);
      setDebitAmount('');
      setDebitNote('');
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {!hasAddress && (
        <Button size="sm" variant="outline" onClick={handleAssignAddress} disabled={!!loading}>
          {loading === 'address' ? '...' : 'Assign BTC address'}
        </Button>
      )}
      {hasAddress && (
        <Button size="sm" variant="outline" onClick={handleRemoveAddress} disabled={!!loading} className="text-amber-600 hover:text-amber-700">
          {loading === 'remove' ? '...' : 'Remove address'}
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={handleToggleWithdrawals} disabled={!!loading}>
        {loading === 'withdraw' ? '...' : withdrawalsEnabled ? 'Lock withdrawals' : 'Enable withdrawals'}
      </Button>
      <select
        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        value={currentManagerId}
        onChange={(e) => handleAssignManager(e.target.value)}
        disabled={!!loading}
      >
        <option value="">No manager</option>
        {managers.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      {showCredit ? (
        <form onSubmit={handleCredit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="BTC amount"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            className="w-24 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Note"
            value={creditNote}
            onChange={(e) => setCreditNote(e.target.value)}
            className="w-24 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <Button type="submit" size="sm" disabled={!!loading || !creditAmount}>Credit</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowCredit(false)}>Cancel</Button>
        </form>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => { setShowCredit(true); setShowDebit(false); }}>Credit balance</Button>
      )}
      {showDebit ? (
        <form onSubmit={handleDebit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="BTC amount"
            value={debitAmount}
            onChange={(e) => setDebitAmount(e.target.value)}
            className="w-24 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Note"
            value={debitNote}
            onChange={(e) => setDebitNote(e.target.value)}
            className="w-24 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <Button type="submit" size="sm" variant="danger" disabled={!!loading || !debitAmount}>Debit</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowDebit(false)}>Cancel</Button>
        </form>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => { setShowDebit(true); setShowCredit(false); }}>Debit balance</Button>
      )}
    </div>
  );
}
