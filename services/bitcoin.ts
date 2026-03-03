import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);
const network = bitcoin.networks.bitcoin;

// BIP84 (native SegWit) uses zpub/vpub; bip32 needs the right version to accept them
const zpubNetwork = { ...network, bip32: { public: 0x04b24746, private: 0x04b2430c } };
const vpubNetwork = { ...bitcoin.networks.testnet, bip32: { public: 0x045f1cf6, private: 0x045f18bc } };

function getNetworkForKey(xpubOrZpub: string) {
  if (xpubOrZpub.startsWith('zpub')) return zpubNetwork;
  if (xpubOrZpub.startsWith('vpub')) return vpubNetwork;
  return network;
}

/**
 * Derive a unique BTC receive address from the master XPUB.
 * Supports xpub (legacy), zpub (BIP84 mainnet), vpub (BIP84 testnet).
 * Path: account then 0/index (receive chain + address index). Never uses or stores private keys.
 */
export function deriveAddress(xpub: string, index: number): string {
  const net = getNetworkForKey(xpub);
  const node = bip32.fromBase58(xpub, net);
  const child = node.derive(0).derive(index);
  const addressNetwork = xpub.startsWith('vpub') ? bitcoin.networks.testnet : network;
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: addressNetwork,
  });
  if (!address) throw new Error('Failed to derive address');
  return address;
}

/**
 * Get the next address index for a new user (caller should persist this).
 */
export function getNextAddressIndex(currentMaxIndex: number): number {
  return currentMaxIndex + 1;
}
