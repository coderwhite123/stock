'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signup } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signup({
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      password: formData.get('password') as string,
    });
    setLoading(false);
    if (result?.error && '_form' in result.error && result.error._form) {
      setError(result.error._form[0]);
      return;
    }
    if (result?.error) {
      const first = Object.values(result.error).flat().find(Boolean);
      if (first) setError(Array.isArray(first) ? first[0] : String(first));
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Join StockTrendTracker to track your recovery
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <Input name="fullName" placeholder="Full name" required autoComplete="name" />
          <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone (e.g. +1234567890)"
            required
            autoComplete="tel"
          />
          <Input name="address" placeholder="Address" required autoComplete="street-address" />
          <Input
            name="password"
            type="password"
            placeholder="Password (min 8 characters)"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign up
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
