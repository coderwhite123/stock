'use client';

import { useState } from 'react';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { formatUsd } from '@/lib/utils';
import type { CryptoHistoryPoint } from '@/services/blockchain';

interface CryptoPriceChartProps {
  history: Record<string, CryptoHistoryPoint[]>;
}

const assets = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
];

export function CryptoPriceChart({ history }: CryptoPriceChartProps) {
  const [assetId, setAssetId] = useState('bitcoin');
  const points = history[assetId] ?? [];
  const values = points.map((point) => point.priceUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartWidth = 720;
  const chartHeight = 220;
  const path = points.map((point, index) => {
    const x = points.length > 1 ? (index / (points.length - 1)) * chartWidth : 0;
    const y = chartHeight - ((point.priceUsd - min) / range) * (chartHeight - 24) - 12;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
  const first = values[0] ?? 0;
  const latest = values.at(-1) ?? 0;
  const change = first > 0 ? ((latest - first) / first) * 100 : 0;
  const selectedAsset = assets.find((asset) => asset.id === assetId) ?? assets[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"><Activity className="h-4 w-4 text-orange-500" /> Market chart</div><h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{selectedAsset.name} price</h2><p className="mt-1 text-sm text-slate-500">Last 7 days · USD</p></div>
        <select value={assetId} onChange={(event) => setAssetId(event.target.value)} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.symbol} · {asset.name}</option>)}</select>
      </div>
      {points.length > 1 ? <>
        <div className="mt-5 flex items-end justify-between"><p className="text-2xl font-semibold text-slate-950 dark:text-white">{formatUsd(latest)}</p><p className={`flex items-center gap-1 text-sm font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{Math.abs(change).toFixed(2)}% this week</p></div>
        <div className="mt-4 overflow-hidden rounded-xl bg-slate-50 p-2 dark:bg-slate-800/60"><svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="h-52 w-full" role="img" aria-label={`${selectedAsset.name} seven day price chart`}><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity="0.25" /><stop offset="100%" stopColor="#f97316" stopOpacity="0" /></linearGradient></defs><path d={`${path} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#chart-fill)" /><path d={path} fill="none" stroke="#f97316" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg></div>
      </> : <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:bg-slate-800/60">Price history is temporarily unavailable.</div>}
    </section>
  );
}