const MEMPOOL_API = 'https://mempool.space/api';
const MIN_CONFIRMATIONS = 1;

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
 * Satoshis to BTC string.
 */
export function satsToBtc(sats: number): string {
  return (sats / 1e8).toFixed(8);
}
