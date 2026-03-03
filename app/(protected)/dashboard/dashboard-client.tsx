'use client';

import { useCallback, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, Check, AlertCircle, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBtc, formatUsd } from '@/lib/utils';
import { toast } from 'sonner';
import { requestBtcAddress } from '@/app/actions/btc-address';

interface DashboardClientProps {
  profileId: string;
  balanceBtc: string;
  balanceUsd: number;
  btcPrice: number;
  emailVerified: boolean;
  withdrawalsEnabled: boolean;
  btcDepositAddress: string | null;
  managerName: string | null;
  managerEmail: string | null;
}

export function DashboardClient({
  balanceBtc,
  balanceUsd,
  btcPrice,
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
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">BTC Balance</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatBtc(balanceBtc)} BTC</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">USD Equivalent</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatUsd(balanceUsd)}</p>
          <p className="mt-0.5 text-xs text-slate-500">~{formatUsd(btcPrice)} / BTC</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verification</p>
          <div className="mt-1">
            {emailVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Pending</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Withdrawal status</h2>
          <div className="mt-2">
            {withdrawalsEnabled ? (
              <Badge variant="success">Approved — withdrawals enabled</Badge>
            ) : (
              <Badge variant="warning">Pending approval</Badge>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Refund manager</h2>
          {managerName ? (
            <p className="mt-1 text-slate-600 dark:text-slate-400">
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
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
