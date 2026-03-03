'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '';
  const verified = searchParams.get('verified') === '1';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
    setLoading(false);
    if (result?.error && '_form' in result.error && result.error._form) {
      setError(result.error._form[0]);
      return;
    }
    router.push(redirect || '/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Access your recovery dashboard
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {verified && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              Email verified. You can sign in now.
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign in
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
