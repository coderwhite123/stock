const MEMPOOL_API = 'https://mempool.space/api';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const MIN_CONFIRMATIONS = 1;

export interface CryptoMarketPrice {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
}

export interface CryptoHistoryPoint {
  timestamp: number;
  priceUsd: number;
}

export interface AddressTx {
  txid: string;
  status: { confirmed: boolean; block_height?: number };
  vout: { value: number; scriptpubkey_address: string }[];
}

/**
 * Fetch unspent outputs (UTXOs) for an address to detect incoming deposits.
 * Uses mempool.space API (no key required).
 */
export async function getAddressUtxos(address: string): Promise<{ txid: string; value: number; status: { confirmed: boolean } }[]> {
  const res = await fetch(`${MEMPOOL_API}/address/${address}/utxo`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const utxos = await res.json();
  return utxos.map((u: { txid: string; value: number; status: { confirmed: boolean } }) => ({
    txid: u.txid,
    value: u.value,
    status: u.status,
  }));
}

/**
 * Get transaction details.
 */
export async function getTransaction(txid: string): Promise<AddressTx | null> {
  const res = await fetch(`${MEMPOOL_API}/tx/${txid}`);
  if (!res.ok) return null;
  return res.json();
}

/**
 * Get current BTC price in USD (from a simple API).
 */
export async function getBtcPriceUsd(): Promise<number> {
  try {
    const res = await fetch(`${MEMPOOL_API}/v1/prices`, { next: { revalidate: 60 } });
    if (!res.ok) return 0;
    const data = await res.json();
    return data?.USD ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get a small market snapshot for the signed-in dashboard ticker.
 */
export async function getCryptoMarketPrices(): Promise<CryptoMarketPrice[]> {
  const assets = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  ];

  try {
    const ids = assets.map((asset) => asset.id).join(',');
    const res = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];

    const data = await res.json() as Record<string, { usd?: number; usd_24h_change?: number }>;
    return assets
      .filter((asset) => typeof data[asset.id]?.usd === 'number')
      .map((asset) => ({
        ...asset,
        priceUsd: data[asset.id].usd ?? 0,
        change24h: data[asset.id].usd_24h_change ?? 0,
      }));
  } catch {
    return [];
  }
}

export async function getCryptoMarketHistory(): Promise<Record<string, CryptoHistoryPoint[]>> {
  const assets = ['bitcoin', 'ethereum', 'solana', 'ripple'];
  const entries = await Promise.all(assets.map(async (asset) => {
    try {
      const res = await fetch(`${COINGECKO_API}/coins/${asset}/market_chart?vs_currency=usd&days=7&interval=hourly`, { next: { revalidate: 300 } });
      if (!res.ok) return [asset, []] as const;
      const data = await res.json() as { prices?: [number, number][] };
      return [asset, (data.prices ?? []).map(([timestamp, priceUsd]) => ({ timestamp, priceUsd }))] as const;
    } catch {
      return [asset, []] as const;
    }
  }));
  return Object.fromEntries(entries);
}

/**
 * Satoshis to BTC string.
 */
export function satsToBtc(sats: number): string {
  return (sats / 1e8).toFixed(8);
}
