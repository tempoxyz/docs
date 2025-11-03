# Reward Distribution

## Abstract

This specification defines an opt-in, scalable, pro-rata streaming reward distribution mechanism for TIP20 tokens. It introduces `startReward(amount, seconds)` as a function built into the TIP-20 token contract, which starts a linear stream that distributes `amount` evenly over `seconds`. Streams can be canceled by the funder. Users must opt in to rewards distribution and may delegate rewards to a chosen recipient. Rewards are automatically distributed to recipient balances during balance-changing operations (transfers, mints, burns) or when changing the reward recipient.

The design uses a scalable “reward-per-token” accumulator. The reward rate is tracked via a global `totalRewardPerSecond` and applied over time.

## Motivation

Many applications (such as incentive programs, reward distribution, deterministic inflation, and staking) often require pro-rata distribution of some tokens to existing holders of that token. Building this into the TIP-20 contract allows Tempo to support this behavior efficiently,  without forcing users to stake their tokens on another contract or requiring distributors to loop over all holders.

## Roles and Policy

- Any address may start a reward stream via `startReward(amount, seconds)`.
- Any token holder may opt in and select a `rewardRecipient` that will receive rewards attributable to their balance.
- Accrued rewards are automatically distributed to the recipient's balance during any balance-changing operation (transfers, mints, burns) or when changing the reward recipient.
- A stream's funder may cancel that stream via `cancelReward(id)`.

## Interfaces

### TIP20 Contract Interface

- `startReward(uint256 amount, uint32 seconds) returns (uint64 id)`
  - Transfers `amount` of the TIP20 token from `msg.sender` into the token's reward pool (TIP-403 applies).
  - If `seconds == 0`, immediately distributes `amount` to current opted-in holders by increasing `rewardPerTokenStored`.
  - If `seconds > 0`, starts a linear stream that emits evenly from `block.timestamp` to `block.timestamp + seconds`.
  - Returns a unique `id` for later cancellation (always 0 for immediate payouts).
  - Reverts if `amount == 0`.
  - Allowed when `optedInSupply == 0` (tokens distributed while `optedInSupply` is 0 are locked permanently).

- `cancelReward(uint64 id) returns (uint256 refund)`
  - Callable only by the stream’s `funder`.
  - Stops future emission for that stream at `block.timestamp`.
  - Computes `refund = amountTotal - distributedSoFar` and attempts to transfer `refund` from the pool back to the funder (TIP-403 applies).
  - If the refund transfer is forbidden by TIP-403, the stream is still canceled and `refund == 0` is returned.

- `setRewardRecipient(address recipient)`
  - If `recipient` is `address(0)`, opts out `msg.sender` from rewards distribution.
  - Otherwise, opts in `msg.sender` for rewards and sets `recipient` as the address that will receive accrued rewards attributable to the balance of `msg.sender`.
  - May be called with `recipient == msg.sender`.
  - Reverts if `recipient` is not `address(0)` and either `msg.sender` or `recipient` is not authorized to receive tokens under TIP-403.
  - **Automatically distributes any accrued rewards** to the current recipient before changing the recipient setting.

- `finalizeStreams(uint64 timestamp)`
  - Callable only by the zero address via system transaction.
  - Finalizes all streams scheduled to end at `timestamp`.
  - Decreases `totalRewardPerSecond` by `scheduledRateDecrease[timestamp]`.
  - See System Transactions section for details.

### View Functions

- `function totalRewardPerSecond() external view returns (uint256 rateScaled);`
  - Current aggregate per-second emission scaled by `ACC_PRECISION`.

- `function getStream(uint64 id) external view returns (
    address funder,
    uint64 startTime,
    uint64 endTime,
    uint256 ratePerSecondScaled,
    uint256 amountTotal
  );`

## Events

```solidity
event RewardScheduled(address indexed funder, uint64 indexed id, uint256 amount, uint32 seconds);
event RewardCanceled(address indexed funder, uint64 indexed id, uint256 refund);
event RewardRecipientSet(address indexed holder, address indexed recipient);
```

## Errors

```solidity
error InvalidAmount();     // amount == 0
error NotStreamFunder();   // cancel by non-funder
error StreamInactive();    // cancel on non-existent or already-canceled stream
error PolicyForbids();     // TIP-403 policy violation
```

