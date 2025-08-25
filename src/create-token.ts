import { parseEventLogs } from 'viem';
import { TIP20_FACTORY_ABI, TIP20_ABI } from './abis';
import { 
  TIP20_FACTORY_ADDRESS, 
  publicClient, 
  walletClient, 
  account,
  tokenIdToAddress,
  log
} from './config';

async function createToken() {
  log('Starting TIP20 token creation test');
  log('Account address:', account.address);

  // Check initial native balance
  const nativeBalance = await publicClient.getBalance({ address: account.address });
  log('Native balance:', nativeBalance.toString());

  // Get initial token ID counter
  const initialTokenId = await publicClient.readContract({
    address: TIP20_FACTORY_ADDRESS,
    abi: TIP20_FACTORY_ABI,
    functionName: 'tokenIdCounter',
  });
  log('Initial token ID counter:', initialTokenId.toString());

  // Create token parameters
  const tokenParams = {
    name: 'Test Token',
    symbol: 'TEST',
    currency: 'USD',
    admin: account.address,
  };
  log('Creating token with params:', tokenParams);

  // Send transaction to create token
  const hash = await walletClient.writeContract({
    address: TIP20_FACTORY_ADDRESS,
    abi: TIP20_FACTORY_ABI,
    functionName: 'createToken',
    args: [tokenParams.name, tokenParams.symbol, tokenParams.currency, tokenParams.admin],
  });
  log('Transaction hash:', hash);

  // Wait for transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  log('Transaction confirmed in block:', receipt.blockNumber.toString());
  log('Gas used:', receipt.gasUsed.toString());

  // Parse event logs
  const logs = parseEventLogs({
    abi: TIP20_FACTORY_ABI,
    logs: receipt.logs,
  });

  const tokenCreatedEvent = logs.find(log => log.eventName === 'TokenCreated');
  if (!tokenCreatedEvent) {
    throw new Error('TokenCreated event not found');
  }

  log('TokenCreated event:', tokenCreatedEvent.args);
  
  const tokenId = tokenCreatedEvent.args.tokenId;
  log('Created token ID:', tokenId.toString());

  // Verify token ID counter increased
  const newTokenId = await publicClient.readContract({
    address: TIP20_FACTORY_ADDRESS,
    abi: TIP20_FACTORY_ABI,
    functionName: 'tokenIdCounter',
  });
  log('New token ID counter:', newTokenId.toString());

  if (newTokenId !== initialTokenId + 1n) {
    throw new Error('Token ID counter did not increase correctly');
  }

  // Get token address
  const tokenAddress = tokenIdToAddress(tokenId);
  log('Token address:', tokenAddress);

  // Verify token properties
  const [name, symbol, currency, supplyCap, transferPolicyId] = await Promise.all([
    publicClient.readContract({
      address: tokenAddress,
      abi: TIP20_ABI,
      functionName: 'name',
    }),
    publicClient.readContract({
      address: tokenAddress,
      abi: TIP20_ABI,
      functionName: 'symbol',
    }),
    publicClient.readContract({
      address: tokenAddress,
      abi: TIP20_ABI,
      functionName: 'currency',
    }),
    publicClient.readContract({
      address: tokenAddress,
      abi: TIP20_ABI,
      functionName: 'supplyCap',
    }),
    publicClient.readContract({
      address: tokenAddress,
      abi: TIP20_ABI,
      functionName: 'transferPolicyId',
    }),
  ]);

  log('Token properties:', {
    name,
    symbol,
    currency,
    supplyCap: supplyCap.toString(),
    transferPolicyId: transferPolicyId.toString(),
  });

  // Verify properties match
  if (name !== tokenParams.name) {
    throw new Error(`Name mismatch: expected ${tokenParams.name}, got ${name}`);
  }
  if (symbol !== tokenParams.symbol) {
    throw new Error(`Symbol mismatch: expected ${tokenParams.symbol}, got ${symbol}`);
  }
  if (currency !== tokenParams.currency) {
    throw new Error(`Currency mismatch: expected ${tokenParams.currency}, got ${currency}`);
  }

  log('✅ Token creation test passed!');
  return { tokenId, tokenAddress };
}

// Run if executed directly
if (import.meta.main) {
  createToken().catch(console.error);
}

export { createToken };