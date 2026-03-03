'use client';

import { useState } from 'react';
import { deleteManager } from '@/app/actions/admin';
import { toast } from 'sonner';

export function DeleteManagerButtonClient({ managerId, managerName }: { managerId: string; managerName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(`Remove manager "${managerName}"? Users assigned to them will have no manager.`)) return;
    setLoading(true);
    const r = await deleteManager(managerId);
    setLoading(false);
    if (r?.error) toast.error(r.error);
    else toast.success('Manager removed');
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-red-600 hover:underline dark:text-red-400 disabled:opacity-50"
    >
      {loading ? '...' : 'Remove'}
    </button>
  );
}
