import { createWalletClient, createPublicClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem/chains';

// Contract addresses
export const TIP20_FACTORY_ADDRESS = '0x20FC000000000000000000000000000000000000' as const;
export const TIP_FEE_MANAGER_ADDRESS = '0x1559000000000000000000000000000000000000' as const;
export const TIP403_REGISTRY_ADDRESS = '0x403C000000000000000000000000000000000000' as const;
export const TIP4217_REGISTRY_ADDRESS = '0x4217C00000000000000000000000000000000000' as const;

// Role hashes
export const ISSUER_ROLE = '0x' + Buffer.from('ISSUER_ROLE').toString('hex').padEnd(64, '0') as `0x${string}`;

// Define Tempo chain
export const tempoChain = defineChain({
  id: 1001, // Replace with actual chain ID
  name: 'Tempo',
  nativeCurrency: {
    decimals: 18,
    name: 'Tempo',
    symbol: 'TEMPO',
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'], // Replace with actual RPC URL
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'http://localhost:3000' },
  },
});

// Test account (same as in original tests)
const TEST_MNEMONIC = 'test test test test test test test test test test test junk';
const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Private key for test mnemonic

export const account = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`);

// Create clients
export const publicClient = createPublicClient({
  chain: tempoChain,
  transport: http(),
});

export const walletClient = createWalletClient({
  account,
  chain: tempoChain,
  transport: http(),
});

// Helper function to convert token ID to address
export function tokenIdToAddress(tokenId: bigint): Address {
  const TIP20_TOKEN_PREFIX = Buffer.from([0x20, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  const addressBytes = Buffer.alloc(20);
  TIP20_TOKEN_PREFIX.copy(addressBytes, 0);
  
  // Convert tokenId to 8 bytes big-endian
  const tokenIdBytes = Buffer.alloc(8);
  tokenIdBytes.writeBigUInt64BE(tokenId);
  tokenIdBytes.copy(addressBytes, 12);
  
  return ('0x' + addressBytes.toString('hex')) as Address;
}

// Logging helper
export function log(message: string, data?: any) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
}