## State and Accounting

Use a magnified accumulator to avoid per-holder iteration and to maintain O(1) updates and claims.

- **Constants**
  - `ACC_PRECISION = 1e18` — fixed-point scale for both the accumulator and per-second rate.

- **Global**
  - `uint256 rewardPerTokenStored` — cumulative rewards per whole token, scaled by `ACC_PRECISION`.
  - `uint64  lastUpdateTime` — last timestamp the accumulator was updated.
  - `uint256 totalRewardPerSecond` — aggregate per-second emission, scaled by `ACC_PRECISION`.
  - `uint128 optedInSupply` — aggregate supply counted for rewards at moments of distribution updates.
  - `uint64  nextStreamId` — starts at 1.
  - `mapping(uint64 => uint256) scheduledRateDecrease` — mapping from block timestamp to total rate decrease scheduled for that time.

- **Per holder**
  - `mapping(address => address) rewardRecipientOf` — current reward recipient for a holder (zero means opted-out).

- **Per recipient**
  - `mapping(address => uint256) userRewardPerTokenPaid` — snapshot of `rewardPerTokenStored` last time the recipient's accounting was updated.
  - `mapping(address => uint128) delegatedBalance` — total balance delegated to this recipient by all holders.

- **Streams**
  ```solidity
  struct Stream {
      address funder;
      uint64  startTime;
      uint64  endTime;
      uint256 ratePerSecondScaled; // amount / seconds * ACC_PRECISION
      uint256 amountTotal;
  }
  mapping(uint64 => Stream) streams;
  ```

## Accrual

Accrual is piecewise-linear based on block time and current opted-in supply. Immediate payouts (when `seconds = 0`) directly increase `rewardPerTokenStored` without affecting `totalRewardPerSecond`.

### `_accrue()`

```
elapsed = block.timestamp - lastUpdateTime
lastUpdateTime = block.timestamp

if (elapsed == 0) return;

// Clock keeps running even if optedInSupply == 0 (no backfill)
if (optedInSupply == 0) return;

if (totalRewardPerSecond > 0) {
    // deltaRPT = totalRewardPerSecond * elapsed / optedInSupply
    deltaRPT = (totalRewardPerSecond * uint256(elapsed)) / uint256(optedInSupply);
    rewardPerTokenStored += deltaRPT;
}
```

Use 256-bit math. Assume `totalSupply < 2^128`.

## Algorithms

### Starting a Stream — `startReward(amount, seconds)`

1. `if (amount == 0) revert InvalidAmount();`
2. Transfer `amount` from `msg.sender` to the token contract's reward pool (TIP-403 check; revert `PolicyForbids()` on failure).
3. `_accrue()`.
4. If `seconds == 0` (immediate payout):
   - If `optedInSupply > 0`:
     - `deltaRPT = (amount * ACC_PRECISION) / optedInSupply`
     - `rewardPerTokenStored += deltaRPT`
   - Emit `RewardScheduled(msg.sender, 0, amount, 0)`.
   - Return `0`.
5. Otherwise (streaming payout):
   - `rate = (amount * ACC_PRECISION) / seconds`.
   - `id = nextStreamId++`.
   - `totalRewardPerSecond += rate`.
   - `endTime = uint64(block.timestamp) + seconds`.
   - Store:
     ```
     streams[id] = Stream({
       funder: msg.sender,
       startTime: uint64(block.timestamp),
       endTime:   endTime,
       ratePerSecondScaled: rate,
       amountTotal: amount
     });
     ```
   - **Scheduling:** Add `rate` to `scheduledRateDecrease[endTime]` to schedule a rate reduction when the stream ends.
   - Emit `RewardScheduled(msg.sender, id, amount, seconds)`.
   - Return `id`.

### Scheduled End (System Transaction)

When a block's timestamp matches a scheduled `endTime` value in `scheduledRateDecrease`:

1. A system transaction calls `finalizeStreams(uint64 timestamp)` on the TIP20 token contract.
2. The function performs:
   - `_accrue()` before changing rates.
   - `totalRewardPerSecond -= scheduledRateDecrease[timestamp]`.
   - `delete scheduledRateDecrease[timestamp]`.

