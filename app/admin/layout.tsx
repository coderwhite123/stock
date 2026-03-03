import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, UserPlus, Wallet, ArrowLeftRight, FileText, Shield, Activity, ShieldCheck, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const nav = [
    { href: '/admin', label: 'Overview', icon: Shield },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/managers', label: 'Managers', icon: UserPlus },
    { href: '/admin/kyc', label: 'KYC queue', icon: ShieldCheck },
    { href: '/admin/withdrawals', label: 'Withdrawals', icon: Wallet },
    { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/admin/tickets', label: 'Support tickets', icon: MessageCircle },
    { href: '/admin/activity', label: 'User activity', icon: Activity },
    { href: '/admin/audit', label: 'Audit logs', icon: FileText },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 md:flex-row md:overflow-hidden">
      <AdminNav />
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800">
          <Link href="/admin" className="font-bold text-slate-900 dark:text-white">
            Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Back to dashboard
          </Link>
        </div>
      </aside>
      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
