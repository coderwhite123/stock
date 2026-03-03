import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TransactionsTable } from './transactions-table';
import { formatDate } from '@/lib/utils';
import type { Transaction } from '@/types';

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/login');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  const rows = (transactions || []).map((t: Transaction) => ({
    ...t,
    created_at: formatDate(t.created_at),
  }));

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          All your deposits and withdrawals
        </p>
      </div>
      <TransactionsTable transactions={rows} />
    </div>
  );
}
