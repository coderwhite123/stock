import Link from 'next/link';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/actions/auth';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const user = await getCurrentUser();
  const { message } = await searchParams;

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_verified')
    .eq('user_id', user.id)
    .single();

  if (profile?.email_verified) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify your email</h1>
        {message && (
          <p className="text-slate-600 dark:text-slate-400">{message}</p>
        )}
        {!message && (
          <p className="text-slate-600 dark:text-slate-400">
            We&apos;ve sent a verification link to your email. Click the link to verify your account and access the dashboard.
          </p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-500">
          You won&apos;t be able to access the dashboard until your email is verified.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
        <Link href="/dashboard">
          <Button variant="ghost">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
