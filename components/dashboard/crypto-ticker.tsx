'use client';

import { ArrowDownRight, ArrowUpRight, Radio } from 'lucide-react';
import type { CryptoMarketPrice } from '@/services/blockchain';

interface CryptoTickerProps {
  prices: CryptoMarketPrice[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: price < 1 ? 4 : 2,
  }).format(price);
}

function MarketItem({ asset }: { asset: CryptoMarketPrice }) {
  const isPositive = asset.change24h >= 0;
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex shrink-0 items-center gap-3 border-r border-slate-200/80 px-6 first:pl-0 dark:border-slate-800">
      <span className="text-xs font-bold tracking-[0.12em] text-slate-500 dark:text-slate-400">{asset.symbol}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(asset.priceUsd)}</span>
      <span className={`inline-flex items-center text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        <ChangeIcon className="mr-0.5 h-3.5 w-3.5" />
        {Math.abs(asset.change24h).toFixed(2)}%
      </span>
    </div>
  );
}

export function CryptoTicker({ prices }: CryptoTickerProps) {
  if (!prices.length) return null;

  return (
    <section aria-label="Current cryptocurrency prices" className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex h-12 items-center gap-5 border-b border-slate-200/80 px-4 dark:border-slate-800">
        <div className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">
          <Radio className="h-3.5 w-3.5 text-orange-500" /> Markets
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="crypto-ticker-track flex w-max items-center" dir="rtl">
            {[...prices, ...prices].map((asset, index) => <MarketItem key={`${asset.id}-${index}`} asset={asset} />)}
          </div>
        </div>
      </div>
      <p className="px-4 py-2 text-[11px] text-slate-400">Prices in USD · Updated every minute</p>
    </section>
  );
}