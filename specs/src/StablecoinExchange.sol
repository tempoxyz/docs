// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { LinkingUSD } from "./LinkingUSD.sol";
import { IStablecoinExchange } from "./interfaces/IStablecoinExchange.sol";
import { ITIP20 } from "./interfaces/ITIP20.sol";

contract StablecoinExchange is IStablecoinExchange {

    /// @notice Minimum allowed tick
    int16 public constant MIN_TICK = -2000;

    /// @notice Maximum allowed tick
    int16 public constant MAX_TICK = 2000;

    /// @notice Price scaling factor (5 decimal places for 0.1 bps precision)
    uint32 public constant PRICE_SCALE = 100_000;

    enum Side {
        Bid,
        Ask
    }

    /// @notice Represents a price level in the orderbook with a doubly-linked list of orders
    /// @dev Orders are maintained in FIFO order at each tick level
    struct TickLevel {
        /// Order ID of the first order at this tick (0 if empty)
        uint128 head;
        /// Order ID of the last order at this tick (0 if empty)
        uint128 tail;
        /// Total liquidity available at this tick level
        uint128 totalLiquidity;
    }

    /// @notice Order data structure for tracking limit orders
    struct Order {
        /// Address of order maker
        address maker;
        /// Orderbook key
        bytes32 bookKey;
        /// Bid or ask indicator
        Side side;
        /// Price tick
        int16 tick;
        /// Original order amount
        uint128 amount;
        /// Remaining amount to fill
        uint128 remaining;
        /// Previous order ID in FIFO queue
        uint128 prev;
        /// Next order ID in FIFO queue
        uint128 next;
        /// Boolean indicating if order is flipOrder
        bool isFlip;
        /// Flip order tick to place new order at once current order fills
        int16 flipTick;
    }

    /// @notice Orderbook for token pair with price-time priority
    /// @dev Uses tick-based pricing with bitmaps for price discovery
    struct Orderbook {
        /// Base token address
        address base;
        /// Quote token address
        address quote;
        /// Bid orders by tick
        mapping(int16 => TickLevel) bids;
        /// Ask orders by tick
        mapping(int16 => TickLevel) asks;
        /// Best bid tick for highest bid price
        int16 bestBidTick;
        /// Best ask tick for lowest ask price
        int16 bestAskTick;
        /// Bid tick bitmaps for efficient price discovery
        mapping(int16 => uint256) bidBitmap;
        /// Ask tick bitmaps for efficient price discovery
        mapping(int16 => uint256) askBitmap;
    }

    /*//////////////////////////////////////////////////////////////
                              STORAGE
    //////////////////////////////////////////////////////////////*/
    LinkingUSD public immutable linkingToken;

    /// Mapping of pair key to orderbook
    mapping(bytes32 pairKey => Orderbook orderbook) internal books;

    /// Mapping of order ID to order data
    mapping(uint128 orderId => Order order) internal orders;

    /// User balances
    mapping(address user => mapping(address token => uint128 balance)) internal balances;

    /// Last processed order ID
    uint128 nextOrderId;
    /// Latest pending order ID
    uint128 pendingOrderId;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address admin) {
        linkingToken = new LinkingUSD(admin);
    }

    /*//////////////////////////////////////////////////////////////
                              Functions
    //////////////////////////////////////////////////////////////*/

    /// @notice Convert relative tick to scaled price
    function tickToPrice(int16 tick) public pure returns (uint32 price) {
        return uint32(int32(PRICE_SCALE) + int32(tick));
    }

    /// @notice Convert scaled price to relative tick
    function priceToTick(uint32 price) public pure returns (int16 tick) {
        return int16(int32(price) - int32(PRICE_SCALE));
    }

    /// @notice Set bit in bitmap to mark tick as active
    function _setTickBit(bytes32 bookKey, int16 tick, bool isBid) internal {
        Orderbook storage book = books[bookKey];
        int16 wordIndex = tick >> 8;
        uint8 bitIndex = uint8(int8(tick));
        uint256 mask = (uint256(1) << bitIndex);
        if (isBid) {
            book.bidBitmap[wordIndex] |= mask;
        } else {
            book.askBitmap[wordIndex] |= mask;
        }
    }

    /// @notice Clear bit in bitmap to mark tick as inactive
    function _clearTickBit(bytes32 bookKey, int16 tick, bool isBid) internal {
        Orderbook storage book = books[bookKey];
        int16 wordIndex = tick >> 8;
        uint8 bitIndex = uint8(int8(tick));
        uint256 mask = ~(uint256(1) << bitIndex);
        if (isBid) {
            book.bidBitmap[wordIndex] &= mask;
        } else {
            book.askBitmap[wordIndex] &= mask;
        }
    }

    /// @notice Generate deterministic key for token pair
    /// @param tokenA First token address
    /// @param tokenB Second token address
    /// @return key Deterministic pair key
    function pairKey(address tokenA, address tokenB) public pure returns (bytes32 key) {
        (tokenA, tokenB) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        key = keccak256(abi.encodePacked(tokenA, tokenB));
    }

    /// @notice Creates a new trading pair between base and quote tokens
    /// @param base Base token address
    /// @return key The orderbook key for the created pair
    /// @dev Automatically sets tick bounds to ±2% from the peg price of 1.0
    function createPair(address base) external returns (bytes32 key) {
        address quote = ITIP20(base).quoteToken();
        key = pairKey(base, quote);

        // Create new orderbook for pair
        Orderbook storage book = books[key];
        require(book.base == address(0), "PAIR_EXISTS");
        book.base = base;
        book.quote = quote;

        book.bestBidTick = type(int16).min;
        book.bestAskTick = type(int16).max;
    }

    /// @notice Internal function to place order in pending queue
    /// @param base Base token address
    /// @param quote Quote token address
    /// @param amount Order amount in base token
    /// @param isBid True for buy orders, false for sell orders
    /// @param tick Price tick for the order
    /// @param isFlip Whether this is a flip order
    /// @param flipTick Target tick for flip (ignored if not flip order)
    /// @return orderId The assigned order ID
    /// @dev Orders are queued and processed at end of block
    function _placeOrder(
        address base,
        address quote,
        uint128 amount,
        bool isBid,
        int16 tick,
        bool isFlip,
        int16 flipTick
    ) internal returns (uint128 orderId) {
        bytes32 key = pairKey(base, quote);
        Orderbook storage book = books[key];

        require(book.base != address(0), "PAIR_NOT_EXISTS");

        require(tick >= MIN_TICK && tick <= MAX_TICK, "TICK_OUT_OF_BOUNDS");

        if (isFlip) {
            require(flipTick >= MIN_TICK && flipTick <= MAX_TICK, "FLIP_TICK_OUT_OF_BOUNDS");

            if (isBid) {
                require(flipTick > tick, "FLIP_TICK_MUST_BE_GREATER_FOR_BID");
            } else {
                require(flipTick < tick, "FLIP_TICK_MUST_BE_LESS_FOR_ASK");
            }
        }

        // Calculate escrow amount and token
        uint128 escrowAmount;
        address escrowToken;
        if (isBid) {
            // For bids, escrow quote tokens based on price
            escrowToken = quote;
            uint32 price = tickToPrice(tick);
            escrowAmount = (amount * price) / PRICE_SCALE;
        } else {
            // For asks, escrow base tokens
            escrowToken = base;
            escrowAmount = amount;
        }

        // Check if the user has a balance, transfer the rest
        uint128 userBalance = balances[msg.sender][escrowToken];
        if (userBalance >= escrowAmount) {
            balances[msg.sender][escrowToken] -= escrowAmount;
        } else {
            balances[msg.sender][escrowToken] = 0;
            ITIP20(escrowToken).transferFrom(msg.sender, address(this), escrowAmount - userBalance);
        }

        orderId = ++pendingOrderId;

        orders[orderId] = Order({
            maker: msg.sender,
            bookKey: key,
            side: isBid ? Side.Bid : Side.Ask,
            tick: tick,
            amount: amount,
            remaining: amount,
            prev: 0,
            next: 0,
            isFlip: isFlip,
            flipTick: flipTick
        });

        return orderId;
    }

    /// @notice Place a limit order on the orderbook
    /// @param base Base token address
    /// @param amount Order amount in base token
    /// @param isBid True for buy orders, false for sell orders
    /// @param tick Price tick for the order
    /// @return orderId The assigned order ID
    function place(address base, uint128 amount, bool isBid, int16 tick)
        external
        returns (uint128 orderId)
    {
        address quote = ITIP20(base).quoteToken();
        orderId = _placeOrder(base, quote, amount, isBid, tick, false, 0);
        emit OrderPlaced(orderId, msg.sender, base, amount, isBid, tick);
    }

    /// @notice Place a flip order that auto-flips when filled
    /// @param token Token address (base token)
    /// @param amount Order amount in base token
    /// @param isBid True for bid (buy), false for ask (sell)
    /// @param tick Price tick for the order
    /// @param flipTick Target tick to flip to when order is filled
    /// @return orderId The assigned order ID
    function placeFlip(address token, uint128 amount, bool isBid, int16 tick, int16 flipTick)
        external
        returns (uint128 orderId)
    {
        address quote = ITIP20(token).quoteToken();
        orderId = _placeOrder(token, quote, amount, isBid, tick, true, flipTick);
        emit FlipOrderPlaced(orderId, msg.sender, token, amount, isBid, tick, flipTick);
    }

    function cancel(uint128 orderId) external {
        Order storage order = orders[orderId];
        require(order.maker != address(0), "ORDER_DOES_NOT_EXIST");
        require(order.maker == msg.sender, "UNAUTHORIZED");

        Orderbook storage book = books[order.bookKey];
        address token = order.side == Side.Bid ? book.quote : book.base;

        // If the order is pending, delete it from storage without adjusting the orderbook
        if (orderId > nextOrderId) {
            // Credit remaining tokens to user's withdrawable balance
            balances[order.maker][token] += order.remaining;

            delete orders[orderId];
            emit OrderCancelled(orderId);
            return;
        }

        bool isBid = order.side == Side.Bid;
        TickLevel storage level = isBid ? book.bids[order.tick] : book.asks[order.tick];

        if (order.prev != 0) {
            orders[order.prev].next = order.next;
        } else {
            level.head = order.next;
        }

        if (order.next != 0) {
            orders[order.next].prev = order.prev;
        } else {
            level.tail = order.prev;
        }

        // Decrement total liquidity
        level.totalLiquidity -= order.remaining;

        if (level.head == 0) {
            _clearTickBit(order.bookKey, order.tick, isBid);
        }

        // Credit remaining tokens to user's withdrawable balance
        balances[order.maker][token] += order.remaining;

        delete orders[orderId];

        emit OrderCancelled(orderId);
    }

    // TODO: it might be nice to create some ISystem Tx interface that is used
    // for contracts that are executed by the protocol at the end of the block.
    // This makes it easy to distinguish when the protocol is responsible for calling a function
    // TODO: natspec
    function executeBlock() external {
        while (nextOrderId < pendingOrderId) {
            uint128 orderId = ++nextOrderId;
            Order storage order = orders[orderId];

            // If the order is already canceled, skip
            if (order.maker == address(0)) continue;

            Orderbook storage book = books[order.bookKey];
            bool isBid = order.side == Side.Bid;
            TickLevel storage level = isBid ? book.bids[order.tick] : book.asks[order.tick];

            uint128 prevTail = level.tail;
            if (prevTail == 0) {
                level.head = orderId;
                level.tail = orderId;
                _setTickBit(order.bookKey, order.tick, isBid);

                // Update best bid/ask when new tick becomes active
                if (isBid) {
                    if (order.tick > book.bestBidTick) {
                        book.bestBidTick = order.tick;
                    }
                } else {
                    if (order.tick < book.bestAskTick) {
                        book.bestAskTick = order.tick;
                    }
                }
            } else {
                orders[prevTail].next = orderId;
                order.prev = prevTail;
                level.tail = orderId;
            }

            // Increment total liquidity for this tick level
            level.totalLiquidity += order.remaining;
        }
    }

    /// @notice Withdraw tokens from exchange balance
    /// @param token Token address to withdraw
    /// @param amount Amount to withdraw
    function withdraw(address token, uint128 amount) external {
        require(balances[msg.sender][token] >= amount, "INSUFFICIENT_BALANCE");
        balances[msg.sender][token] -= amount;

        ITIP20(token).transfer(msg.sender, amount);
    }

    /// @notice Get user's token balance on the exchange
    /// @param user User address
    /// @param token Token address
    /// @return User's balance for the token
    function balanceOf(address user, address token) external view returns (uint128) {
        return balances[user][token];
    }

    /// @notice Quote the cost to buy a specific amount of tokens
    /// @param tokenIn Token to spend
    /// @param tokenOut Token to buy
    /// @param amountOut Amount of tokenOut to buy
    /// @return amountIn Amount of tokenIn needed
    function quoteBuy(address tokenIn, address tokenOut, uint128 amountOut)
        external
        view
        returns (uint128 amountIn)
    {
        bytes32 key = pairKey(tokenIn, tokenOut);
        Orderbook storage book = books[key];
        require(book.base != address(0), "PAIR_NOT_EXISTS");

        bool baseForQuote = tokenIn == book.base;
        amountIn = _quoteExactOut(key, book, baseForQuote, amountOut);
    }

    /// @notice Fill an order and handle cleanup when fully filled
    /// @param orderId The order ID to fill
    /// @param fillAmount The amount to fill
    /// @return nextOrderAtTick The next order ID to process (0 if no more liquidity at this tick)
    function _fillOrder(uint128 orderId, uint128 fillAmount)
        internal
        returns (uint128 nextOrderAtTick)
    {
        Order storage order = orders[orderId];
        Orderbook storage book = books[order.bookKey];
        bool isBid = order.side == Side.Bid;
        TickLevel storage level = isBid ? book.bids[order.tick] : book.asks[order.tick];

        // Fill the order
        order.remaining -= fillAmount;
        level.totalLiquidity -= fillAmount;

        // Credit maker with appropriate tokens
        if (isBid) {
            // Bid order: maker gets base tokens
            balances[order.maker][book.base] += fillAmount;
        } else {
            // Ask order: maker gets quote tokens
            uint32 price = tickToPrice(order.tick);
            uint128 quoteAmount = (fillAmount * price) / PRICE_SCALE;
            balances[order.maker][book.quote] += quoteAmount;
        }

        if (order.remaining == 0) {
            // Order fully filled
            nextOrderAtTick = order.next;

            // Remove from linked list
            if (order.prev != 0) {
                orders[order.prev].next = order.next;
            } else {
                level.head = order.next;
            }

            if (order.next != 0) {
                orders[order.next].prev = order.prev;
            } else {
                level.tail = order.prev;
            }

            // TODO: if flip order, place order at flip tick
            delete orders[orderId];

            // Check if tick is exhausted and return 0 if so
            if (level.head == 0) {
                _clearTickBit(order.bookKey, order.tick, isBid);
                return 0;
            }
        } else {
            // Order partially filled, continue with same order
            nextOrderAtTick = orderId;
        }
    }

    /// @notice Decrement user's internal balance or transfer from external wallet
    /// @param user The user to transfer from
    /// @param token The token to transfer
    /// @param amount The amount to transfer
    function _decrementBalanceOrTransferFrom(address user, address token, uint128 amount)
        internal
    {
        uint128 userBalance = balances[user][token];
        if (userBalance >= amount) {
            balances[user][token] -= amount;
        } else {
            balances[user][token] = 0;
            uint128 remaining = amount - userBalance;
            ITIP20(token).transferFrom(user, address(this), remaining);
        }
    }

    /// @notice Buy tokens with another token
    /// @param tokenIn Token to spend
    /// @param tokenOut Token to buy
    /// @param amountOut Amount of tokenOut to buy
    /// @param maxAmountIn Maximum amount of tokenIn to spend
    /// @return amountIn Actual amount of tokenIn spent
    function buy(address tokenIn, address tokenOut, uint128 amountOut, uint128 maxAmountIn)
        external
        returns (uint128 amountIn)
    {
        bytes32 key = pairKey(tokenIn, tokenOut);
        Orderbook storage book = books[key];
        require(book.base != address(0), "PAIR_NOT_EXISTS");

        bool baseForQuote = tokenIn == book.base;
        amountIn = _fillOrdersExactOut(key, book, baseForQuote, amountOut, maxAmountIn);

        _decrementBalanceOrTransferFrom(msg.sender, tokenIn, amountIn);
        ITIP20(tokenOut).transfer(msg.sender, amountOut);
    }

    /// @notice Quote the proceeds from selling a specific amount of tokens
    /// @param tokenIn Token to sell
    /// @param tokenOut Token to receive
    /// @param amountIn Amount of tokenIn to sell
    /// @return amountOut Amount of tokenOut to receive
    function quoteSell(address tokenIn, address tokenOut, uint128 amountIn)
        external
        view
        returns (uint128 amountOut)
    {
        bytes32 key = pairKey(tokenIn, tokenOut);
        Orderbook storage book = books[key];
        require(book.base != address(0), "PAIR_NOT_EXISTS");

        bool baseForQuote = tokenIn == book.base;
        amountOut = _quoteExactIn(key, book, baseForQuote, amountIn);
    }

    /// @notice Sell tokens for another token
    /// @param tokenIn Token to sell
    /// @param tokenOut Token to receive
    /// @param amountIn Amount of tokenIn to sell
    /// @param minAmountOut Minimum amount of tokenOut to receive
    /// @return amountOut Actual amount of tokenOut received
    function sell(address tokenIn, address tokenOut, uint128 amountIn, uint128 minAmountOut)
        external
        returns (uint128 amountOut)
    {
        bytes32 key = pairKey(tokenIn, tokenOut);
        Orderbook storage book = books[key];
        require(book.base != address(0), "PAIR_NOT_EXISTS");

        bool baseForQuote = tokenIn == book.base;
        amountOut = _fillOrdersExactIn(key, book, baseForQuote, amountIn, minAmountOut);

        _decrementBalanceOrTransferFrom(msg.sender, tokenIn, amountIn);
        ITIP20(tokenOut).transfer(msg.sender, amountOut);
    }

    /// @notice Fill orders for exact output amount
    /// @param key Orderbook key
    /// @param book Orderbook storage reference
    /// @param baseForQuote True if spending base for quote, false if spending quote for base
    /// @param amountOut Exact amount of output tokens desired
    /// @param maxAmountIn Maximum amount of input tokens to spend
    /// @return amountIn Actual amount of input tokens spent
    function _fillOrdersExactOut(
        bytes32 key,
        Orderbook storage book,
        bool baseForQuote,
        uint128 amountOut,
        uint128 maxAmountIn
    ) internal returns (uint128 amountIn) {
        uint128 remainingOut = amountOut;

        if (baseForQuote) {
            int16 currentTick = book.bestBidTick;
            // If there is no liquidity, revert
            if (currentTick == type(int16).min) {
                revert("INSUFFICIENT_LIQUIDITY");
            }

            TickLevel storage level = book.bids[currentTick];
            uint128 orderId = level.head;

            while (remainingOut > 0) {
                // Get the price at the current tick and fetch the current order from storage
                uint32 price = tickToPrice(currentTick);
                Order memory currentOrder = orders[orderId];

                // For bids, we want remainingOut quote tokens
                uint128 baseNeeded = (remainingOut * PRICE_SCALE) / price;
                uint128 fillAmount =
                    baseNeeded > currentOrder.remaining ? currentOrder.remaining : baseNeeded;

                // Check if we exceed max input
                if (amountIn + fillAmount > maxAmountIn) {
                    revert("MAX_IN_EXCEEDED");
                }

                // Calculate how much quote to recieve for fillAmount of base
                remainingOut -= (fillAmount * price) / PRICE_SCALE;
                amountIn += fillAmount;

                // Fill the order and get next order
                orderId = _fillOrder(orderId, fillAmount);

                if (remainingOut == 0) {
                    return amountIn;
                }

                // If tick is exhausted, move to next tick
                if (orderId == 0) {
                    bool initialized;
                    (currentTick, initialized) = nextInitializedBidTick(key, currentTick);
                    if (!initialized) {
                        revert("INSUFFICIENT_LIQUIDITY");
                    }

                    level = book.bids[currentTick];
                    book.bestBidTick = currentTick;
                    orderId = level.head;
                }
            }
        } else {
            // quote for base
            int16 currentTick = book.bestAskTick;
            // If there is no liquidity, revert
            if (currentTick == type(int16).max) {
                revert("INSUFFICIENT_LIQUIDITY");
            }

            TickLevel storage level = book.asks[currentTick];
            uint128 orderId = level.head;

            while (remainingOut > 0) {
                uint32 price = tickToPrice(currentTick);
                Order memory currentOrder = orders[orderId];

                uint128 fillAmount =
                    remainingOut > currentOrder.remaining ? currentOrder.remaining : remainingOut;

                // Calculate how much quote to pay for fillAmount of base
                uint128 quoteIn = (fillAmount * price) / PRICE_SCALE;

                // Check if we exceed max input
                if (amountIn + quoteIn > maxAmountIn) {
                    revert("MAX_IN_EXCEEDED");
                }

                remainingOut -= fillAmount;
                amountIn += quoteIn;

                // Fill the order and get next order
                orderId = _fillOrder(orderId, fillAmount);

                if (remainingOut == 0) {
                    return amountIn;
                }

                // If tick is exhausted, move to next tick
                if (orderId == 0) {
                    bool initialized;
                    (currentTick, initialized) = nextInitializedAskTick(key, currentTick);
                    if (!initialized) {
                        revert("INSUFFICIENT_LIQUIDITY");
                    }

                    level = book.asks[currentTick];
                    book.bestAskTick = currentTick;
                    orderId = level.head;
                }
            }
        }
    }

    /// @notice Fill orders for exact input amount
    /// @param key Orderbook key
    /// @param book Orderbook storage reference
    /// @param baseForQuote True if spending base for quote, false if spending quote for base
    /// @param amountIn Exact amount of input tokens to spend
    /// @param minAmountOut Minimum amount of output tokens to receive
    /// @return amountOut Actual amount of output tokens received
    function _fillOrdersExactIn(
        bytes32 key,
        Orderbook storage book,
        bool baseForQuote,
        uint128 amountIn,
        uint128 minAmountOut
    ) internal returns (uint128 amountOut) {
        uint128 remainingIn = amountIn;

        if (baseForQuote) {
            int16 currentTick = book.bestBidTick;
            // If there is no liquidity, revert
            if (currentTick == type(int16).min) {
                revert("INSUFFICIENT_LIQUIDITY");
            }

            TickLevel storage level = book.bids[currentTick];
            uint128 orderId = level.head;

            while (remainingIn > 0) {
                uint32 price = tickToPrice(currentTick);
                Order memory currentOrder = orders[orderId];

                uint128 fillAmount =
                    remainingIn > currentOrder.remaining ? currentOrder.remaining : remainingIn;

                // Calculate how much quote to receive for fillAmount of base
                uint128 quoteOut = (fillAmount * price) / PRICE_SCALE;

                remainingIn -= fillAmount;
                amountOut += quoteOut;

                // Fill the order and get next order
                orderId = _fillOrder(orderId, fillAmount);

                if (remainingIn == 0) {
                    if (amountOut < minAmountOut) {
                        revert("INSUFFICIENT_OUTPUT");
                    }
                    return amountOut;
                }

                // If tick is exhausted (orderId == 0), move to next tick
                if (orderId == 0) {
                    bool initialized;
                    (currentTick, initialized) = nextInitializedBidTick(key, currentTick);
                    if (!initialized) {
                        revert("INSUFFICIENT_LIQUIDITY");
                    }

                    level = book.bids[currentTick];
                    book.bestBidTick = currentTick;
                    orderId = level.head;
                }
            }
        } else {
            // quote for base
            int16 currentTick = book.bestAskTick;
            // If there is no liquidity, revert
            if (currentTick == type(int16).max) {
                revert("INSUFFICIENT_LIQUIDITY");
            }

            TickLevel storage level = book.asks[currentTick];
            uint128 orderId = level.head;

            while (remainingIn > 0) {
                uint32 price = tickToPrice(currentTick);
                Order memory currentOrder = orders[orderId];

                // For asks, calculate how much base we can get for remainingIn quote
                uint128 baseOut = (remainingIn * PRICE_SCALE) / price;
                uint128 fillAmount =
                    baseOut > currentOrder.remaining ? currentOrder.remaining : baseOut;

                // Calculate actual quote needed for fillAmount of base
                remainingIn -= (fillAmount * price) / PRICE_SCALE;
                amountOut += fillAmount;

                // Fill the order and get next order
                orderId = _fillOrder(orderId, fillAmount);

                if (remainingIn == 0) {
                    if (amountOut < minAmountOut) {
                        revert("INSUFFICIENT_OUTPUT");
                    }
                    return amountOut;
                }

                // If tick is exhausted (orderId == 0), move to next tick
                if (orderId == 0) {
                    bool initialized;
                    (currentTick, initialized) = nextInitializedAskTick(key, currentTick);
                    if (!initialized) {
                        revert("INSUFFICIENT_LIQUIDITY");
                    }

                    level = book.asks[currentTick];
                    book.bestAskTick = currentTick;
                    orderId = level.head;
                }
            }
        }
    }

    /// @notice Quote exact output amount
    /// @param book Orderbook storage reference
    /// @param baseForQuote True if spending base for quote, false if spending quote for base
    /// @param amountOut Exact amount of output tokens desired
    /// @return amountIn Amount of input tokens needed
    function _quoteExactOut(
        bytes32 key,
        Orderbook storage book,
        bool baseForQuote,
        uint128 amountOut
    ) internal view returns (uint128 amountIn) {
        uint128 remainingOut = amountOut;

        if (baseForQuote) {
            int16 currentTick = book.bestBidTick;
            if (currentTick == type(int16).min) {
                revert("INSUFFICIENT_LIQUIDITY");
            }

            while (remainingOut > 0) {
                TickLevel storage level = book.bids[currentTick];

                uint32 price = tickToPrice(currentTick);

                // Calculate how much quote we can get from this tick's liquidity
                uint128 baseNeeded = (remainingOut * PRICE_SCALE) / price;
                uint128 fillAmount =
                    baseNeeded > level.totalLiquidity ? level.totalLiquidity : baseNeeded;
                uint128 quoteOut = (fillAmount * price) / PRICE_SCALE;

                remainingOut -= quoteOut;
                amountIn += fillAmount;

                if (fillAmount == level.totalLiquidity) {
                    // Move to next tick if we exhaust this level
                    bool initialized;
                    (currentTick, initialized) = nextInitializedBidTick(key, currentTick);
                    if (!initialized && remainingOut > 0) {
                        revert("INSUFFICIENT_LIQUIDITY");
                    }
                }
            }
        } else {
            int16 currentTick = book.bestAskTick;
            if (currentTick == type(int16).max) {
                revert("INSUFFICIENT_LIQUIDITY");
            }

            while (remainingOut > 0) {
                TickLevel storage level = book.asks[currentTick];
                uint32 price = tickToPrice(currentTick);

                uint128 fillAmount =
                    remainingOut > level.totalLiquidity ? level.totalLiquidity : remainingOut;
                uint128 quoteIn = (fillAmount * price) / PRICE_SCALE;

                remainingOut -= fillAmount;
                amountIn += quoteIn;

                if (fillAmount == level.totalLiquidity) {
                    // Move to next tick if we exhaust this level
                    bool initialized;
                    (currentTick, initialized) = nextInitializedAskTick(key, currentTick);
                    if (!initialized && remainingOut > 0) {
                        revert("INSUFFICIENT_LIQUIDITY");
                    }
                }
            }
        }
    }

    /// @notice Quote exact input amount
    /// @param book Orderbook storage reference
    /// @param baseForQuote True if spending base for quote, false if spending quote for base
    /// @param amountIn Exact amount of input tokens to spend
    /// @return amountOut Amount of output tokens received
    function _quoteExactIn(bytes32 key, Orderbook storage book, bool baseForQuote, uint128 amountIn)
        internal
        view
        returns (uint128 amountOut)
    {
        uint128 remainingIn = amountIn;

        if (baseForQuote) {
            int16 currentTick = book.bestBidTick;
            if (currentTick == type(int16).min) {
                revert("INSUFFICIENT_LIQUIDITY");
            }

            while (remainingIn > 0) {
                TickLevel storage level = book.bids[currentTick];
                uint32 price = tickToPrice(currentTick);

                uint128 fillAmount =
                    remainingIn > level.totalLiquidity ? level.totalLiquidity : remainingIn;
                uint128 quoteOut = (fillAmount * price) / PRICE_SCALE;

                remainingIn -= fillAmount;
                amountOut += quoteOut;

                if (fillAmount == level.totalLiquidity) {
                    // Move to next tick if we exhaust this level
                    bool initialized;
                    (currentTick, initialized) = nextInitializedBidTick(key, currentTick);
                    if (!initialized && remainingIn > 0) {
                        revert("INSUFFICIENT_LIQUIDITY");
                    }
                }
            }
        } else {
            int16 currentTick = book.bestAskTick;
            if (currentTick == type(int16).max) {
                revert("INSUFFICIENT_LIQUIDITY");
            }

            while (remainingIn > 0) {
                TickLevel storage level = book.asks[currentTick];
                uint32 price = tickToPrice(currentTick);

                // Calculate how much base we can get for remainingIn quote
                uint128 baseOut = (remainingIn * PRICE_SCALE) / price;
                uint128 fillAmount = baseOut > level.totalLiquidity ? level.totalLiquidity : baseOut;
                uint128 quoteNeeded = (fillAmount * price) / PRICE_SCALE;

                remainingIn -= quoteNeeded;
                amountOut += fillAmount;

                if (fillAmount == level.totalLiquidity) {
                    // Move to next tick if we exhaust this level
                    bool initialized;
                    (currentTick, initialized) = nextInitializedAskTick(key, currentTick);
                    if (!initialized && remainingIn > 0) {
                        revert("INSUFFICIENT_LIQUIDITY");
                    }
                }
            }
        }
    }

    /// @notice Find next initialized ask tick higher than current tick
    function nextInitializedAskTick(bytes32 bookKey, int16 tick)
        internal
        view
        returns (int16 nextTick, bool initialized)
    {
        Orderbook storage book = books[bookKey];
        nextTick = tick + 1;
        while (nextTick <= MAX_TICK) {
            int16 wordIndex = nextTick >> 8;
            uint8 bitIndex = uint8(int8(nextTick));
            if ((book.askBitmap[wordIndex] >> bitIndex) & 1 != 0) {
                return (nextTick, true);
            }
            ++nextTick;
        }
        return (nextTick, false);
    }

    /// @notice Find next initialized bid tick lower than current tick
    function nextInitializedBidTick(bytes32 bookKey, int16 tick)
        internal
        view
        returns (int16 nextTick, bool initialized)
    {
        Orderbook storage book = books[bookKey];
        nextTick = tick - 1;
        while (nextTick >= MIN_TICK) {
            int16 wordIndex = nextTick >> 8;
            uint8 bitIndex = uint8(int8(nextTick));
            if ((book.bidBitmap[wordIndex] >> bitIndex) & 1 != 0) {
                return (nextTick, true);
            }
            --nextTick;
        }
        return (nextTick, false);
    }

}
