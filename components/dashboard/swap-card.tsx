'use client';

import { useState, useTransition } from 'react';
import { ArrowDownUp, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatBtc, formatUsd } from '@/lib/utils';
import { swapBtcToCrypto, swapCryptoToBtc } from '@/app/actions/swap';
import type { CryptoMarketPrice } from '@/services/blockchain';

interface SwapCardProps {
  profileId: string;
  balanceBtc: string;
  btcPrice: number;
  marketPrices: CryptoMarketPrice[];
}

type LocalBalances = Record<string, number>;

export function SwapCard({ profileId, balanceBtc, btcPrice, marketPrices }: SwapCardProps) {
  const [balances, setBalances] = useState<LocalBalances>(() => {
    if (typeof window === 'undefined') return {};
    const stored = window.localStorage.getItem(`crypto-balances:${profileId}`);
    try {
      const parsed = stored ? JSON.parse(stored) as LocalBalances : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });
  const [assetSymbol, setAssetSymbol] = useState('USDT');
  const [direction, setDirection] = useState<'btc-to-crypto' | 'crypto-to-btc'>('btc-to-crypto');
  const [isPending, startTransition] = useTransition();
  const btcAmount = Number.parseFloat(balanceBtc) || 0;
  const assets = [
    { symbol: 'USDT', name: 'Tether', priceUsd: 1 },
    ...marketPrices.filter((asset) => asset.symbol !== 'BTC'),
  ];
  const selectedAsset = assets.find((asset) => asset.symbol === assetSymbol) ?? assets[0];
  const localAssetBalance = balances[assetSymbol] ?? 0;
  const assetPrice = selectedAsset?.priceUsd ?? 1;

  const persistBalance = (symbol: string, amount: number) => {
    const next = { ...balances, [symbol]: amount };
    setBalances(next);
    window.localStorage.setItem(`crypto-balances:${profileId}`, JSON.stringify(next));
  };

  const setDirectionAndAsset = (nextDirection: 'btc-to-crypto' | 'crypto-to-btc') => {
    setDirection(nextDirection);
  };

  const handleSwap = () => {
    startTransition(async () => {
      if (direction === 'btc-to-crypto') {
        if (btcAmount <= 0) {
          toast.error('You do not have a BTC balance to swap.');
          return;
        }
        const result = await swapBtcToCrypto(assetSymbol);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        persistBalance(assetSymbol, localAssetBalance + (result.assetAmount ?? 0));
        toast.success(`${(result.assetAmount ?? 0).toFixed(6)} ${assetSymbol} added to your balance.`);
      } else {
        if (localAssetBalance <= 0) {
          toast.error(`You do not have a ${assetSymbol} balance to swap.`);
          return;
        }
        const result = await swapCryptoToBtc(assetSymbol, localAssetBalance);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        persistBalance(assetSymbol, 0);
        toast.success(`${formatBtc(result.btcAmount ?? 0)} BTC added to your balance.`);
        window.location.reload();
      }
    });
  };

  const sourceAmount = direction === 'btc-to-crypto' ? btcAmount : localAssetBalance;
  const estimatedReceive = direction === 'btc-to-crypto'
    ? btcAmount * btcPrice / assetPrice
    : localAssetBalance * assetPrice / btcPrice;

  return (
    <section id="swap" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-400">Quick conversion</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Swap BTC and crypto</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live conversion using BTC at {formatUsd(btcPrice)}.</p>
        </div>
        <select value={assetSymbol} onChange={(event) => setAssetSymbol(event.target.value)} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          {assets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} · {asset.name}</option>)}
        </select>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-full bg-slate-100 p-1 dark:bg-slate-800 sm:w-fit">
        <button type="button" onClick={() => setDirectionAndAsset('btc-to-crypto')} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex-none ${direction === 'btc-to-crypto' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>BTC → {assetSymbol}</button>
        <button type="button" onClick={() => setDirectionAndAsset('crypto-to-btc')} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex-none ${direction === 'crypto-to-btc' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>{assetSymbol} → BTC</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"><p className="text-xs text-slate-500">From {direction === 'btc-to-crypto' ? 'BTC' : assetSymbol}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{direction === 'btc-to-crypto' ? `${formatBtc(sourceAmount)} BTC` : `${sourceAmount.toFixed(6)} ${assetSymbol}`}</p></div>
        <ArrowDownUp className="mx-auto h-5 w-5 text-orange-500" />
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/60 dark:bg-orange-950/20"><p className="text-xs text-orange-700 dark:text-orange-400">Estimated receive</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{direction === 'btc-to-crypto' ? `${estimatedReceive.toFixed(6)} ${assetSymbol}` : `${formatBtc(estimatedReceive)} BTC`}</p></div>
      </div>
      <Button onClick={handleSwap} disabled={isPending || !selectedAsset} className="mt-4 w-full gap-2 sm:w-auto">{isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} {isPending ? 'Swapping...' : 'Confirm swap'}</Button>
      <p className="mt-3 text-xs text-slate-400">Non-BTC balances are stored locally on this device. Clearing browser storage will remove them.</p>
    </section>
  );
}