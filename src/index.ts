import { createToken } from './create-token';
import { testTransfer } from './transfer';
import { testGasFees } from './gas-fees';
import { log } from './config';

async function runAllTests() {
  log('🚀 Starting TIP20 E2E Tests with Viem');
  log('=====================================\n');

  const results = {
    createToken: false,
    transfer: false,
    gasFees: false,
  };

  try {
    log('📝 Test 1: Create Token');
    log('------------------------');
    await createToken();
    results.createToken = true;
    log('\n');
  } catch (error) {
    log('❌ Create Token test failed:', error);
    log('\n');
  }

  try {
    log('💸 Test 2: Token Transfer');
    log('-------------------------');
    await testTransfer();
    results.transfer = true;
    log('\n');
  } catch (error) {
    log('❌ Token Transfer test failed:', error);
    log('\n');
  }

  try {
    log('⛽ Test 3: Gas Fees');
    log('-------------------');
    await testGasFees();
    results.gasFees = true;
    log('\n');
  } catch (error) {
    log('❌ Gas Fees test failed:', error);
    log('\n');
  }

  // Summary
  log('=====================================');
  log('📊 Test Results Summary:');
  log('------------------------');
  Object.entries(results).forEach(([test, passed]) => {
    log(`${passed ? '✅' : '❌'} ${test}`);
  });

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  log(`\nTotal: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    log('\n⚠️ Some tests failed. Please check the logs above.');
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch((error) => {
  log('Fatal error running tests:', error);
  process.exit(1);
});