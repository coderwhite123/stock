'use client';

import { Badge } from '@/components/ui/badge';
import { formatBtc, formatUsd } from '@/lib/utils';
import type { Transaction } from '@/types';

export function TransactionsTable({ transactions }: { transactions: (Transaction & { created_at: string })[] }) {
  if (!transactions.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">No transactions yet.</p>
      </div>
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount (BTC)</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">USD value</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Tx Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {transactions.map((tx) => (
              <tr key={tx.id} className="bg-white dark:bg-slate-900">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium capitalize text-slate-900 dark:text-white">{tx.type}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400">{formatBtc(tx.amount_btc)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400">{formatUsd(tx.amount_usd)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{tx.created_at}</td>
                <td className="max-w-[120px] truncate px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {tx.tx_hash ? (
                    <a
                      href={`https://mempool.space/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      {tx.tx_hash}
                    </a>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
