import { createAdminClient } from '@/lib/supabase/admin';
import { getBtcPriceUsd } from '@/services/blockchain';

export type HomepageStats = {
  disbursedUsd: number;
  peopleInRecovery: number;
  approvedWithdrawalsCount: number;
};

export async function getHomepageStats(): Promise<HomepageStats> {
  try {
    const admin = createAdminClient();
    const [withdrawalsResult, profilesResult] = await Promise.all([
      admin.from('withdrawal_requests').select('amount_btc, amount_usd').eq('status', 'approved'),
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
    ]);

    let disbursedUsd = 0;
    const rows = withdrawalsResult.data ?? [];
    let btcPrice = 0;
    try {
      btcPrice = await getBtcPriceUsd();
    } catch {
      btcPrice = 40000;
    }
    for (const row of rows) {
      const usd = row.amount_usd != null ? parseFloat(String(row.amount_usd)) : null;
      if (usd != null && !Number.isNaN(usd)) {
        disbursedUsd += usd;
      } else {
        const btc = parseFloat(String(row.amount_btc ?? 0));
        if (!Number.isNaN(btc) && btc > 0) disbursedUsd += btc * btcPrice;
      }
    }

    const peopleInRecovery = typeof profilesResult.count === 'number' ? profilesResult.count : 0;

    return {
      disbursedUsd,
      peopleInRecovery,
      approvedWithdrawalsCount: rows.length,
    };
  } catch {
    return {
      disbursedUsd: 0,
      peopleInRecovery: 0,
      approvedWithdrawalsCount: 0,
    };
  }
}

/** Format disbursed amount for display e.g. "$2.5M+", "$450K+", "Millions" */
export function formatDisbursed(usd: number): string {
  if (usd <= 0) return 'Millions';
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M+`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K+`;
  return `$${Math.round(usd).toLocaleString()}`;
}
