# Reward Distribution

## Abstract

This specification defines an opt-in, scalable, pro-rata streaming reward distribution mechanism for TIP20 tokens. It introduces `startReward(amount, seconds)` as a function built into the TIP-20 token contract, which starts a linear stream that distributes `amount` evenly over `seconds`. Streams can be canceled by the funder. Users must opt in to rewards distribution and may delegate rewards to a chosen recipient. Accrued rewards are tracked in each user's `rewardBalance` and updated during balance-changing operations (transfers, mints, burns) or when changing the reward recipient. Users claim their accumulated rewards via `claimRewards()`.

The design uses a scalable “reward-per-token” accumulator. The reward rate is tracked via a global `totalRewardPerSecond` and applied over time.

## Motivation

Many applications (such as incentive programs, reward distribution, deterministic inflation, and staking) often require pro-rata distribution of some tokens to existing holders of that token. Building this into the TIP-20 contract allows Tempo to support this behavior efficiently,  without forcing users to stake their tokens on another contract or requiring distributors to loop over all holders.

## Roles and Policy

- Any address may start a reward stream via `startReward(amount, seconds)`.
- Any token holder may opt in and select a `rewardRecipient` for their rewards.
- Accrued rewards are tracked in the user's `rewardBalance` and updated during balance-changing operations (transfers, mints, burns) or when changing the reward recipient.
- Users must call `claimRewards()` to transfer their accumulated rewards to their balance.
- A stream's funder may cancel that stream via `cancelReward(id)`.

## Interfaces

### TIP20 Contract Interface

- `startReward(uint256 amount, uint32 seconds) returns (uint64 id)`
  - Transfers `amount` of the TIP20 token from `msg.sender` into the token's reward pool (TIP-403 applies).
  - If `seconds == 0`, immediately distributes `amount` to current opted-in holders by increasing `globalRewardPerToken`.
  - If `seconds > 0`, starts a linear stream that emits evenly from `block.timestamp` to `block.timestamp + seconds`.
  - Returns a unique `id` for later cancellation (always 0 for immediate payouts).
  - Reverts if `amount == 0`.
  - Reverts with `NoOptedInSupply()` if `seconds == 0` and `optedInSupply == 0`.

- `cancelReward(uint64 id) returns (uint256 refund)`
  - Callable only by the stream’s `funder`.
  - Stops future emission for that stream at `block.timestamp`.
  - Computes `refund = amountTotal - distributedSoFar` and attempts to transfer `refund` from the pool back to the funder (TIP-403 applies).
  - If the refund transfer is forbidden by TIP-403, the stream is still canceled and `refund == 0` is returned.

- `setRewardRecipient(address recipient)`
  - If `recipient` is `address(0)`, opts out `msg.sender` from rewards distribution.
  - Otherwise, opts in `msg.sender` for rewards and sets `recipient` as the reward recipient for `msg.sender`.
  - May be called with `recipient == msg.sender`.
  - Reverts if `recipient` is not `address(0)` and either `msg.sender` or `recipient` is not authorized to receive tokens under TIP-403.
  - **Updates `rewardBalance` for `msg.sender`** to reflect any accrued rewards before changing the recipient setting.

- `claimRewards() returns (uint256 maxAmount)`
  - Transfers accumulated rewards from `msg.sender`'s `rewardBalance` to their token balance.
  - Updates rewards before claiming.
  - Returns the amount transferred (may be less than `rewardBalance` if contract balance is insufficient).
  - Reverts if `msg.sender` is not authorized under TIP-403.
  - If `msg.sender` has a `rewardRecipient` set, the claimed amount is added to `optedInSupply`.

