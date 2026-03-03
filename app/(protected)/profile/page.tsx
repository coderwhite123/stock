import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';
import { BankingSection } from './banking-section';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, address')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/login');

  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('id, bank_name, bank_account, bank_routing, account_holder_name, is_primary, country, swift_bic, iban, branch_code, created_at')
    .eq('profile_id', profile.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & settings</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Update your details and manage your bank accounts.
        </p>
      </div>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Personal information</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Email is used for login and cannot be changed here.
        </p>
        <ProfileForm
          fullName={profile.full_name}
          phone={profile.phone}
          address={profile.address ?? ''}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <BankingSection
          bankAccounts={bankAccounts ?? []}
        />
      </section>
    </div>
  );
}
