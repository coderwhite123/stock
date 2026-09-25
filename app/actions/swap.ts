'use server';

import { createClient } from '@/lib/supabase/server';
import { getBtcPriceUsd, getCryptoMarketPrices } from '@/services/blockchain';
import { logUserActivity } from '@/services/activity';
import { revalidatePath } from 'next/cache';

const SUPPORTED_ASSETS = new Set(['USDT', 'ETH', 'SOL', 'XRP']);

async function getAssetPrice(assetSymbol: string) {
  if (assetSymbol === 'USDT') return 1;
  const asset = (await getCryptoMarketPrices()).find((item) => item.symbol === assetSymbol);
  return asset?.priceUsd ?? 0;
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? supabase : null;
}

export async function swapBtcToCrypto(assetSymbol: string) {
  if (!SUPPORTED_ASSETS.has(assetSymbol)) return { error: 'Unsupported crypto asset.' };
  const supabase = await getAuthenticatedClient();
  if (!supabase) return { error: 'Not authenticated' };

  const [btcPrice, assetPrice] = await Promise.all([getBtcPriceUsd(), getAssetPrice(assetSymbol)]);
  if (btcPrice <= 0 || assetPrice <= 0) return { error: 'A live crypto price is currently unavailable. Try again shortly.' };

  const { data, error } = await supabase.rpc('swap_btc_to_usdt', { p_btc_price: btcPrice });
  if (error) return { error: error.message };
  const result = Array.isArray(data) ? data[0] : data;
  const btcAmount = Number(result?.btc_amount ?? 0);
  const usdValue = Number(result?.usdt_amount ?? 0);
  const assetAmount = usdValue / assetPrice;
  await logUserActivity('btc_swapped_to_crypto', { assetSymbol, btcAmount, assetAmount, btcPrice, assetPrice });
  revalidatePath('/dashboard');
  return { success: true, assetAmount, btcAmount, assetPrice };
}

export async function swapCryptoToBtc(assetSymbol: string, assetAmount: number) {
  if (!SUPPORTED_ASSETS.has(assetSymbol)) return { error: 'Unsupported crypto asset.' };
  if (!Number.isFinite(assetAmount) || assetAmount <= 0) return { error: 'Enter a valid crypto amount.' };
  const supabase = await getAuthenticatedClient();
  if (!supabase) return { error: 'Not authenticated' };

  const [btcPrice, assetPrice] = await Promise.all([getBtcPriceUsd(), getAssetPrice(assetSymbol)]);
  if (btcPrice <= 0 || assetPrice <= 0) return { error: 'A live crypto price is currently unavailable. Try again shortly.' };
  const usdValue = assetAmount * assetPrice;
  const { data, error } = await supabase.rpc('swap_usdt_to_btc', {
    p_usdt_amount: usdValue,
    p_btc_price: btcPrice,
  });
  if (error) return { error: error.message };

  const btcAmount = Number(data ?? 0);
  await logUserActivity('crypto_swapped_to_btc', { assetSymbol, assetAmount, btcAmount, btcPrice, assetPrice });
  revalidatePath('/dashboard');
  return { success: true, btcAmount, assetPrice };
}

export async function swapBtcToUsdt() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const btcPrice = await getBtcPriceUsd();
  if (btcPrice <= 0) return { error: 'The BTC price is currently unavailable. Try again shortly.' };

  const { data, error } = await supabase.rpc('swap_btc_to_usdt', { p_btc_price: btcPrice });
  if (error) return { error: error.message };

  const result = Array.isArray(data) ? data[0] : data;
  const btcAmount = Number(result?.btc_amount ?? 0);
  const usdtAmount = Number(result?.usdt_amount ?? 0);
  await logUserActivity('btc_swapped_to_usdt', { btcAmount, usdtAmount, btcPrice });
  revalidatePath('/dashboard');
  return { success: true, btcAmount, usdtAmount, btcPrice };
}

export async function swapUsdtToBtc(usdtAmount: number) {
  if (!Number.isFinite(usdtAmount) || usdtAmount <= 0) return { error: 'Enter a valid USDT amount.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const btcPrice = await getBtcPriceUsd();
  if (btcPrice <= 0) return { error: 'The BTC price is currently unavailable. Try again shortly.' };

  const { data, error } = await supabase.rpc('swap_usdt_to_btc', {
    p_usdt_amount: usdtAmount,
    p_btc_price: btcPrice,
  });
  if (error) return { error: error.message };

  const btcAmount = Number(data ?? 0);
  await logUserActivity('usdt_swapped_to_btc', { btcAmount, usdtAmount, btcPrice });
  revalidatePath('/dashboard');
  return { success: true, btcAmount, usdtAmount, btcPrice };
}