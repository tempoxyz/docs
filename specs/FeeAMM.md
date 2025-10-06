# Fee AMM Specification

## Abstract

This specification defines a system of one-way Automated Market Makers (AMMs) designed to facilitate gas fee payments from the stablecoin preferred by the user (the `userToken`) to a different stablecoin preferred by the validator (the `validatorToken`), while allowing arbitrageurs to rebalance the pools in the other direction. Each AMM handles fee swaps from one `userToken` to another `validatorToken` at a fixed price, and allows rebalancing in the other direction at a variable price (meaning there are two AMMs for each pair of tokens, one in each direction).

## Motivation

Current blockchain fee systems typically require users to hold native tokens for gas payments. This creates friction for users who prefer to transact in stablecoins. 

The Fee AMM is a dedicated AMM for trading between stablecoins, which can only be used by the protocol to trade tokens it has received as fees in that block, or by arbitrageurs rebalancing it to keep it balanced. The protocol automatically collects fees in many different coins during the block, and then sells them all at the end of the block (paying a constant price). It permits some top-of-block MEV to rebalance the pool, but is designed to minimize the backrunning or JIT MEV that can lead to spam.

### MEV Mitigation Strategy

The system is designed to minimize several forms of MEV:

- **No Probabilistic MEV**: The fixed fee swap rate and batch settlement prevent profitable backrunning of fee swaps. There is no way to profitably spam the chain with transactions hoping an opportunity might arise.
- **No Sandwich Attacks**: Fee swaps execute at a fixed rate and settle atomically at block end, eliminating sandwich attack vectors.
- **Top-of-Block Auction**: The main MEV in the AMM (from rebalancing) occurs as a single race at the top of the next block rather than creating probabilistic spam throughout.

## Specification

### Overview

The Fee AMM implements two distinct swap mechanisms:

1. **Fee Swaps**: Fixed-rate swaps at a price of `0.9970` (validator token per user token) from `userToken` to `validatorToken`
2. **Rebalancing Swaps**: Fixed-rate swaps at a price of `0.9985` (validator token per user token) from `validatorToken` to `userToken`

### Core Components

#### 1. FeeAMM Contract

The primary AMM contract managing liquidity pools and swap operations.

##### Pool Structure
```solidity
struct Pool {
    uint128 reserveUserToken;           // Reserve of userToken
    uint128 reserveValidatorToken;      // Reserve of userToken
    uint128 pendingFeeSwapIn;  // Pending token0 input from fee swaps
}
```

##### Key Functions

**`feeSwap(userToken, validatorToken, amountIn, to)`**
- Executes fee swaps from `userToken` to `validatorToken` at fixed rate of 0.997
- Only executed by the protocol, at the end of each transaction that pays fees in `userToken`
- Tracks pending inputs for settlement

**`rebalanceSwap(userToken, validatorToken, amountOut, to)`**
- Executes rebalancing swaps from `validatorToken` to `userToken` at fixed rate of 0.9985 (validator token per user token)
- Can be executed by anyone

**`executePendingFeeSwaps(userToken, validatorToken)`**
- Settles all pending fee swaps by updating reserves
- Only executed by the protocol, at the end of each block

#### 2. FeeManager Contract

Coordinates fee collection and distribution.

##### Key Functions

**`collectFeePreTx(user, maxAmount)`**
- Called before transaction execution
- Collects maximum possible fee from protocol
- Verifies pool liquidity sufficiency
- Returns user's token preference

**`collectFeePostTx(user, actualUsed, userToken)`**
- Called after transaction execution
- Refunds unused tokens to user
- Queues actual used amount for fee swaps

**`executeBlock()`**
- Called at end of each block
- Executes pending fee swaps via AMM
- Transfers converted tokens to validator
- Access: Protocol only

### Swap Mechanisms

#### Fee Swaps
- **Rate**: Fixed at m=0.997 (validator receives 0.997 of their preferred token per 1 user token that user pays)
- **Direction**: User token to validator token
- **Purpose**: Convert tokens paid by users as fees to tokens preferred by validators
- **Settlement**: Batched at block end

