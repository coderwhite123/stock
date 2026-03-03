'use client';

import { useState } from 'react';
import { submitWithdrawalRequest } from '@/app/actions/withdrawal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type SavedBank = {
  id: string;
  bank_name: string;
  bank_account: string;
  bank_routing: string | null;
  is_primary: boolean;
  country?: string | null;
  swift_bic?: string | null;
  iban?: string | null;
  branch_code?: string | null;
  account_holder_name?: string | null;
};

function maskLast4(account: string): string {
  const digits = account.replace(/\D/g, '');
  return digits.slice(-4) || '****';
}

const COUNTRY_NAMES: Record<string, string> = {
  CA: 'Canada',
  AU: 'Australia',
  NZ: 'New Zealand',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  ES: 'Spain',
  IT: 'Italy',
  IE: 'Ireland',
  AT: 'Austria',
  BE: 'Belgium',
  CH: 'Switzerland',
  PT: 'Portugal',
  PL: 'Poland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  OTHER: 'Other',
};

function bankAccountLabel(b: SavedBank): string {
  const parts = [b.bank_name];
  if (b.country && COUNTRY_NAMES[b.country]) parts.push(`(${COUNTRY_NAMES[b.country]})`);
  parts.push(`…${maskLast4(b.bank_account)}`);
  if (b.is_primary) parts.push('— Primary');
  return parts.join(' ');
}

interface WithdrawFormProps {
  balanceBtc: string;
  btcPriceUsd: number;
  canWithdraw: boolean;
  unpaidFeesCount: number;
  savedBankAccounts: SavedBank[];
}

export function WithdrawForm({ balanceBtc, btcPriceUsd, canWithdraw, unpaidFeesCount, savedBankAccounts = [] }: WithdrawFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amountInput, setAmountInput] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await submitWithdrawalRequest({
      amountBtc: formData.get('amountBtc') as string,
      bankAccountId: formData.get('bankAccountId') as string,
    });
    setLoading(false);
    if (result?.error && '_form' in result.error && result.error._form) {
      setError(result.error._form[0]);
      return;
    }
    if (result?.success) {
      setSuccess(true);
      setAmountInput('');
      (e.target as HTMLFormElement).reset();
    }
  }

  const amountNum = amountInput.trim() === '' ? NaN : parseFloat(amountInput.replace(/,/g, ''));
  const isValidAmount = !Number.isNaN(amountNum) && amountNum > 0;
  const usdValue = isValidAmount && btcPriceUsd > 0 ? (amountNum * btcPriceUsd).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;

  const hasBanks = savedBankAccounts.length > 0;
  const canSubmit = canWithdraw && hasBanks;

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-900/20">
        <p className="font-medium text-emerald-800 dark:text-emerald-200">Withdrawal request submitted.</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
          We&apos;ll review it and notify you by email.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      {!canWithdraw && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          <p className="font-medium">Withdrawals are currently disabled for your account.</p>
          {unpaidFeesCount > 0 && (
            <p className="mt-1 text-sm">Please pay required fees before submitting a withdrawal.</p>
          )}
          {canWithdraw === false && unpaidFeesCount === 0 && (
            <p className="mt-1 text-sm">An admin must approve withdrawals first.</p>
          )}
        </div>
      )}

      {canWithdraw && !hasBanks && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="font-medium text-slate-800 dark:text-slate-200">Add a bank account first</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Withdrawals use the bank accounts you save in your profile. Add at least one in{' '}
            <Link href="/profile" className="font-medium text-emerald-600 underline dark:text-emerald-400">Profile</Link> to request a withdrawal.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (BTC)</span>
          <Input
            name="amountBtc"
            type="text"
            placeholder="0.00"
            required
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
          {usdValue && (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              ≈ {usdValue} USD
            </p>
          )}
        </label>

        {hasBanks && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Withdraw to</span>
            <select
              name="bankAccountId"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Select a bank account</option>
              {savedBankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {bankAccountLabel(b)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage bank accounts in <Link href="/profile" className="underline">Profile</Link>.
            </p>
          </label>
        )}

        <Button type="submit" disabled={!canSubmit} loading={loading}>
          Submit withdrawal request
        </Button>
      </form>
    </div>
  );
}
