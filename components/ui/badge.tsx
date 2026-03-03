import { cn } from '@/lib/utils';

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200': variant === 'default',
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': variant === 'success',
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': variant === 'warning',
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': variant === 'error',
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