- `finalizeStreams(uint64 timestamp)`
  - Callable only by the TIP20RewardsRegistry.
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
error NoOptedInSupply();   // No immediate payout when optedInSupply == 0
```

## State and Accounting

Use a magnified accumulator to avoid per-holder iteration and to maintain O(1) updates and claims.

- **Constants**
  - `ACC_PRECISION = 1e18` — fixed-point scale for both the accumulator and per-second rate.

- **Global**
  - `uint256 globalRewardPerToken` — cumulative rewards per whole token, scaled by `ACC_PRECISION`.
  - `uint64  lastUpdateTime` — last timestamp the accumulator was updated.
  - `uint256 totalRewardPerSecond` — aggregate per-second emission, scaled by `ACC_PRECISION`.
  - `uint128 optedInSupply` — aggregate supply counted for rewards at moments of distribution updates.
  - `uint64  nextStreamId` — starts at 1.
  - `mapping(uint64 => uint256) scheduledRateDecrease` — mapping from block timestamp to total rate decrease scheduled for that time.

- **Per user**
  - `mapping(address => UserRewardInfo) userRewardInfo` — reward information for each user:
    ```solidity
    struct UserRewardInfo {
        address rewardRecipient;  // current reward recipient (zero means opted-out)
        uint256 rewardPerToken;   // snapshot of globalRewardPerToken last time updated
        uint256 rewardBalance;    // accumulated unclaimed rewards for this user
    }
    ```

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

## TIP20RewardsRegistry

The TIP20RewardsRegistry is a precompile at address `0x3000000000000000000000000000000000000000` that coordinates stream finalization across all TIP20 tokens in the system.

### Purpose

The registry maintains a global index of all pending stream end times across all TIP20 tokens. During block production, the first transaction of every block will be a call to finalizeStreams on the registry. This design ensures that streams will be finalized at their scheduled `endTime` by calling `finalizeStreams(timestamp)` on each token with streams ending at the current block timestamp.

### Interface

```solidity
interface TIP20RewardsRegistry {
    /// @notice Register a timestamp for stream finalization
    /// @dev Called by TIP20 tokens when the first stream ending at `timestamp` is created
    function addStream(uint128 timestamp) external;

    /// @notice Unregister a timestamp for stream finalization
    /// @dev Called by TIP20 tokens when the last stream ending at `timestamp` is canceled
    function removeStream(uint128 timestamp) external;

    /// @notice Finalize streams for all tokens ending from `lastUpdatedTimestamp` to current timestamp
    function finalizeStreams() external;
}
```

### Behavior

- **Registration**: When a TIP20 token creates the first stream ending at a particular timestamp, it calls `addStream(endTime)` to register that timestamp with the registry.
- **Unregistration**: When a TIP20 token cancels the last stream ending at a particular timestamp, it calls `removeStream(endTime)` to unregister that timestamp.
- **Finalization**: At the top of each block, a system transaction calls finalizeStreams() on the TIP20RewardsRegistry. The registry calls finalizeStreams(timestamp) on each registered TIP20 that had a reward stream expire since the timestamp of the previous block.

This design allows the system to efficiently track and finalize streams without requiring each token to maintain its own timer or iteration logic.

## Accrual

Accrual is piecewise-linear based on block time and current opted-in supply. Immediate payouts (when `seconds = 0`) directly increase `globalRewardPerToken` without affecting `totalRewardPerSecond`.

### `_accrue(timestampToAccrueTo)`

```
elapsed = timestampToAccrueTo - lastUpdateTime

if (elapsed == 0) return;

lastUpdateTime = uint64(timestampToAccrueTo);

// Clock keeps running even if optedInSupply == 0 (no backfill)
if (optedInSupply == 0) return;

