'use client';

import { useState } from 'react';
import { addBankAccount, updateBankAccount, deleteBankAccount } from '@/app/actions/bank-accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function maskAccount(account: string): string {
  const digits = account.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return `****${digits.slice(-4)}`;
}

const BANK_COUNTRIES = [
  { value: '', label: 'Select country (optional)' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'IE', label: 'Ireland' },
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgium' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'PL', label: 'Poland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'OTHER', label: 'Other' },
];

const COUNTRY_NAMES: Record<string, string> = Object.fromEntries(
  BANK_COUNTRIES.filter((c) => c.value).map((c) => [c.value, c.label])
);

type BankAccountRow = {
  id: string;
  bank_name: string;
  bank_account: string;
  bank_routing: string | null;
  account_holder_name: string | null;
  is_primary: boolean;
  country: string | null;
  swift_bic: string | null;
  iban: string | null;
  branch_code: string | null;
  created_at: string;
};

export function BankingSection({ bankAccounts }: { bankAccounts: BankAccountRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  const refresh = () => router.refresh();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Banking information</h2>
        {!adding && (
          <Button type="button" size="sm" onClick={() => setAdding(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Add bank account
          </Button>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Add bank accounts for Canada, Australia, New Zealand, Europe, and other regions. Used for withdrawals. We email you when you add, edit, or remove an account.
      </p>

      {adding && (
        <BankAccountForm
          onSuccess={() => {
            setAdding(false);
            toast.success('Bank account added. Confirmation email sent.');
            refresh();
          }}
          onCancel={() => setAdding(false)}
          mode="add"
        />
      )}

      <ul className="mt-6 space-y-4">
        {bankAccounts.map((acc) => (
          <li key={acc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            {editingId === acc.id ? (
              <BankAccountForm
                initial={acc}
                onSuccess={() => {
                  setEditingId(null);
                  toast.success('Bank account updated. Confirmation email sent.');
                  refresh();
                }}
                onCancel={() => setEditingId(null)}
                mode="edit"
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {acc.bank_name}
                    {acc.country && COUNTRY_NAMES[acc.country] && (
                      <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                        ({COUNTRY_NAMES[acc.country]})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Account ending in {maskAccount(acc.bank_account)}
                    {acc.bank_routing && ` · Routing/BSB/Sort: ${acc.bank_routing}`}
                    {acc.branch_code && ` · Branch: ${acc.branch_code}`}
                    {acc.swift_bic && ` · SWIFT/BIC: ${acc.swift_bic}`}
                    {acc.iban && ` · IBAN: ${acc.iban.slice(0, 8)}…`}
                  </p>
                  {acc.is_primary && (
                    <span className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(acc.id)} className="gap-1">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <DeleteBankButton
                    bankName={acc.bank_name}
                    accountLast4={maskAccount(acc.bank_account)}
                    onConfirm={async () => {
                      const r = await deleteBankAccount(acc.id);
                      if (r?.error && '_form' in r.error) toast.error(r.error._form[0]);
                      else {
                        toast.success('Bank account removed. Confirmation email sent.');
                        refresh();
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {bankAccounts.length === 0 && !adding && (
        <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No bank accounts yet. Add one to use when requesting withdrawals.
        </p>
      )}
    </div>
  );
}

function BankAccountForm({
  initial,
  onSuccess,
  onCancel,
  mode,
}: {
  initial?: BankAccountRow;
  onSuccess: () => void;
  onCancel: () => void;
  mode: 'add' | 'edit';
}) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      bank_name: (form.elements.namedItem('bank_name') as HTMLInputElement).value.trim(),
      bank_account: (form.elements.namedItem('bank_account') as HTMLInputElement).value.trim(),
      bank_routing: (form.elements.namedItem('bank_routing') as HTMLInputElement).value.trim() || undefined,
      account_holder_name: (form.elements.namedItem('account_holder_name') as HTMLInputElement).value.trim() || undefined,
      is_primary: (form.elements.namedItem('is_primary') as HTMLInputElement).checked,
      country: (form.elements.namedItem('country') as HTMLSelectElement).value.trim() || undefined,
      swift_bic: (form.elements.namedItem('swift_bic') as HTMLInputElement).value.trim() || undefined,
      iban: (form.elements.namedItem('iban') as HTMLInputElement).value.trim() || undefined,
      branch_code: (form.elements.namedItem('branch_code') as HTMLInputElement).value.trim() || undefined,
    };
    const result = mode === 'add'
      ? await addBankAccount(data)
      : await updateBankAccount(initial!.id, data);
    setLoading(false);
    if (result?.error && '_form' in result.error) {
      toast.error(result.error._form[0]);
      return;
    }
    if (result?.success) onSuccess();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Country</span>
        <select
          name="country"
          defaultValue={initial?.country ?? ''}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        >
          {BANK_COUNTRIES.map((c) => (
            <option key={c.value || 'none'} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <Input
        name="bank_name"
        placeholder="Bank name"
        defaultValue={initial?.bank_name}
        required
        maxLength={200}
      />
      <Input
        name="bank_account"
        placeholder="Account number"
        defaultValue={initial?.bank_account}
        required
        maxLength={100}
      />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Routing / BSB / Sort code / Transit (optional)
        </span>
        <Input
          name="bank_routing"
          placeholder="e.g. routing, BSB, sort code, institution + transit"
          defaultValue={initial?.bank_routing ?? ''}
          maxLength={80}
        />
      </label>
      <Input
        name="branch_code"
        placeholder="Branch code (optional)"
        defaultValue={initial?.branch_code ?? ''}
        maxLength={20}
      />
      <Input
        name="swift_bic"
        placeholder="SWIFT / BIC (optional)"
        defaultValue={initial?.swift_bic ?? ''}
        maxLength={20}
      />
      <Input
        name="iban"
        placeholder="IBAN (optional, Europe etc.)"
        defaultValue={initial?.iban ?? ''}
        maxLength={40}
      />
      <Input
        name="account_holder_name"
        placeholder="Account holder name (optional)"
        defaultValue={initial?.account_holder_name ?? ''}
        maxLength={200}
      />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="is_primary" defaultChecked={initial?.is_primary ?? false} className="rounded border-slate-300" />
        <span className="text-sm text-slate-700 dark:text-slate-300">Set as primary</span>
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Saving…' : mode === 'add' ? 'Add account' : 'Save changes'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function DeleteBankButton({
  bankName,
  accountLast4,
  onConfirm,
}: {
  bankName: string;
  accountLast4: string;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)} className="gap-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-600 dark:text-slate-400">Remove {bankName} …{accountLast4}?</span>
      <Button type="button" size="sm" variant="outline" onClick={onConfirm} className="text-red-600 hover:bg-red-50 dark:text-red-400">
        Yes, remove
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
    </div>
  );
}
