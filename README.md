# TIP20 Viem Scripts

Simple TypeScript scripts using Viem to interact with TIP20 tokens on the Tempo blockchain via JSON-RPC.

## Overview

This repository contains TypeScript examples demonstrating how to:
- Create TIP20 tokens using the factory contract
- Transfer tokens between addresses
- Understand gas fee mechanics in Tempo (paid in TIP20 tokens, not native currency)

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Access to a Tempo node with JSON-RPC enabled
- Test account with TIP20 tokens for gas fees

## Installation

```bash
# Install dependencies
bun install
```

## Configuration

Edit `src/config.ts` to set:
- RPC URL (default: `http://localhost:8545`)
- Chain ID (default: 1001)
- Private key or mnemonic for test account

## Contract Addresses

The following precompile addresses are used:
- TIP20 Factory: `0x20FC000000000000000000000000000000000000`
- Fee Manager: `0x1559000000000000000000000000000000000000`
- TIP403 Registry: `0x403C000000000000000000000000000000000000`
- TIP4217 Registry: `0x4217C00000000000000000000000000000000000`

TIP20 token addresses follow the pattern: `0x20C0000000000000000000000000000[TOKEN_ID]`

## Running Tests

### Run All Tests
```bash
bun run test:all
```

### Individual Tests

**Create Token:**
```bash
bun run test:create-token
```
Creates a new TIP20 token and verifies its properties.

**Transfer Tokens:**
```bash
bun run test:transfer
```
Creates a token, mints tokens, and transfers them between addresses.

**Gas Fees:**
```bash
bun run test:gas-fees
```
Demonstrates how gas fees are paid in TIP20 tokens instead of native currency.

## Script Structure

```
src/
├── abis.ts         # Contract ABIs for TIP20, Factory, Roles, and Fee Manager
├── config.ts       # Chain configuration, client setup, and helper functions
├── create-token.ts # Token creation example
├── transfer.ts     # Token transfer with role management
├── gas-fees.ts     # Gas fee payment demonstration
└── index.ts        # Main script that runs all tests
```

## Key Concepts

### Token Creation
Tokens are created through the TIP20 Factory contract. Each token gets a unique ID and deterministic address.

```typescript
const hash = await walletClient.writeContract({
  address: TIP20_FACTORY_ADDRESS,
  abi: TIP20_FACTORY_ABI,
  functionName: 'createToken',
  args: [name, symbol, currency, admin],
});
```

### Role Management
TIP20 tokens use role-based access control. The issuer role is required to mint tokens:

```typescript
// Grant issuer role
await walletClient.writeContract({
  address: tokenAddress,
  abi: ROLES_AUTH_ABI,
  functionName: 'grantRole',
  args: [ISSUER_ROLE, account],
});
```

### Gas Fees in TIP20
Tempo uses TIP20 tokens for gas fees instead of native currency:
1. Each user has a designated fee token set in the Fee Manager
2. Gas costs are deducted from the fee token balance
3. Native balance typically remains at 0

## Example Output

```
[2024-01-01T00:00:00.000Z] Starting TIP20 token creation test
[2024-01-01T00:00:00.100Z] Account address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
[2024-01-01T00:00:00.200Z] Initial token ID counter: 0
[2024-01-01T00:00:00.300Z] Creating token with params: {
  "name": "Test Token",
  "symbol": "TEST",
  "currency": "USD",
  "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}
[2024-01-01T00:00:01.000Z] Transaction confirmed in block: 123
[2024-01-01T00:00:01.100Z] Created token ID: 0
[2024-01-01T00:00:01.200Z] Token address: 0x20C0000000000000000000000000000000000000
[2024-01-01T00:00:01.300Z] ✅ Token creation test passed!
```

## Troubleshooting

### Connection Issues
- Ensure your Tempo node is running and accessible
- Check the RPC URL in `src/config.ts`
- Verify firewall settings allow connection to the RPC port

### Transaction Failures
- Ensure your account has sufficient TIP20 tokens for gas fees
- Check that you have the necessary roles (e.g., issuer role for minting)
- Verify contract addresses match your network

### Type Errors
- Run `bun run typecheck` to check for TypeScript errors
- Ensure all dependencies are installed with `bun install`

## Advanced Usage

### Custom Token Properties
Modify token creation parameters in `create-token.ts`:
```typescript
const tokenParams = {
  name: 'Your Token Name',
  symbol: 'YTN',
  currency: 'EUR',  // Currency code for decimals
  admin: yourAdminAddress,
};
```

### Batch Operations
Use Promise.all for parallel reads:
```typescript
const [balance1, balance2, totalSupply] = await Promise.all([
  publicClient.readContract({ ... }),
  publicClient.readContract({ ... }),
  publicClient.readContract({ ... }),
]);
```

### Event Monitoring
Subscribe to events using Viem's watch functions:
```typescript
const unwatch = publicClient.watchContractEvent({
  address: tokenAddress,
  abi: TIP20_ABI,
  eventName: 'Transfer',
  onLogs: (logs) => console.log(logs),
});
```

## License

MIT