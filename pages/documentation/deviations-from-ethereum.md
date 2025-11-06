# Key Differences from Ethereum

Tempo maintains EVM compatibility, tooling etc. However there are some differences in the behaviors, which are collected on this page for ease of reference. 

## 1. Fee System & Gas Economics

A key deviation from the Ethereum spec is the fee system:

1. At launch, Tempo has no native token. Instead, transaction fees (i.e., both gas fees, and priority fees), can be paid directly in stablecoins. The only requirements are that this be a USD denominated stablecoin, issued as a native [TIP-20](#2-token-standards) contract, and that there be sufficient liquidity on the native [feeAMM](#fee-amm). 
2. Tempo has a fixed base fee (rather than a variable base fee as in [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)). This is set so that a TIP-20 transfer costs &lt;$0.001. 
3. All fees accrue to the validator who proposes the block. 

More details on this can be found on [this page](/protocol/specs/Fees).

## 2. TIP-20 Token Standard

The [TIP-20](/protocol/tokens/tip-20) contract suite extends the ERC-20 stable with additional stablecoin/ payments-oriented functionality. While the ERC-20 is just a standard, on Tempo, the TIP-20 suite is implemented as a pre-compile for performance reasons, making it part of the protocol. Tokens issued according to this standard are deployed to predictable addresses with the pattern `0x20C0000000000000000000000000<tokenId>`. 
Only tokens issued as TIP-20s can be used to pay transaction fees, or access the [payments lane](#payments-lane).

Other features include: 
- **Role-based access control**: Built-in roles (PAUSE_ROLE, ISSUER_ROLE, BURN_BLOCKED_ROLE) for issuer ergonomics.
- **Shared policy registry**: Integration with [TIP-403 Policy Registry](/protocol/tokens/tip-403) for contracts to share managed whitelists /blacklists.
- **Memos**: TIP-20 tokens have additional functions (`transferWithMemo`, `transferFromWithMemo`, `mintWithMemo`, `burnWithMemo`). These are like the corresponding standard functions but with an an additional 32-byte memo argument for easy reconciliation. 



## 3. Block Structure

Tempo blocks have additional constraints/ structure relative to Ethereum blocks: a portion of the gas limit of a whole block that can only be used in a pre-specified way. We describe these below: 

### Payments Lane
The [payments lane](/protocol/specs/PaymentLane) reserves a certain amount of gas for payment transactions. Currently, these are transactions where the `tx.to` field matches the TIP-20 address pattern `0x20C0000000000000000000000000<tokenId>`. This gas is not available to any other transaction. 

### Validator Shared Blockspace

Validators other than the proposer can propose transactions via [sub-blocks](/protocol/specs/reserved-gas). A portion of the gas in the block is reserved for these sub-blocks, similar to payment lanes (see [page](/protocol/specs/reserved-gas) for details).

### System Transactions

The final transactions in a block are system transactions from the zero address (`0x0000...0000`) with empty signatures:
- **Sub-block transaction**: A validator sub-block metadata transaction (described [here](/protocol/specs/reserved-gas)) is in the second-to-last position.
- **Fee execution transaction**: At end of block, a system transaction calls `FeeManager.executeBlock()` to settle fee swaps for transactions in the block.

System transactions don't consume block gas, don't increment nonces, and don't pay fees.



## 4. Default Account Abstraction (DAA)

Tempo implements a default Account Abstraction model that automatically upgrades EOAs to smart contract wallets on first use. This extends [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), see the [specification](/protocol/accounts) for details.


### Native AA transaction type
Tempo implements native [account abstraction](/protocol/transactions/account-abstraction) via a new transaction type which enables:

- **WebAuthn/P256 signature validation**: enables passkey accounts
- **Parallelizable nonces**: allows higher tx throughput for each account
- **Gas sponsorship**: allows apps to pay for their users's transactions
- **Call Batching**: allows  users to multicall efficiently
- **Scheduled Txs**: allows users to specify a time window in which their tx can be executed

See the [specification](/protocol/transactions/account-abstraction) for details.


## 5. Enshrined Protocol Features

### Stablecoin Exchange

Tempo has an enshrined [Stablecoin AMM](/documentation/exchange/) at `0xDEc0000000000000000000000000000000000000`. This is an on-chain order book with price-time priority which supports trade between USD stablecoin pairs.

### Fee AMM

The [Fee AMM](/protocol/specs/FeeAMM) enables users to pay in their desired stablecoins, automatically swapping it into the validator's desired stable at the end of each block. At a high level, this implements fixed-rate swaps for fee conversion (0.997 validator tokens per user token).

The FeeManager precompile at `0xfeec000000000000000000000000000000000000` coordinates pre-transaction fee collection and balance verification, post-transaction refunds and fee swap queuing and block-end settlement via the `executeBlock()` system transaction described above.

## 6. Consensus 

Tempo uses Commonware's implementation of the [Simplex protocol](https://simplex.blog/) as its consensus protocol. Simplex is a new family of Byzantine fault tolerant (BFT) protocols that achieves safety and liveness with a remarkably simple structure, while also offering flexibility in the number of rounds and fault tolerance it supports. In particular, this enables Tempo to offer **sub-second, single slot finality**. Further details are are available [here](/protocol/consensus/).



