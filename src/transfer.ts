import { parseEventLogs, type Address } from 'viem';
import { TIP20_FACTORY_ABI, TIP20_ABI, ROLES_AUTH_ABI } from './abis';
import { 
  TIP20_FACTORY_ADDRESS,
  ISSUER_ROLE,
  publicClient, 
  walletClient, 
  account,
  tokenIdToAddress,
  log
} from './config';

async function testTransfer() {
  log('Starting TIP20 token transfer test');
  log('Account address:', account.address);

  // First create a token
  log('Creating token...');
  const createHash = await walletClient.writeContract({
    address: TIP20_FACTORY_ADDRESS,
    abi: TIP20_FACTORY_ABI,
    functionName: 'createToken',
    args: ['TestUSD', 'TestUSD', 'USD', account.address],
  });

  const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
  const createLogs = parseEventLogs({
    abi: TIP20_FACTORY_ABI,
    logs: createReceipt.logs,
  });

  const tokenCreatedEvent = createLogs.find(log => log.eventName === 'TokenCreated');
  if (!tokenCreatedEvent) {
    throw new Error('TokenCreated event not found');
  }

  const tokenId = tokenCreatedEvent.args.tokenId;
  const tokenAddress = tokenIdToAddress(tokenId);
  log('Token created at:', tokenAddress);

  // Grant issuer role
  log('Granting issuer role...', ISSUER_ROLE);
  const grantRoleHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ROLES_AUTH_ABI,
    functionName: 'grantRole',
    args: [ISSUER_ROLE, account.address],
  });
  await publicClient.waitForTransactionReceipt({ hash: grantRoleHash });
  log('Issuer role granted');

  // Check if role was granted
  const hasRole = await publicClient.readContract({
    address: tokenAddress,
    abi: ROLES_AUTH_ABI,
    functionName: 'hasRole',
    args: [account.address, ISSUER_ROLE],
  });
  log('Has issuer role:', hasRole);

  const supplyCap = 1000000000n * 10n ** 6n;

  log('Setting supply cap:', supplyCap.toString());
  
  const supplyCapHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: TIP20_ABI,
    functionName: 'setSupplyCap',
    args: [supplyCap],
  });
  await publicClient.waitForTransactionReceipt({ hash: supplyCapHash });
  log('Supply cap set');

  // Mint tokens
  const mintAmount = 0n; // 1 million tokens
  log('Minting tokens:', mintAmount.toString());
  
  const mintHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: TIP20_ABI,
    functionName: 'mint',
    args: ["0x0000000000000000000000000000000000000000", mintAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: mintHash });
  log('Tokens minted');

  // Check balance after minting
  const balanceAfterMint = await publicClient.readContract({
    address: tokenAddress,
    abi: TIP20_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });
  log('Balance after mint:', balanceAfterMint.toString());

  // Create a random recipient address
  const recipient = '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('') as Address;
  log('Recipient address:', recipient);

  // Get initial balances
  const senderBalanceBefore = await publicClient.readContract({
    address: tokenAddress,
    abi: TIP20_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });
  const recipientBalanceBefore = await publicClient.readContract({
    address: tokenAddress,
    abi: TIP20_ABI,
    functionName: 'balanceOf',
    args: [recipient],
  });

  log('Balances before transfer:', {
    sender: senderBalanceBefore.toString(),
    recipient: recipientBalanceBefore.toString(),
  });

  // Transfer tokens
  const transferAmount = 100000n * 10n ** 18n; // 100k tokens
  log('Transferring tokens:', transferAmount.toString());

  const transferHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: TIP20_ABI,
    functionName: 'transfer',
    args: [recipient, transferAmount],
  });

  const transferReceipt = await publicClient.waitForTransactionReceipt({ hash: transferHash });
  log('Transfer confirmed in block:', transferReceipt.blockNumber.toString());

  // Parse transfer events
  const transferLogs = parseEventLogs({
    abi: TIP20_ABI,
    logs: transferReceipt.logs,
  });
  
  const transferEvent = transferLogs.find(log => log.eventName === 'Transfer');
  if (transferEvent) {
    log('Transfer event:', transferEvent.args);
  }

  // Get final balances
  const senderBalanceAfter = await publicClient.readContract({
    address: tokenAddress,
    abi: TIP20_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });
  const recipientBalanceAfter = await publicClient.readContract({
    address: tokenAddress,
    abi: TIP20_ABI,
    functionName: 'balanceOf',
    args: [recipient],
  });

  log('Balances after transfer:', {
    sender: senderBalanceAfter.toString(),
    recipient: recipientBalanceAfter.toString(),
  });

  // Verify balances
  const expectedSenderBalance = senderBalanceBefore - transferAmount;
  const expectedRecipientBalance = recipientBalanceBefore + transferAmount;

  if (senderBalanceAfter !== expectedSenderBalance) {
    throw new Error(`Sender balance mismatch: expected ${expectedSenderBalance}, got ${senderBalanceAfter}`);
  }
  if (recipientBalanceAfter !== expectedRecipientBalance) {
    throw new Error(`Recipient balance mismatch: expected ${expectedRecipientBalance}, got ${recipientBalanceAfter}`);
  }

  log('✅ Token transfer test passed!');
  return { tokenAddress, transferAmount, recipient };
}

// Run if executed directly
if (import.meta.main) {
  testTransfer().catch(console.error);
}

export { testTransfer };