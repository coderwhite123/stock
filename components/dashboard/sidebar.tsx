'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Wallet, ShieldCheck, MessageCircle, LogOut, Menu, X, User } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/withdraw', label: 'Withdraw', icon: Wallet },
  { href: '/kyc', label: 'Verification (KYC)', icon: ShieldCheck },
  { href: '/support', label: 'Support', icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside
      className={cn(
        'flex w-56 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
        'md:relative md:translate-x-0 md:min-h-full md:h-screen',
        'fixed inset-y-0 left-0 z-50 h-screen transform transition-transform duration-200 ease-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800 md:justify-start">
        <Link href="/dashboard" className="font-bold text-slate-900 dark:text-white" onClick={() => setMobileOpen(false)}>
          StockTrendTracker
        </Link>
        <button
          type="button"
          className="rounded p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-800">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-slate-200 bg-white px-4 md:hidden dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/dashboard" className="ml-2 font-bold text-slate-900 dark:text-white">
          StockTrendTracker
        </Link>
      </div>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}
      {sidebar}
      <div className="h-14 shrink-0 md:hidden" />
    </>
  );
}
