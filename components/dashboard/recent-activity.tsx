import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatBtc, formatDate, formatUsd } from '@/lib/utils';

export interface RecentTransaction {
  id: string;
  type: string;
  amount_btc: string;
  amount_usd: string | null;
  status: string;
  created_at: string;
  tx_hash: string | null;
}

function statusVariant(status: string) {
  if (status === 'confirmed' || status === 'completed') return 'success' as const;
  if (status === 'pending') return 'warning' as const;
  if (status === 'failed' || status === 'rejected') return 'error' as const;
  return 'default' as const;
}

export function RecentActivity({ transactions }: { transactions: RecentTransaction[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6"><div><h2 className="font-semibold text-slate-950 dark:text-white">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Your latest account movements</p></div><Link href="/transactions" className="text-sm font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-400">View all</Link></div>
      {transactions.length ? <div className="divide-y divide-slate-200 dark:divide-slate-800">{transactions.map((transaction) => { const isDeposit = transaction.type === 'deposit' || transaction.type === 'credit'; const Icon = isDeposit ? ArrowDownLeft : transaction.type === 'withdrawal' ? ArrowUpRight : CircleDollarSign; return <div key={transaction.id} className="flex items-center gap-3 px-5 py-4 sm:px-6"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isDeposit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold capitalize text-slate-900 dark:text-white">{transaction.type}</p><p className="mt-0.5 text-xs text-slate-500">{formatDate(transaction.created_at)}</p></div><div className="text-right"><p className="text-sm font-semibold text-slate-900 dark:text-white">{formatBtc(transaction.amount_btc)} BTC</p><p className="mt-0.5 text-xs text-slate-500">{formatUsd(transaction.amount_usd)}</p></div><Badge variant={statusVariant(transaction.status)}>{transaction.status}</Badge>{transaction.tx_hash && <a href={`https://mempool.space/tx/${transaction.tx_hash}`} target="_blank" rel="noopener noreferrer" aria-label="View transaction" className="text-slate-400 hover:text-orange-500"><ExternalLink className="h-4 w-4" /></a>}</div>; })}</div> : <div className="px-6 py-10 text-center text-sm text-slate-500">No transactions yet.</div>}
    </section>
  );
}