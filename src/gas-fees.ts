import { TIP20_ABI, FEE_MANAGER_ABI } from './abis';
import { 
  TIP_FEE_MANAGER_ADDRESS,
  publicClient, 
  walletClient, 
  account,
  log
} from './config';

async function testGasFees() {
  log('Starting TIP20 gas fee test');
  log('Account address:', account.address);

  // Check native balance (should be 0 in Tempo)
  const nativeBalance = await publicClient.getBalance({ address: account.address });
  log('Native balance:', nativeBalance.toString());

  if (nativeBalance !== 0n) {
    log('Warning: Native balance is not 0, this test expects no native balance');
  }

  // Get user's fee token from fee manager
  const feeTokenAddress = await publicClient.readContract({
    address: TIP_FEE_MANAGER_ADDRESS,
    abi: FEE_MANAGER_ABI,
    functionName: 'userTokens',
    args: [account.address],
  });
  log('Fee token address:', feeTokenAddress);

  // Get initial balance of fee token
  const initialBalance = await publicClient.readContract({
    address: feeTokenAddress,
    abi: TIP20_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });
  log('Initial fee token balance:', initialBalance.toString());

  // Send a simple transaction (self-transfer)
  log('Sending transaction to self...');
  const hash = await walletClient.sendTransaction({
    to: account.address,
    value: 0n,
  });
  log('Transaction hash:', hash);

  // Wait for receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  log('Transaction confirmed in block:', receipt.blockNumber.toString());
  log('Gas used:', receipt.gasUsed.toString());
  log('Effective gas price:', receipt.effectiveGasPrice.toString());

  // Calculate expected gas cost
  const gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
  log('Total gas cost:', gasCost.toString());

  // Get balance after transaction
  const balanceAfter = await publicClient.readContract({
    address: feeTokenAddress,
    abi: TIP20_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });
  log('Fee token balance after:', balanceAfter.toString());

  // Calculate actual fee paid
  const feePaid = initialBalance - balanceAfter;
  log('Fee paid:', feePaid.toString());

  // Verify fee matches gas cost
  if (feePaid !== gasCost) {
    throw new Error(`Fee mismatch: expected ${gasCost}, paid ${feePaid}`);
  }

  // Verify native balance is still 0
  const finalNativeBalance = await publicClient.getBalance({ address: account.address });
  log('Final native balance:', finalNativeBalance.toString());

  if (finalNativeBalance !== 0n) {
    throw new Error('Native balance should remain 0');
  }

  log('✅ Gas fee test passed!');
  return { feeTokenAddress, feePaid, gasCost };
}

// Run if executed directly
if (import.meta.main) {
  testGasFees().catch(console.error);
}

export { testGasFees };