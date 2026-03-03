'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ProfileForm({
  fullName,
  phone,
  address,
}: {
  fullName: string;
  phone: string;
  address: string;
}) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const result = await updateProfile({
      full_name: (form.elements.namedItem('full_name') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      address: (form.elements.namedItem('address') as HTMLInputElement).value.trim() || undefined,
    });
    setLoading(false);
    if (result?.error && '_form' in result.error) {
      toast.error(result.error._form[0]);
      return;
    }
    if (result?.success) {
      toast.success('Profile updated.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</span>
        <Input name="full_name" defaultValue={fullName} required maxLength={200} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</span>
        <Input name="phone" defaultValue={phone} required maxLength={50} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</span>
        <input
          name="address"
          defaultValue={address}
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