if (totalRewardPerSecond > 0) {
    // deltaRPT = totalRewardPerSecond * elapsed / optedInSupply
    deltaRPT = (totalRewardPerSecond * elapsed) / uint256(optedInSupply);
    globalRewardPerToken += deltaRPT;
}
```

Use 256-bit math. Assume `totalSupply < 2^128`.

## Algorithms

### Starting a Stream — `startReward(amount, seconds)`

1. `if (amount == 0) revert InvalidAmount();`
2. Check TIP-403 authorization for `msg.sender`; revert `PolicyForbids()` if not authorized.
3. Transfer `amount` from `msg.sender` to the token contract's reward pool via `_transfer()`.
4. If `seconds == 0` (immediate payout):
   - If `optedInSupply == 0`, revert `NoOptedInSupply()`.
   - `deltaRPT = (amount * ACC_PRECISION) / optedInSupply`
   - `globalRewardPerToken += deltaRPT`
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
   - **Scheduling:**
     - Add `rate` to `scheduledRateDecrease[endTime]` to schedule a rate reduction when the stream ends.
     - If this is the first rate ending at that timetstamp, call `TIP20_REWARDS_REGISTRY.addStream(endTime)` to register this timestamp.
   - Emit `RewardScheduled(msg.sender, id, amount, seconds)`.
   - Return `id`.

### Scheduled End (System Transaction)

System transactions are used to ensure streams end at their respective `endTime`.

1. A system transaction calls `finalizeStreams(uint64 timestamp)` on the TIP20RewardRegistry.
2. The function performs:
   - `_accrue()` before changing rates.
   - `totalRewardPerSecond -= scheduledRateDecrease[timestamp]`.
   - `delete scheduledRateDecrease[timestamp]`.

No transfers occur here; any rounding dust remains in the pool. This system transaction is triggered automatically when `scheduledRateDecrease[block.timestamp] > 0`.


### Canceling a Stream — `cancelReward(id)`

1. Load `s = streams[id]`; if `s.funder == address(0)`, revert `StreamInactive()`.
2. If `msg.sender != s.funder`, revert `NotStreamFunder()`.
3. If `block.timestamp >= s.endTime`, revert `StreamInactive()`.
4. `_accrue(block.timestamp)` before changing rates.
5. Compute elapsed within the stream's window:
   ```
   t = block.timestamp <= s.startTime ? 0 : (block.timestamp - s.startTime);
   distributed = (s.ratePerSecondScaled * t) / ACC_PRECISION;
   if (distributed > s.amountTotal) distributed = s.amountTotal; // safety clamp
   refund = s.amountTotal - distributed;
   ```
6. Decrease `totalRewardPerSecond` by `s.ratePerSecondScaled`.
7. Decrease `scheduledRateDecrease[s.endTime]` by `s.ratePerSecondScaled`:
   - `newRate = scheduledRateDecrease[s.endTime] - s.ratePerSecondScaled`
   - `scheduledRateDecrease[s.endTime] = newRate`
   - If `newRate == 0`, call `TIP20_REWARDS_REGISTRY.removeStream(s.endTime)` to unregister this timestamp.
8. Delete `streams[id]`.
9. Attempt to transfer `refund` from pool to `s.funder` (TIP-403 check):
   - If both `address(this)` and `s.funder` are authorized by TIP-403:
     - `funderRewardRecipient = _updateRewardsAndGetRecipient(s.funder)`
     - If `funderRewardRecipient != address(0)`, `optedInSupply += uint128(refund)`
     - `balanceOf[address(this)] -= refund`
     - `balanceOf[s.funder] += refund`
     - Emit `Transfer(address(this), s.funder, refund)`
   - If forbidden, set `refund = 0`. The undistributed remainder stays in the pool.
10. Emit `RewardCanceled(s.funder, id, refund)`.
11. Return `refund`.

### Balance Changes and Reward Accounting

On any change to a holder's balance (mint, burn, transfer in/out), first call `_accrue(block.timestamp)` and then update accrued rewards via `_updateRewardsAndGetRecipient(holder)`:

```
function _updateRewardsAndGetRecipient(user) returns (address rewardRecipient) {
    rewardRecipient = userRewardInfo[user].rewardRecipient;
    cachedGlobalRewardPerToken = globalRewardPerToken;
    rewardPerTokenDelta = cachedGlobalRewardPerToken - userRewardInfo[user].rewardPerToken;

    if (rewardPerTokenDelta != 0) {
        // Only update rewards if opted-in
        if (rewardRecipient != address(0)) {
            reward = balanceOf[user] * rewardPerTokenDelta / ACC_PRECISION;
            userRewardInfo[rewardRecipient].rewardBalance += reward;
        }
        userRewardInfo[user].rewardPerToken = cachedGlobalRewardPerToken;
    }
}
```

Then adjust `balanceOf[holder]` and `optedInSupply` based on the balance delta and whether the sender/receiver are opted in.

### Set Reward Recipient — `setRewardRecipient(newRewardRecipient)`

1. If `newRewardRecipient != address(0)`, enforce TIP-403 authorization for both `msg.sender` and `newRewardRecipient`; if failing, revert `PolicyForbids()`.
2. `_accrue(block.timestamp)`.
3. `oldRewardRecipient = _updateRewardsAndGetRecipient(msg.sender)` to settle any accrued rewards.
4. Update `optedInSupply`:
   - If `oldRewardRecipient != address(0)` and `newRewardRecipient == address(0)`:
     - `optedInSupply -= uint128(balanceOf[msg.sender])` (opting out)
   - If `oldRewardRecipient == address(0)` and `newRewardRecipient != address(0)`:
     - `optedInSupply += uint128(balanceOf[msg.sender])` (opting in)
5. Set `userRewardInfo[msg.sender].rewardRecipient = newRewardRecipient`.
6. Emit `RewardRecipientSet(msg.sender, newRewardRecipient)`.

### Claiming Rewards — `claimRewards()`

Users must explicitly claim their accumulated rewards to transfer them from `rewardBalance` to their token balance:

1. Check TIP-403 authorization for `msg.sender`; if failing, revert `PolicyForbids()`.
2. `_accrue(block.timestamp)`.
3. `_updateRewardsAndGetRecipient(msg.sender)` to update rewards.
4. `amount = userRewardInfo[msg.sender].rewardBalance`.
5. `selfBalance = balanceOf[address(this)]`.
6. `maxAmount = min(selfBalance, amount)` (can't claim more than contract holds).
7. `userRewardInfo[msg.sender].rewardBalance -= maxAmount`.
8. Transfer from contract to `msg.sender`:
   - `balanceOf[address(this)] -= maxAmount`
   - If `userRewardInfo[msg.sender].rewardRecipient != address(0)`:
     - `optedInSupply += uint128(maxAmount)` (claimed tokens join opted-in supply)
   - `balanceOf[msg.sender] += maxAmount`
9. Emit `Transfer(address(this), msg.sender, maxAmount)`.
10. Return `maxAmount`.

## TIP-403 Policy Integration

All movements of tokens precipitated by this mechanism must pass TIP-403 checks using the token's `transferPolicyId`:

- `startReward` validates funder authorization before transferring tokens to the pool.
- `setRewardRecipient` validates both holder and recipient authorization.
- `claimRewards` validates that `msg.sender` is authorized before claiming rewards.
- `cancelReward` attempts pool → funder; if forbidden by TIP-403, the stream is canceled but no refund is transferred (refund returns 0).

If any check fails, revert `PolicyForbids()`.

## Gas Considerations

- `_accrue()` is O(1) and triggered on existing touchpoints (transfers, mints, burns, setting reward recipient, claiming rewards).
- Starting/ending/canceling a stream is O(1).
- No per-second or per-stream iteration is required; the scheduled end is a constant-time rate subtraction.
- Per-holder costs arise on setting a reward recipient and on subsequent balance changes for opted-in holders.

## System Transactions

This specification uses the **TIP20RewardsRegistry** precompile to track and finalize streams when they reach their scheduled end time. The registry is called during block production to finalize streams across all TIP20 tokens.

### TIP20RewardsRegistry

The TIP20RewardsRegistry is a precompile at address `0x3000000000000000000000000000000000000000` that maintains a registry of all pending stream end times across all TIP20 tokens.

When a TIP20 token starts a new stream:
- If this is the first stream ending at that timestamp, the token calls `TIP20_REWARDS_REGISTRY.addStream(endTime)` to register the timestamp.

When a TIP20 token cancels a stream:
- If the canceled stream was the last one ending at that timestamp, the token calls `TIP20_REWARDS_REGISTRY.removeStream(endTime)` to unregister the timestamp.

### Stream Finalization

A system transaction is inserted at the top of each block calling `finalizeStreams()` on the TIP20RewardsRegistry which subsequently calls each TIP20 token that has streams ending at the current block timestamp. This happens via an internal mechanism in the block production process.

### TIP20: `finalizeStreams(uint64 timestamp)` Function

This function on each TIP20 token is callable only by the TIP20RewardsRegistry:

```solidity
function finalizeStreams(uint64 timestamp) external {
    require(msg.sender == address(TIP20_REWARDS_REGISTRY), "Only system");

    uint256 rateDecrease = scheduledRateDecrease[timestamp];
    require(rateDecrease > 0, "No streams to finalize");

    _accrue(timestamp);
    totalRewardPerSecond -= rateDecrease;
    delete scheduledRateDecrease[timestamp];
}
```

The function:
1. Verifies the caller is the TIP20RewardsRegistry.
2. Loads the scheduled rate decrease for the given timestamp.
3. Accrues rewards up to the finalization timestamp.
4. Decreases `totalRewardPerSecond` by the scheduled amount.
5. Deletes the scheduled rate decrease entry.