// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IStablecoinExchange} from "./interfaces/IStablecoinExchange.sol";
import {ITIP20} from "./interfaces/ITIP20.sol";

contract StablecoinExchange is IStablecoinExchange {
    /// @notice Maximum allowed tick range
    uint16 public constant MAX_TICK_RANGE = 20;

    /// @notice Price scaling factor (5 decimal places for 0.1 bps precision)
    uint32 public constant PRICE_SCALE = 100000;

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
        /// Minimum allowed tick
        int16 minTick;
        /// Maximum allowed tick
        int16 maxTick;
        /// Pegged price for the pair
        uint32 pegPrice;
    }

    /*//////////////////////////////////////////////////////////////
                              STORAGE
    //////////////////////////////////////////////////////////////*/

    /// Mapping of pair key to orderbook
    mapping(bytes32 pairKey => Orderbook orderbook) internal books;

    /// Mapping of order ID to order data
    mapping(uint128 orderId => Order order) internal orders;

    /// User balances
    mapping(address user => mapping(address token => uint128 balance))
        internal balances;

    /// Last processed order ID
    uint128 nextOrderId;
    /// Latest pending order ID
    uint128 pendingOrderId;

    /*//////////////////////////////////////////////////////////////
                              Functions
    //////////////////////////////////////////////////////////////*/

    /// @notice Convert tick to price
    /// @param tick Price tick
    /// @return price Price scaled by PRICE_SCALE
    function _tickToPrice(int16 tick) internal pure returns (uint32 price) {
        return uint32(int32(tick) + int32(PRICE_SCALE));
    }

    /// @notice Convert price to tick
    /// @param price Price scaled by PRICE_SCALE
    /// @return tick Price tick
    function _priceToTick(uint32 price) internal pure returns (int16 tick) {
        return int16(int32(price) - int32(PRICE_SCALE));
    }

    /// @notice Set bit in bitmap to mark tick as active
    /// @param bookKey Orderbook key
    /// @param tick Price tick to mark as active
    /// @param isBid True for bid bitmap, false for ask bitmap
    // TODO: check this
    function _setTickBit(bytes32 bookKey, int16 tick, bool isBid) internal {
        Orderbook storage book = books[bookKey];
        int16 wordIndex = tick >> 8;
        uint8 bitIndex = uint8(int8(tick));
        if (isBid) {
            book.bidBitmap[wordIndex] |= (1 << bitIndex);
        } else {
            book.askBitmap[wordIndex] |= (1 << bitIndex);
        }
    }

    /// @notice Clear bit in bitmap to mark tick as inactive
    /// @param bookKey Orderbook key
    /// @param tick Price tick to mark as inactive
    /// @param isBid True for bid bitmap, false for ask bitmap
    // TODO: check this
    function _clearTickBit(bytes32 bookKey, int16 tick, bool isBid) internal {
        Orderbook storage book = books[bookKey];
        int16 wordIndex = tick >> 8;
        uint8 bitIndex = uint8(int8(tick));
        if (isBid) {
            book.bidBitmap[wordIndex] &= ~(1 << bitIndex);
        } else {
            book.askBitmap[wordIndex] &= ~(1 << bitIndex);
        }
    }

    /// @notice Generate deterministic key for token pair
    /// @param tokenA First token address
    /// @param tokenB Second token address
    /// @return key Deterministic pair key
    function _pairKey(
        address tokenA,
        address tokenB
    ) internal pure returns (bytes32 key) {
        (tokenA, tokenB) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        key = keccak256(abi.encodePacked(tokenA, tokenB));
    }

    /// @notice Creates a new trading pair between base and quote tokens
    /// @param base Base token address
    /// @param pegPrice Peg price scaled by PRICE_SCALE
    /// @return key The orderbook key for the created pair
    /// @dev Automatically sets tick bounds to +- 10 ticks from the peg price
    function createPair(
        address base,
        uint32 pegPrice
    ) external returns (bytes32 key) {
        address quote = ITIP20(base).quoteToken();
        key = _pairKey(base, quote);

        // Create new orderbook for pair
        Orderbook storage book = books[key];
        require(book.base == address(0), "PAIR_EXISTS");
        book.base = base;
        book.quote = quote;
        book.pegPrice = pegPrice;

        // Calculate min/max ticks from peg price using MAX_TICK_RANGE
        int16 pegTick = _priceToTick(pegPrice);
        int16 halfRange = int16(MAX_TICK_RANGE / 2);
        book.minTick = pegTick - halfRange;
        book.maxTick = pegTick + halfRange;

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
        bytes32 key = _pairKey(base, quote);
        Orderbook storage book = books[key];

        require(book.base != address(0), "PAIR_NOT_EXISTS");

        require(
            tick >= book.minTick && tick <= book.maxTick,
            "TICK_OUT_OF_BOUNDS"
        );

        if (isFlip) {
            require(
                flipTick >= book.minTick && flipTick <= book.maxTick,
                "FLIP_TICK_OUT_OF_BOUNDS"
            );

            if (isBid) {
                require(flipTick > tick, "FLIP_TICK_MUST_BE_GREATER_FOR_BID");
            } else {
                require(flipTick < tick, "FLIP_TICK_MUST_BE_LESS_FOR_ASK");
            }
        }

        // For bids, use quote token. For asks, use base token
        address token = isBid ? quote : base;

        // Check if the user has a balance, transfer the rest
        uint128 userBalance = balances[msg.sender][token];
        if (userBalance >= amount) {
            balances[msg.sender][token] -= amount;
        } else {
            balances[msg.sender][token] = 0;
            ITIP20(token).transferFrom(
                msg.sender,
                address(this),
                amount - userBalance
            );
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
    function place(
        address base,
        uint128 amount,
        bool isBid,
        int16 tick
    ) external returns (uint128 orderId) {
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
    function placeFlip(
        address token,
        uint128 amount,
        bool isBid,
        int16 tick,
        int16 flipTick
    ) external returns (uint128 orderId) {
        address quote = ITIP20(token).quoteToken();
        orderId = _placeOrder(
            token,
            quote,
            amount,
            isBid,
            tick,
            true,
            flipTick
        );
        emit FlipOrderPlaced(
            orderId,
            msg.sender,
            token,
            amount,
            isBid,
            tick,
            flipTick
        );
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
        TickLevel storage level = isBid
            ? book.bids[order.tick]
            : book.asks[order.tick];

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
            TickLevel storage level = isBid
                ? book.bids[order.tick]
                : book.asks[order.tick];

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
    function balanceOf(
        address user,
        address token
    ) external view returns (uint128) {
        return balances[user][token];
    }

    /// @notice Sell tokens for another token
    /// @param tokenIn Token to sell
    /// @param tokenOut Token to receive
    /// @param amountIn Amount of tokenIn to sell
    /// @param minAmountOut Minimum amount of tokenOut to receive
    /// @return amountOut Actual amount of tokenOut received
    function sell(
        address tokenIn,
        address tokenOut,
        uint128 amountIn,
        uint128 minAmountOut
    ) external returns (uint128 amountOut) {
        // TODO: Implement market order logic
        revert("NOT_IMPLEMENTED");
    }

    /// @notice Buy tokens with another token
    /// @param tokenIn Token to spend
    /// @param tokenOut Token to buy
    /// @param amountOut Amount of tokenOut to buy
    /// @param maxAmountIn Maximum amount of tokenIn to spend
    /// @return amountIn Actual amount of tokenIn spent
    function buy(
        address tokenIn,
        address tokenOut,
        uint128 amountOut,
        uint128 maxAmountIn
    ) external returns (uint128 amountIn) {
        // TODO: Implement market order logic
        revert("NOT_IMPLEMENTED");
    }

    /// @notice Quote the cost to buy a specific amount of tokens
    /// @param tokenIn Token to spend
    /// @param tokenOut Token to buy
    /// @param amountOut Amount of tokenOut to buy
    /// @return amountIn Amount of tokenIn needed
    function quoteBuy(
        address tokenIn,
        address tokenOut,
        uint128 amountOut
    ) external view returns (uint128 amountIn) {
        // TODO: Implement quote logic
        revert("NOT_IMPLEMENTED");
    }

    /// @notice Quote the proceeds from selling a specific amount of tokens
    /// @param tokenIn Token to sell
    /// @param tokenOut Token to receive
    /// @param amountIn Amount of tokenIn to sell
    /// @return amountOut Amount of tokenOut to receive
    function quoteSell(
        address tokenIn,
        address tokenOut,
        uint128 amountIn
    ) external view returns (uint128 amountOut) {
        // TODO: Implement quote logic
        revert("NOT_IMPLEMENTED");
    }
}