No transfers occur here; any rounding dust remains in the pool. This system transaction is triggered automatically when `scheduledRateDecrease[block.timestamp] > 0`.


### Canceling a Stream — `cancelReward(id)`

1. Load `s = streams[id]`; if `s.funder == address(0)`, revert `StreamInactive()`.
2. If `msg.sender != s.funder`, revert `NotStreamFunder()`.
3. If `block.timestamp >= s.endTime`, revert `StreamInactive()`.
4. `_accrue()` before changing rates.
5. Compute elapsed within the stream's window:
   ```
   t0 = s.startTime
   t1 = s.endTime
   t  = block.timestamp <= t0 ? 0 : (block.timestamp - t0);
   distributed = (s.ratePerSecondScaled * uint256(t)) / ACC_PRECISION;
   if (distributed > s.amountTotal) distributed = s.amountTotal; // safety clamp
   remaining = s.amountTotal - distributed;
   ```
6. Decrease `totalRewardPerSecond` by `s.ratePerSecondScaled`.
7. Decrease `scheduledRateDecrease[s.endTime]` by `s.ratePerSecondScaled` (cancel the scheduled end).
8. Delete `streams[id]`.
9. Attempt to transfer `remaining` from pool to `s.funder` (TIP-403 check):
   - If allowed, transfer and set `refund = remaining`.
   - If forbidden, do not transfer; set `refund = 0`. The undistributed remainder stays in the pool.
10. Emit `RewardCanceled(s.funder, id, refund)`.
11. Return `refund`.

### Balance Changes for Opted-In Holders

On any change to an opted-in holder’s balance (mint, burn, transfer in/out), first call `_accrue()` and then update accrued rewards for their recipient:

```
recipient = rewardRecipientOf[holder]
if (recipient != address(0)) {
    accrued = delegatedBalance[recipient] * (rewardPerTokenStored - userRewardPerTokenPaid[recipient]) / ACC_PRECISION
    rewards[recipient] += accrued
    userRewardPerTokenPaid[recipient] = rewardPerTokenStored
}
```

Then adjust `balanceOf[holder]`, `delegatedBalance[recipient]`, and `optedInSupply` by the balance delta.

### Set Reward Recipient

1. `_accrue()`.
2. Enforce TIP-403 authorization rules for both `msg.sender` and `recipient`; if failing, revert `PolicyForbids()`.
3. If `recipient` equals the current `rewardRecipientOf[msg.sender]`, return.
4. If currently opted in:
   - Settle accrued rewards for the current recipient as above.
   - Decrease `delegatedBalance[oldRecipient]` by `balanceOf[msg.sender]`.
5. If `recipient == address(0)`:
   - Set `rewardRecipientOf[msg.sender] = address(0)`.
   - Decrease `optedInSupply` by `balanceOf[msg.sender]`.
   - Emit `RewardRecipientSet(msg.sender, address(0))`.
6. Otherwise:
   - Settle accrued rewards for `recipient` as above.
   - Set `rewardRecipientOf[msg.sender] = recipient`.
   - Increase `delegatedBalance[recipient]` by `balanceOf[msg.sender]`.
   - Increase `optedInSupply` by `balanceOf[msg.sender]` if previously opted out.
   - Emit `RewardRecipientSet(msg.sender, recipient)`.

### Automatic Reward Distribution

Rewards are automatically distributed to recipients during any operation that calls `_updateRewards(recipient)`. This happens during:
- Token transfers (for both sender and receiver if they have opted in)
- Token mints (for the recipient if opted in)
- Token burns (for the sender if opted in)
- Setting or changing reward recipient

The `_updateRewards(recipient)` function:
1. Calculates accrued rewards:
   ```
   accrued = delegatedBalance[recipient] * (rewardPerTokenStored - userRewardPerTokenPaid[recipient]) / ACC_PRECISION
   ```
2. Updates the tracking variable:
   ```
   userRewardPerTokenPaid[recipient] = rewardPerTokenStored
   ```
3. If `accrued > 0`, immediately transfers the rewards from the contract balance to the recipient's balance and emits a `Transfer(address(this), recipient, accrued)` event.

## TIP-403 Policy Integration

All movements of tokens precipitated by this mechanism must pass TIP-403 checks using the token's `transferPolicyId`:

