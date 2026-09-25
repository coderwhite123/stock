'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, Check, AlertCircle, Wallet, ArrowRight, ShieldCheck, UserRound, LifeBuoy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBtc, formatUsd } from '@/lib/utils';
import { toast } from 'sonner';
import { requestBtcAddress } from '@/app/actions/btc-address';
import { SwapCard } from '@/components/dashboard/swap-card';
import type { CryptoMarketPrice } from '@/services/blockchain';
import type { CryptoHistoryPoint } from '@/services/blockchain';
import { PortfolioOverview } from '@/components/dashboard/portfolio-overview';
import { RecentActivity, type RecentTransaction } from '@/components/dashboard/recent-activity';
import { CryptoPriceChart } from '@/components/dashboard/crypto-price-chart';

interface DashboardClientProps {
  profileId: string;
  balanceBtc: string;
  balanceUsd: number;
  btcPrice: number;
  marketPrices: CryptoMarketPrice[];
  cryptoHistory: Record<string, CryptoHistoryPoint[]>;
  recentTransactions: RecentTransaction[];
  emailVerified: boolean;
  withdrawalsEnabled: boolean;
  btcDepositAddress: string | null;
  managerName: string | null;
  managerEmail: string | null;
}

export function DashboardClient({
  profileId,
  balanceBtc,
  balanceUsd,
  btcPrice,
  marketPrices,
  cryptoHistory,
  recentTransactions,
  emailVerified,
  withdrawalsEnabled,
  btcDepositAddress,
  managerName,
  managerEmail,
}: DashboardClientProps) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleGenerateAddress = useCallback(async () => {
    setGenerating(true);
    const r = await requestBtcAddress();
    setGenerating(false);
    if (r?.error) toast.error(r.error);
    else {
      toast.success('BTC address generated. Check your email for the QR code.');
      window.location.reload();
    }
  }, []);

  const copyAddress = useCallback(() => {
    if (!btcDepositAddress) {
      toast.error('No deposit address assigned yet.');
      return;
    }
    navigator.clipboard.writeText(btcDepositAddress);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [btcDepositAddress]);

  const nextStep = !btcDepositAddress
    ? { label: 'Generate your BTC deposit address', detail: 'Create the unique address used to receive and track your recovery funds.', href: '#deposit-address', icon: Wallet }
    : !withdrawalsEnabled
      ? { label: 'Complete your recovery setup', detail: 'Keep your profile and banking details current while approval is pending.', href: '/profile', icon: UserRound }
      : { label: 'Your account is ready for withdrawal', detail: 'Review your available balance and start a withdrawal when you are ready.', href: '/withdraw', icon: ArrowRight };
  const NextStepIcon = nextStep.icon;

  const downloadQr = useCallback(() => {
    if (!qrRef.current || !btcDepositAddress) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = png;
      a.download = 'btc-deposit-qr.png';
      a.click();
      toast.success('QR code downloaded');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [btcDepositAddress]);

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-2xl border border-orange-200 bg-orange-50/90 shadow-sm dark:border-orange-900/60 dark:bg-orange-950/25">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm"><NextStepIcon className="h-5 w-5" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-400">Next step</p><h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{nextStep.label}</h2><p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">{nextStep.detail}</p></div>
          </div>
          {nextStep.href.startsWith('#') ? <a href={nextStep.href}><Button size="sm" className="w-full gap-2 sm:w-auto">Get started <ArrowRight className="h-4 w-4" /></Button></a> : <Link href={nextStep.href}><Button size="sm" className="w-full gap-2 sm:w-auto">Open <ArrowRight className="h-4 w-4" /></Button></Link>}
        </div>
        <div className="grid grid-cols-3 border-t border-orange-200/80 bg-white/50 text-center dark:border-orange-900/60 dark:bg-slate-900/30">
          <div className="border-r border-orange-200/80 px-2 py-3 dark:border-orange-900/60"><p className="text-xs text-slate-500">1</p><p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">Account</p></div>
          <div className="border-r border-orange-200/80 px-2 py-3 dark:border-orange-900/60"><p className="text-xs text-slate-500">2</p><p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">Deposit</p></div>
          <div className="px-2 py-3"><p className="text-xs text-slate-500">3</p><p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">Withdraw</p></div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">BTC Balance</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{formatBtc(balanceBtc)} <span className="text-base font-medium text-slate-500">BTC</span></p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">USD Equivalent</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{formatUsd(balanceUsd)}</p>
          <p className="mt-0.5 text-xs text-slate-500">~{formatUsd(btcPrice)} / BTC</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verification</p>
          <div className="mt-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            {emailVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Pending</Badge>
            )}
          </div>
        </div>
      </div>

      <SwapCard profileId={profileId} balanceBtc={balanceBtc} btcPrice={btcPrice} marketPrices={marketPrices} />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <PortfolioOverview profileId={profileId} balanceBtc={balanceBtc} btcPrice={btcPrice} marketPrices={marketPrices} />
        <RecentActivity transactions={recentTransactions} />
      </div>

      <CryptoPriceChart history={cryptoHistory} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Link href="/withdraw" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Withdrawal status</h2>
          <div className="mt-3 flex items-center justify-between gap-3">
            {withdrawalsEnabled ? (
              <Badge variant="success">Approved — withdrawals enabled</Badge>
            ) : (
              <Badge variant="warning">Pending approval</Badge>
            )}
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
        <Link href="/support" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Refund manager</h2>
          <div className="mt-3 flex items-center justify-between gap-3">
            {managerName ? (
            <p className="text-slate-600 dark:text-slate-400">
              {managerName}
              {managerEmail && (
                <span className="block text-sm text-slate-500">{managerEmail}</span>
              )}
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-slate-500">
              <AlertCircle className="h-4 w-4" /> Not assigned yet
            </p>
          )}
            <LifeBuoy className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:rotate-12" />
          </div>
        </Link>
      </div>

      <div id="deposit-address" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white">Your BTC deposit address</h2>
        {btcDepositAddress ? (
          <>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Send only Bitcoin (BTC) to this address. Deposits are credited after 1 confirmation.
            </p>
            <div className="mt-4 flex flex-wrap items-start gap-6">
              <div ref={qrRef} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700">
                <QRCodeSVG value={btcDepositAddress} size={180} level="M" />
              </div>
              <div className="flex-1 min-w-0">
                <code className="block break-all rounded bg-slate-100 px-3 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {btcDepositAddress}
                </code>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copyAddress}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? ' Copied' : ' Copy address'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadQr}>
                    <Download className="h-4 w-4" /> Download QR
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              You don&apos;t have a deposit address yet.
            </p>
            <Button onClick={handleGenerateAddress} disabled={generating} size="sm" className="gap-2">
              <Wallet className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate my BTC address'}
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A unique address and QR code will be sent to your email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
