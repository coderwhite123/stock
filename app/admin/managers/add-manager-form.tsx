'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createManager } from '@/app/actions/admin';
import { toast } from 'sonner';

export function AddManagerForm() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await createManager({ name, email, phone: phone || undefined });
    setLoading(false);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('Manager added');
      setName('');
      setEmail('');
      setPhone('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="min-w-[180px]">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Manager name" required />
      </div>
      <div className="min-w-[200px]">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
      </div>
      <div className="min-w-[140px]">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Phone (optional)</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" />
      </div>
      <Button type="submit" disabled={loading}>Add manager</Button>
    </form>
  );
}