- `startReward` validates funder → pool.
- `setRewardRecipient` validates holder and recipient authorization.
- Automatic reward distribution (via `_updateRewards`) transfers from pool → recipient are checked by the standard transfer policy during normal transfers, mints, and burns. The recipient must be authorized to receive tokens.
- `cancelReward` attempts pool → funder; if forbidden, the stream is canceled but no refund is transferred.

If any check fails, revert `PolicyForbids()`.

## Gas Considerations

- `_accrue()` is O(1) and triggered on existing touchpoints (transfers, mints, burns, setting reward recipient).
- Starting/ending/canceling a stream is O(1).
- No per-second or per-stream iteration is required; the scheduled end is a constant-time rate subtraction.
- Per-holder costs arise on setting a reward recipient and on subsequent balance changes for opted-in holders.
- Rewards are distributed automatically during balance-changing operations, eliminating the need for a separate claim transaction.

## System Transactions

This specification uses **system transactions** to finalize streams when they reach their scheduled end time. A system transaction is a legacy transaction with an empty signature (`r = 0`, `s = 0`, `yParity = false`) and with the sender as the zero address (`0x0000000000000000000000000000000000000000`).

### Stream Finalization Transaction

When any TIP20 token has `scheduledRateDecrease[block.timestamp] > 0`, exactly one system transaction must appear at the end of the block. This single transaction calls the TIP20Factory, which loops over all tokens to finalize those with scheduled stream ends. The transaction must have the following parameters:

| Field                 | Value / Requirement                                          | Notes / Validation                                     |
|-----------------------|--------------------------------------------------------------|--------------------------------------------------------|
| **Type**              | Legacy transaction                                           |                                                        |
| **Position in Block** | End of block (after all user transactions)                   | Block is **invalid** if absent when required.         |
| **From (sender)**     | `0x0000000000000000000000000000000000000000`                 | Zero address                                           |
| **To (recipient)**    | `0x20Fc000000000000000000000000000000000000`                 | The TIP20Factory precompile address                    |
| **Calldata**          | ABI-encoded `finalizeAllStreams(uint64 timestamp)` with `timestamp = block.timestamp` | |
| **Value**             | `0`                                                          | No native token transfer.                              |
| **Nonce**             | `0`                                                          |                                                        |
| **Gas Limit**         | `0`                                                          | Does **not** contribute to block gas accounting.       |
| **Gas Price**         | `0`                                                          | Independent of block base fee; does not pay fees.      |
| **Signature**         | `r = 0`, `s = 0`, `yParity = false`                          | Empty signature designates system transaction.         |

The proposer **must** construct and include this transaction when building the block if any TIP20 token has `scheduledRateDecrease[block.timestamp] > 0`. A block is invalid if the required transaction is absent or positioned incorrectly.

The proposer determines which tokens need finalization by checking each TIP20 token's `scheduledRateDecrease[block.timestamp]` mapping.

### TIP20Factory: `finalizeAllStreams(uint64 timestamp)` Function

This function on the TIP20Factory is callable only by the zero address (i.e., via system transaction). It loops over all TIP20 tokens and finalizes any with scheduled stream ends:

```solidity
function finalizeAllStreams(uint64 timestamp) external {
    require(msg.sender == address(0), "Only system");
    require(timestamp == block.timestamp, "Invalid timestamp");
    
    // Loop over all TIP20 tokens
    for (uint256 i = 0; i < tokenIdCounter; i++) {
        address tokenAddress = getTokenAddress(i);
        TIP20 token = TIP20(tokenAddress);
        
        // Check if this token has streams to finalize
        if (token.scheduledRateDecrease(timestamp) > 0) {
            token.finalizeStreams(timestamp);
        }
    }
}
```

### TIP20: `finalizeStreams(uint64 timestamp)` Function

This function on each TIP20 token is callable only by the TIP20Factory when invoked via system transaction:

```solidity
function finalizeStreams(uint64 timestamp) external {
    require(msg.sender == FACTORY, "Only factory");
    require(timestamp == block.timestamp, "Invalid timestamp");
    
    uint256 rateDecrease = scheduledRateDecrease[timestamp];
    require(rateDecrease > 0, "No streams to finalize");
    
    _accrue();
    totalRewardPerSecond -= rateDecrease;
    delete scheduledRateDecrease[timestamp];
}
```