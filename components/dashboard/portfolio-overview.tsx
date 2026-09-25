'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PieChart } from 'lucide-react';
import { formatBtc, formatUsd } from '@/lib/utils';
import type { CryptoMarketPrice } from '@/services/blockchain';

interface PortfolioOverviewProps {
  profileId: string;
  balanceBtc: string;
  btcPrice: number;
  marketPrices: CryptoMarketPrice[];
}

export function PortfolioOverview({ profileId, balanceBtc, btcPrice, marketPrices }: PortfolioOverviewProps) {
  const [localBalances] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = window.localStorage.getItem(`crypto-balances:${profileId}`);
      const balances = stored ? JSON.parse(stored) as Record<string, number> : {};
      const legacyUsdt = window.localStorage.getItem(`usdt-balance:${profileId}`);
      if (legacyUsdt && !balances.USDT) balances.USDT = Number.parseFloat(legacyUsdt) || 0;
      return balances;
    } catch {
      return {};
    }
  });

  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', amount: Number.parseFloat(balanceBtc) || 0, price: btcPrice, tone: 'bg-orange-500', color: '#f97316' },
    { symbol: 'USDT', name: 'Tether', amount: localBalances.USDT || 0, price: 1, tone: 'bg-emerald-500', color: '#10b981' },
    ...marketPrices
      .filter((asset) => asset.symbol !== 'BTC' && asset.symbol !== 'USDT')
      .map((asset, index) => ({ ...asset, amount: localBalances[asset.symbol] || 0, price: asset.priceUsd, tone: ['bg-blue-500', 'bg-violet-500', 'bg-rose-500'][index % 3], color: ['#3b82f6', '#8b5cf6', '#f43f5e'][index % 3] })),
  ];
  const totalValue = assets.reduce((total, asset) => total + asset.amount * asset.price, 0);
  const heldAssets = assets.filter((asset) => asset.amount > 0);
  const chartRadius = 38;
  const chartCircumference = 2 * Math.PI * chartRadius;
  let chartOffset = 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"><PieChart className="h-4 w-4 text-orange-500" /> Wallet balances</div><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{formatUsd(totalValue)}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Estimated total value</p></div>
        <div className="flex items-center gap-4">
          <div className="relative h-28 w-28 shrink-0" aria-label="Portfolio allocation chart" role="img">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={chartRadius} fill="none" stroke="#e2e8f0" strokeWidth="14" className="dark:stroke-slate-700" />
              {heldAssets.map((asset) => {
                const share = totalValue > 0 ? (asset.amount * asset.price / totalValue) : 0;
                const length = share * chartCircumference;
                const segment = <circle key={asset.symbol} cx="50" cy="50" r={chartRadius} fill="none" stroke={asset.color} strokeWidth="14" strokeDasharray={`${length} ${chartCircumference - length}`} strokeDashoffset={-chartOffset} />;
                chartOffset += length;
                return segment;
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-center"><div><p className="text-[10px] uppercase tracking-wide text-slate-400">Assets</p><p className="text-lg font-semibold text-slate-900 dark:text-white">{heldAssets.length}</p></div></div>
          </div>
          <Link href="#swap" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-400">Manage <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {assets.map((asset) => {
          const value = asset.amount * asset.price;
          const share = totalValue > 0 ? (value / totalValue) * 100 : 0;
          return <div key={asset.symbol}>
            <div className="flex items-center justify-between gap-3 text-sm"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${asset.tone}`} /><span className="font-semibold text-slate-800 dark:text-slate-200">{asset.symbol}</span><span className="text-slate-500">{asset.name}</span></div><span className="font-semibold text-slate-900 dark:text-white">{formatUsd(value)}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${asset.tone}`} style={{ width: `${share > 0 ? Math.max(share, 2) : 0}%` }} /></div>
            <p className="mt-1 text-xs text-slate-500">{asset.symbol === 'BTC' ? formatBtc(asset.amount) : asset.amount.toFixed(6)} {asset.symbol} · {share.toFixed(1)}%</p>
          </div>;
        })}
      </div>
    </section>
  );
}