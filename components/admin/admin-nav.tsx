'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  UserPlus,
  Wallet,
  ArrowLeftRight,
  FileText,
  Shield,
  Activity,
  ShieldCheck,
  MessageCircle,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/admin" className="font-bold text-slate-900 dark:text-white" onClick={() => setOpen(false)}>
          Admin
        </Link>
      </div>
      {open && (
        <nav className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Back to dashboard
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
