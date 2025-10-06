# Stablecoin Exchange Specification

This document describes the design for an enshrined stablecoin DEX built into Tempo.

## Goals and Tradeoffs

The primary goal is to provide optimal pricing for users who are doing cross-stablecoin payments (converting one stablecoin to another), while minimizing chain load from excessive market maker places/cancels or probabilistic MEV.

**Key Design Decisions:**
- Only designed for trading between two same-asset stablecoins
- Onchain queue of passive orders that use price-time priority, to encourage makers to leave liquidity onchain
- "Flip orders" to make passive liquidity easy, and reduce message volume
- Flips/places delayed until end of block, to prevent backrunning/MEV/JIT strategies
- Passive orders allowed to "cross" (bids can be higher than asks), to minimize complexity and failure cases
- System optimized for normal trading conditions between stable pairs, not for volatile market conditions
- High dust limit (perhaps $100) to prevent orders from making swaps too expensive
- No built-in fees for now (will likely handle fees through gas)

## Future Features

- Multi-hop trades and routing
- Expiring orders (cheaper)
- User-specified cloid
- Marginal price limits
- Incentivization
- Range orders?
- Multi-asset flip orders?

## Core Exchange Structure

- **Singleton precompiled contract**
  - Address: `0xdec0000000000000000000000000000000000000`

- **Order book with flip orders**
  - Price-time priority (one FIFO queue per price tick)
  - Places delayed until end of block
  - Takes and cancels happen immediately

- **Tick Structure**
    - No ticks allowed past certain price limits (e.g., ±2% from $1.00)
    - **Quote currency:** As discussed in a separate spec, each token specifies one "linking token." DEX pairs are only allowed between a token and its linking token. In the pair between that token and its linking token, the linking token is the quote currency that tick prices are denominated in.
    - Tick size: 0.1 bps

- **Fees & Limits**
  - Dust limit: $100 minimum order size

## Functions

- `balanceOf(address user, address token) returns (uint128)`
  - View function to check a user's balance of a token on the DEX

- `sell(address tokenIn, address tokenOut, uint128 amountIn, uint128 minAmountOut) returns (uint128 amountOut)`
- `buy(address tokenIn, address tokenOut, uint128 amountOut, uint128 maxAmountIn) returns (uint128 amountIn)`
  - Execute immediately against onchain orders
  - Pay gas proportional to orders it crosses
  - First checks user's balance on the DEX, then transfers from user if insufficient balance
  - When complete, transfers funds to user
  - Credits maker's balance on the DEX when their order is filled
  - Sell means specify the amount of token that goes in; buy means specify the amount of token that comes out. This is totally independent of which token is the linking token on their pair and the corresponding "bid/ask" terminology.
  - Will fail with an InsufficientLiquidity error if there is not enough liquidity to satisfy minAmountOut or maxAmountIn.
  - For now, will fail if tokens are not paired directly against each other; later will support multi-hop trades

- `quoteBuy(address tokenIn, address tokenOut, uint128 amountOut) returns (uint128 amountIn)`
- `quoteSell(address tokenIn, address tokenOut, uint128 amountIn) returns (uint128 amountOut)`
  - View functions to give the price for trading from one token to another at a given size
  - Should be able to calculate this without iterating over all orders in the tick (by tracking the size at each tick)

- `place(address token, uint128 amount, bool isBid, int16 tick) returns (uint128 orderId)`
  - Only supports placing an order on a pair between a token and its linking token
  - Amount is denominated in the token
  - Tick is the price of the token denominated in the linking token, minus 1, times 1000
  - A bid is an order to buy the token using its linking token; ask is an order to sell the token using its linking token
  - First checks user's balance on the DEX, then transfers from user if insufficient balance
  - Queued for adding to DEX at end of block
  - Allowed to cross placed orders on the other side
  - Not visible to smart contracts until processed at end of block
  - Fires event
  - Returns order ID

- `placeFlip(address token, uint128 amount, bool isBid, int16 tick, int16 flipTick) returns (uint128 orderId)`
  - Specify same parameters as place(), plus flipTick
  - flipTick must be greater than tick if the order is a bid, less if the order is an ask
  - First checks user's balance on the DEX, then transfers from user if insufficient balance
  - Queued for adding to DEX at end of block
  - Flip orders automatically flip sides (into a new flip order, with the old tick as its new flipTick, and so on forever) when completely filled
  - Fires event
  - Returns order ID

- `cancel(uint128 orderId)`
    - Pass in order ID
    - Removes order from book

- `withdraw(address token, uint128 amount)`
  - Debits user's balance and transfers tokens to them
  - Reverts if user has insufficient balance


## Order Execution Algorithm & Data Structures

- **Ordering of queue**
  - Price → Block time inserted → Order inserted (within block)
  - **Special case:** Orders that flipped within a block are added to the book before other orders that were placed within the block, in the order in which they flipped.

- **Take Processing (Immediate)**
  - Input: Asset to sell, asset to buy, limit price, amount
  - Walk through price ticks from best to worst
  - For each tick, consume orders in order, until
    - Amount filled, or
    - Next order exceeds limit price
  - For each order interacted with:
      - Fill (or partially fill) the order
      - Credit the amount filled to the maker's balance on the DEX
  - After full order is filled, debit from taker's balance (or transfer from taker if insufficient balance)
  - Gas charges: Per-order-touched cost + per-order-flipped cost

- **Queued Operations Handling**
  - When order is placed:
      - Offered amount is debited from user's balance (or transferred from user if insufficient balance)
  - Places go into pending queue (separate from active book)
  - Queue contents are **blinded** - not visible to smart contracts until processed

- **End of Block Processing Sequence**
  1. **Flip orders flip**
     - For each fully filled flip order: create new order on opposite side
     - New price = original order's flip price
     - Flip price = original order's price

  2. **Process queued places**
     - Process places in order they were added within block
     - For each place:
       - Insert into appropriate price level, after all existing orders

## Gas Costs

- `sell()` / `buy()`
    - Cost of transfer call(s)
    - BASE_TAKE_COST
        - Should be low
    - ORDER_TAKE_COST * number of orders interacted with
        - Should be low—most of the cost is the transfers
    - TICK_TAKE_COST * number of ticks interacted with

- `place()`
    - Cost of transfer call (if needed)
    - PLACE_COST
        - For now, this should be relatively high—similar to the cost of a fresh storage slot.
        - Later, we will likely support expiring orders that are much cheaper.

- `placeFlip()`
    - Cost of transfer call (if needed)
    - PLACE_FLIP_COST
        - This should be relatively high—similar to the cost of a fresh storage slot.

- `cancel()`
    - CANCEL_COST
        - This should be very low.

- `withdraw()`
    - Decrements caller's balance on DEX and transfers the specified amount to the caller.
    - Cost of transfer call
    - WITHDRAW_COST
        - This should be about the cost of a warm storage write.

## Questions and Future Features

* Routing
* Add support for user-specified cloid
* Should we support expiring orders (and garbage collect them), so we can avoid unbounded state growth while allowing orders to be very cheap?
    * With flip orders, maybe they get a reprieve from expiry when they are touched?
* Do we check the blacklist on the maker for a flip order?
* What exactly happens if a maker address is blacklisted by the token they would be receiving?
