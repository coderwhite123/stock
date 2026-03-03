'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadKycDocument } from '@/app/actions/kyc';
import { toast } from 'sonner';

export function KycUploadForm() {
  const [uploading, setUploading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setUploading(true);
    const r = await uploadKycDocument(formData);
    setUploading(false);
    if (r?.error) {
      toast.error(r.error);
      return;
    }
    toast.success('Document uploaded. We will review it shortly.');
    form.reset();
    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <label className="flex-1">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          name="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          className="block w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:rounded file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:file:bg-emerald-900/30 dark:file:text-emerald-400"
          required
        />
      </label>
      <Button type="submit" disabled={uploading}>
        {uploading ? 'Uploading…' : 'Upload'}
      </Button>
    </form>
  );
}