#### Rebalancing Swaps
- **Rate**: Fixed at 0.9985 (swapper receives 1 of the user token for every 0.9985 that they put in of the validator's preferred token)
- **Direction**: Validator token to user token
- **Purpose**: Refill reserves of validator token in the pool
- **Settlement**: Immediate

### Liquidity Provision

#### Adding Liquidity
- Open to anyone
- Receives fungible LP tokens
- Pro-rata share of pool reserves
- First provider sets initial reserves, and mints liquidity tokens equal to their arithmetic mean
- First provider must burn 1,000 liquidity tokens, for the [same reason as in Uniswap v2](https://dapp.org.uk/reports/uniswapv2.html#orgdeb0867). Note that for USD tokens, this has a cost of about $0.02.

#### Removing Liquidity
- Burns LP tokens
- Receives pro-rata share of reserves
- Blocked if withdrawal would prevent pending swaps

### Fee Collection Flow

1. **Pre-Transaction**:
   - Protocol calculates maximum gas needed
   - FeeManager verifies pool liquidity
   - Collects maximum fee from user

2. **Post-Transaction**:
   - Calculate actual gas used
   - Refund excess to user
   - Queue remainder for swap

3. **Block End**:
   - Execute all pending fee swaps
   - Update pool reserves
   - Transfer proceeds to validators


### Events

```solidity
event PoolCreated(address indexed userToken, address indexed validatorToken)
event RebalanceSwap(address indexed userToken, address indexed validatorToken, address indexed swapper, uint256 amountIn, uint256 amountOut)
event FeeSwap(address indexed userToken, address indexed validatorToken, uint256 amountIn uint256 amountOut);
event Mint(address indexed sender, address indexed userToken, address indexed validatorToken, uint256 amountUserToken, uint256 amountValidatorToken, uint256 liquidity)
event Burn(address indexed sender, address indexed userToken, address indexed validatorToken, uint256 amountUserToken, uint256 amountValidatorToken, uint256 liquidity, address to)
```

`Transfer` events are emitted as usual for transactions, with the exception of paying gas fees via TIP20 tokens. For fee payments, a single `Transfer` event is emitted post execution to represent the actual fee amount consumed (ie. `gasUsed * gasPrice`).

### Gas Considerations

Fee operations are designed to be gas-free from the user perspective:
- Collection happens at protocol level
- Swaps execute outside normal transaction flow
- Block-end settlement requires no user gas


### System Transactions

This specification introduces **system transactions**, with the first being the `executeBlock()` call to the `FeeManager` contract at the end of each block. A system transaction is a legacy transaction with an empty signature (`r = 0`, `s = 0`, `yParity = false`) and with the sender as the 0 address (`0x0000000000000000000000000000000000000000`).

System transactions are only allowed when there is a specific consensus rule allowing them. A block is invalid if any required system transaction is missing or if any extra system transaction is present.

System transactions do not consume block gas, do not increment a sender nonce, do not contribute to block gas limit, and do not pay fees. They may set any gas price and gas limit (as specified by a specific rule), regardless of their execution gas or the block base fee. System transactions must not revert.

#### Execution transaction

Under this specification, exactly one system transaction must appear at the end of every block. It must have the following parameters:

| Field                                | Value / Requirement                                                                                          | Notes / Validation                                                                                                  |
|--------------------------------------|---------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| **Type**                              | Legacy transaction                                                                                            |                                                            |
| **Position in Block**                 | **Last transaction**                                                                                          | Block is **invalid** if absent or not last.                                                                          |
| **From (sender)**                     | `0x0000000000000000000000000000000000000000`                                                                  | Zero address                                                                                           |
| **To (recipient)**                    | `0xfeec000000000000000000000000000000000000`                                                                                 | FeeManager precompile.                                                                                  |
| **Calldata**                          | `0xb306cc70`                                                                                  |  ABI-encoded `executeBlock()`, no arguments.                                                                                                         |
| **Value**                             | `0`                                                                                                           | No native token transfer.                                                                                             |
| **Nonce**                             | 0                                                                |                                                                             |
| **Gas Limit**                         | 0                                                           | Does **not** contribute to block gas accounting.                                                                      |
| **Gas Price**                         | 0                                                    | Independent of block base fee; does not pay fees.                                                                     |
| **Signature**                         | `r = 0`, `s = 0`, `yParity = false`                                                                           | Empty signature designates system transaction.                                                                        |


The proposer **must** construct and include this transaction when building the block. A block is invalid if the transaction is absent or not in the final position.
