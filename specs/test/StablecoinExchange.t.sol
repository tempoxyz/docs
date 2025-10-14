// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/LinkingUSD.sol";
import "../src/StablecoinExchange.sol";
import "../src/TIP20.sol";
import "../src/TIP20Factory.sol";
import "../src/TIP403Registry.sol";
import "./MockTIP20.sol";
import "./MockTIP4217Registry.sol";
import "forge-std/Test.sol";

contract StablecoinExchangeTest is Test {

    StablecoinExchange exchange;
    TIP20 baseToken;
    TIP20 quoteToken;
    TIP20Factory factory;

    address admin = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);

    bytes32 pairKey;
    uint128 constant INITIAL_BALANCE = 10_000e18;

    event OrderPlaced(
        uint128 indexed orderId,
        address indexed maker,
        address indexed base,
        uint128 amount,
        bool isBid,
        int16 tick
    );

    event FlipOrderPlaced(
        uint128 indexed orderId,
        address indexed maker,
        address indexed base,
        uint128 amount,
        bool isBid,
        int16 tick,
        int16 flipTick
    );

    event OrderCancelled(uint128 indexed orderId);

    event OrderFilled(
        uint128 indexed orderId,
        address indexed maker,
        address indexed taker,
        uint128 amountFilled,
        bool partialFill
    );

    event PairCreated(bytes32 indexed key, address indexed base, address indexed quote);

    function setUp() public {
        // Deploy mock registries at precompile addresses
        vm.etch(0x4217c00000000000000000000000000000000000, type(MockTIP4217Registry).runtimeCode);
        vm.etch(0x403c000000000000000000000000000000000000, type(TIP403Registry).runtimeCode);

        // Deploy factory
        factory = new TIP20Factory();

        // Deploy StablecoinExchange at the STABLECOIN_DEX address
        vm.etch(0xDEc0000000000000000000000000000000000000, type(StablecoinExchange).runtimeCode);
        exchange = StablecoinExchange(0xDEc0000000000000000000000000000000000000);

        // Deploy tokens
        quoteToken = new LinkingUSD(admin);
        baseToken = new TIP20("Base", "BASE", "USD", quoteToken, admin);

        vm.startPrank(admin);
        baseToken.grantRole(baseToken.ISSUER_ROLE(), admin);
        quoteToken.grantRole(quoteToken.ISSUER_ROLE(), admin);

        baseToken.mint(alice, INITIAL_BALANCE);
        baseToken.mint(bob, INITIAL_BALANCE);
        quoteToken.mint(alice, INITIAL_BALANCE);
        quoteToken.mint(bob, INITIAL_BALANCE);
        vm.stopPrank();

        // Approve exchange to spend tokens
        vm.startPrank(alice);
        baseToken.approve(address(exchange), type(uint256).max);
        quoteToken.approve(address(exchange), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(bob);
        baseToken.approve(address(exchange), type(uint256).max);
        quoteToken.approve(address(exchange), type(uint256).max);
        vm.stopPrank();

        // Create trading pair
        pairKey = exchange.createPair(address(baseToken));
    }

    function test_TickToPrice(int16 tick) public view {
        uint32 price = exchange.tickToPrice(tick);
        uint32 expectedPrice = uint32(int32(exchange.PRICE_SCALE()) + int32(tick));
        assertEq(price, expectedPrice);
    }

    function test_PriceToTick(uint32 price) public view {
        int16 tick = exchange.priceToTick(price);
        int16 expectedTick = int16(int32(price) - int32(exchange.PRICE_SCALE()));
        assertEq(tick, expectedTick);
    }

    function test_PairKey(address tokenA, address tokenB) public view {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        bytes32 expectedKey = keccak256(abi.encodePacked(token0, token1));

        bytes32 key1 = exchange.pairKey(tokenA, tokenB);
        bytes32 key2 = exchange.pairKey(tokenB, tokenA);

        assertEq(key1, key2);
        assertEq(key1, expectedKey);
        assertEq(key2, expectedKey);
    }

    function test_CreatePair() public {
        TIP20 newQuote = new TIP20("New Quote", "NQUOTE", "USD", quoteToken, admin);

        TIP20 newBase = new TIP20("New Base", "NBASE", "USD", newQuote, admin);
        bytes32 expectedKey = exchange.pairKey(address(newBase), address(newQuote));

        vm.expectEmit(true, true, true, true);
        emit PairCreated(expectedKey, address(newBase), address(newQuote));

        bytes32 key = exchange.createPair(address(newBase));
        assertEq(key, expectedKey);
    }

    function test_PlaceBidOrder() public {
        uint128 orderId = _placeBidOrder(alice, 1e18, 100);

        assertEq(orderId, 1);
        assertEq(exchange.activeOrderId(), 0);
        assertEq(exchange.pendingOrderId(), 1);

        uint32 price = exchange.tickToPrice(100);
        uint256 expectedEscrow = (uint256(1e18) * uint256(price)) / uint256(exchange.PRICE_SCALE());
        assertEq(quoteToken.balanceOf(alice), uint256(INITIAL_BALANCE) - expectedEscrow);
        assertEq(quoteToken.balanceOf(address(exchange)), expectedEscrow);
    }

    function test_PlaceAskOrder() public {
        uint128 orderId = _placeAskOrder(alice, 1e18, 100);

        assertEq(orderId, 1);
        assertEq(exchange.activeOrderId(), 0);
        assertEq(exchange.pendingOrderId(), 1);

        assertEq(baseToken.balanceOf(alice), INITIAL_BALANCE - 1e18);
        assertEq(baseToken.balanceOf(address(exchange)), 1e18);
    }

    function test_PlaceFlipBidOrder() public {
        vm.expectEmit(true, true, true, true);
        emit FlipOrderPlaced(1, alice, address(baseToken), 1e18, true, 100, 200);

        vm.prank(alice);
        uint128 orderId = exchange.placeFlip(address(baseToken), 1e18, true, 100, 200);

        assertEq(orderId, 1);
        assertEq(exchange.activeOrderId(), 0);
        assertEq(exchange.pendingOrderId(), 1);

        uint32 price = exchange.tickToPrice(100);
        uint256 expectedEscrow = (uint256(1e18) * uint256(price)) / uint256(exchange.PRICE_SCALE());
        assertEq(quoteToken.balanceOf(alice), uint256(INITIAL_BALANCE) - expectedEscrow);
        assertEq(quoteToken.balanceOf(address(exchange)), expectedEscrow);
    }

    function test_PlaceFlipAskOrder() public {
        vm.expectEmit(true, true, true, true);
        emit FlipOrderPlaced(1, alice, address(baseToken), 1e18, false, 100, -200);

        vm.prank(alice);
        uint128 orderId = exchange.placeFlip(address(baseToken), 1e18, false, 100, -200);

        assertEq(orderId, 1);
        assertEq(exchange.activeOrderId(), 0);
        assertEq(exchange.pendingOrderId(), 1);

        assertEq(baseToken.balanceOf(alice), INITIAL_BALANCE - 1e18);
        assertEq(baseToken.balanceOf(address(exchange)), 1e18);
    }

    function test_FlipOrderExecution() public {
        vm.prank(alice);
        uint128 flipOrderId = exchange.placeFlip(address(baseToken), 1e18, true, 100, 200);

        vm.prank(address(0));
        exchange.executeBlock();

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(flipOrderId, alice, bob, 1e18, false);

        vm.expectEmit(true, true, true, true);
        emit OrderPlaced(2, alice, address(baseToken), 1e18, false, 200);

        vm.prank(bob);
        exchange.sell(address(baseToken), address(quoteToken), 1e18, 0);

        assertEq(exchange.pendingOrderId(), 2);
        // TODO: pull the order from orders mapping and assert state changes
    }

    function test_ExecuteBlock() public {
        uint128 bid0 = _placeBidOrder(alice, 1e18, 100);
        uint128 bid1 = _placeBidOrder(bob, 2e18, 100);

        uint128 ask0 = _placeAskOrder(alice, 1e18, 150);
        uint128 ask1 = _placeAskOrder(bob, 2e18, 150);

        assertEq(exchange.activeOrderId(), 0);
        assertEq(exchange.pendingOrderId(), 4);

        // Execute the block and assert state changes
        vm.prank(address(0));
        exchange.executeBlock();

        assertEq(exchange.activeOrderId(), 4);
        assertEq(exchange.pendingOrderId(), 4);

        // Verify liquidity at tick levels
        (uint128 bidHead, uint128 bidTail, uint128 bidLiquidity) =
            exchange.getTickLevel(address(baseToken), 100, true);

        assertEq(bidHead, bid0);
        assertEq(bidTail, bid1);
        assertEq(bidLiquidity, 3e18);

        (uint128 askHead, uint128 askTail, uint128 askLiquidity) =
            exchange.getTickLevel(address(baseToken), 150, false);
        assertEq(askHead, ask0);
        assertEq(askTail, ask1);
        assertEq(askLiquidity, 3e18);
    }

    function test_ExecuteBlock_RevertIf_NonSystemTx(address caller) public {
        vm.assume(caller != address(0));

        vm.expectRevert("Only system tx");
        vm.prank(caller);
        exchange.executeBlock();
    }

    function test_CancelPendingOrder() public {
        uint128 orderId = _placeBidOrder(alice, 1e18, 100);

        vm.expectEmit(true, true, true, true);
        emit OrderCancelled(orderId);

        vm.prank(alice);
        exchange.cancel(orderId);

        // Verify tokens were returned
        uint32 price = exchange.tickToPrice(100);
        uint256 escrowAmount = (uint256(1e18) * uint256(price)) / uint256(exchange.PRICE_SCALE());
        assertEq(exchange.balanceOf(alice, address(quoteToken)), escrowAmount);
    }

    function test_CancelActiveOrder() public {
        uint128 orderId = _placeBidOrder(alice, 1e18, 100);

        vm.prank(address(0));
        exchange.executeBlock(); // Make order active

        vm.expectEmit(true, true, true, true);
        emit OrderCancelled(orderId);

        vm.prank(alice);
        exchange.cancel(orderId);

        // Verify tokens were returned to balance
        uint32 price = exchange.tickToPrice(100);
        uint256 escrowAmount = (uint256(1e18) * uint256(price)) / uint256(exchange.PRICE_SCALE());
        assertEq(exchange.balanceOf(alice, address(quoteToken)), escrowAmount);
    }

    function test_Withdraw() public {
        uint128 orderId = _placeBidOrder(alice, 1e18, 100);
        vm.prank(alice);
        exchange.cancel(orderId);

        uint128 exchangeBalance = exchange.balanceOf(alice, address(quoteToken));
        uint256 initialTokenBalance = quoteToken.balanceOf(alice);

        vm.prank(alice);
        exchange.withdraw(address(quoteToken), exchangeBalance);

        assertEq(exchange.balanceOf(alice, address(quoteToken)), 0);
        assertEq(quoteToken.balanceOf(alice), initialTokenBalance + exchangeBalance);
    }

    function test_QuoteBuy() public {
        _placeAskOrder(bob, 1000e18, 100);

        vm.prank(address(0));
        exchange.executeBlock();

        uint128 amountOut = 500e18;
        uint128 amountIn = exchange.quoteBuy(address(quoteToken), address(baseToken), amountOut);

        uint32 price = exchange.tickToPrice(100);
        uint128 expectedAmountIn = (amountOut * price) / exchange.PRICE_SCALE();
        assertEq(amountIn, expectedAmountIn);
    }

    function test_Buy() public {
        uint128 askOrderId = _placeAskOrder(bob, 1000e18, 100);

        vm.prank(address(0));
        exchange.executeBlock();

        uint128 amountOut = 500e18;
        uint32 price = exchange.tickToPrice(100);
        uint128 expectedAmountIn = (amountOut * price) / exchange.PRICE_SCALE();
        uint128 maxAmountIn = expectedAmountIn + 1000;
        uint256 initialBaseBalance = baseToken.balanceOf(alice);

        // Execute buy to partially fill order
        vm.expectEmit(true, true, true, true);
        emit OrderFilled(askOrderId, bob, alice, amountOut, true);

        vm.prank(alice);
        uint128 amountIn =
            exchange.buy(address(quoteToken), address(baseToken), amountOut, maxAmountIn);

        assertEq(amountIn, expectedAmountIn);
        assertEq(baseToken.balanceOf(alice), initialBaseBalance + amountOut);

        // Execute buy to fully fill order
        uint128 remainingAmount = 500e18;
        uint128 expectedAmountIn2 = (remainingAmount * price) / exchange.PRICE_SCALE();

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(askOrderId, bob, alice, remainingAmount, false);

        vm.prank(alice);
        uint128 amountIn2 =
            exchange.buy(address(quoteToken), address(baseToken), remainingAmount, maxAmountIn);

        assertEq(amountIn2, expectedAmountIn2);
        assertEq(baseToken.balanceOf(alice), initialBaseBalance + amountOut + remainingAmount);
    }

    function test_Buy_MultiTick() public {
        uint128 order1 = _placeAskOrder(bob, 1e18, 1);
        uint128 order2 = _placeAskOrder(bob, 1e18, 2);
        uint128 order3 = _placeAskOrder(bob, 1e18, 3);

        vm.prank(address(0));
        exchange.executeBlock();

        uint128 buyAmount = 25e17;
        uint128 p1 = exchange.tickToPrice(1);
        uint128 p2 = exchange.tickToPrice(2);
        uint128 p3 = exchange.tickToPrice(3);

        uint128 cost1 = (1e18 * p1) / exchange.PRICE_SCALE();
        uint128 cost2 = (1e18 * p2) / exchange.PRICE_SCALE();
        uint128 cost3 = (5e17 * p3) / exchange.PRICE_SCALE();
        uint128 totalCost = cost1 + cost2 + cost3;

        uint128 maxIn = totalCost * 2;
        uint256 initBalance = baseToken.balanceOf(alice);

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(order1, bob, alice, 1e18, false);

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(order2, bob, alice, 1e18, false);

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(order3, bob, alice, 5e17, true);

        vm.prank(alice);
        uint128 amountIn = exchange.buy(address(quoteToken), address(baseToken), buyAmount, maxIn);

        assertEq(amountIn, totalCost);
        assertEq(baseToken.balanceOf(alice), initBalance + buyAmount);
    }

    function test_QuoteSell() public {
        _placeBidOrder(bob, 1000e18, 100);

        vm.prank(address(0));
        exchange.executeBlock();

        uint128 amountIn = 500e18;
        uint128 amountOut = exchange.quoteSell(address(baseToken), address(quoteToken), amountIn);

        uint32 price = exchange.tickToPrice(100);
        uint128 expectedProceeds = (amountIn * price) / exchange.PRICE_SCALE();
        assertEq(amountOut, expectedProceeds);
    }

    function test_Sell() public {
        uint128 bidOrderId = _placeBidOrder(bob, 1000e18, 100);

        vm.prank(address(0));
        exchange.executeBlock();

        uint128 amountIn = 500e18;
        uint32 price = exchange.tickToPrice(100);
        uint128 expectedAmountOut = (amountIn * price) / exchange.PRICE_SCALE();
        uint128 minAmountOut = expectedAmountOut - 1000;
        uint256 initialQuoteBalance = quoteToken.balanceOf(alice);

        // Execute sell to partially fill order
        vm.expectEmit(true, true, true, true);
        emit OrderFilled(bidOrderId, bob, alice, amountIn, true);

        vm.prank(alice);
        uint128 amountOut =
            exchange.sell(address(baseToken), address(quoteToken), amountIn, minAmountOut);

        assertEq(amountOut, expectedAmountOut);
        assertEq(quoteToken.balanceOf(alice), initialQuoteBalance + amountOut);

        // Execute sell to fully fill order
        uint128 remainingAmount = 500e18; // 1000e18 - 500e18 = 500e18 remaining
        uint128 expectedAmountOut2 = (remainingAmount * price) / exchange.PRICE_SCALE();
        uint128 minAmountOut2 = expectedAmountOut2 - 1000;

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(bidOrderId, bob, alice, remainingAmount, false);

        vm.prank(alice);
        uint128 amountOut2 =
            exchange.sell(address(baseToken), address(quoteToken), remainingAmount, minAmountOut2);

        assertEq(amountOut2, expectedAmountOut2);
        assertEq(quoteToken.balanceOf(alice), initialQuoteBalance + amountOut + amountOut2);
    }

    function test_Sell_MultiTick() public {
        uint128 order1 = _placeBidOrder(bob, 1e18, 3);
        uint128 order2 = _placeBidOrder(bob, 1e18, 2);
        uint128 order3 = _placeBidOrder(bob, 1e18, 1);

        vm.prank(address(0));
        exchange.executeBlock();

        uint128 sellAmount = 25e17;
        uint128 p1 = exchange.tickToPrice(3);
        uint128 p2 = exchange.tickToPrice(2);
        uint128 p3 = exchange.tickToPrice(1);

        uint128 out1 = (1e18 * p1) / exchange.PRICE_SCALE();
        uint128 out2 = (1e18 * p2) / exchange.PRICE_SCALE();
        uint128 out3 = (5e17 * p3) / exchange.PRICE_SCALE();
        uint128 totalOut = out1 + out2 + out3;

        uint128 minOut = totalOut / 2;
        uint256 initBalance = quoteToken.balanceOf(alice);

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(order1, bob, alice, 1e18, false);

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(order2, bob, alice, 1e18, false);

        vm.expectEmit(true, true, true, true);
        emit OrderFilled(order3, bob, alice, 5e17, true);

        vm.prank(alice);
        uint128 amountOut =
            exchange.sell(address(baseToken), address(quoteToken), sellAmount, minOut);

        assertEq(amountOut, totalOut);
        assertEq(quoteToken.balanceOf(alice), initBalance + totalOut);
    }

    /*//////////////////////////////////////////////////////////////
                        HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _placeBidOrder(address user, uint128 amount, int16 tick)
        internal
        returns (uint128 orderId)
    {
        vm.expectEmit(true, true, true, true);
        emit OrderPlaced(
            exchange.pendingOrderId() + 1, user, address(baseToken), amount, true, tick
        );

        vm.prank(user);
        orderId = exchange.place(address(baseToken), amount, true, tick);
    }

    function _placeAskOrder(address user, uint128 amount, int16 tick)
        internal
        returns (uint128 orderId)
    {
        vm.expectEmit(true, true, true, true);
        emit OrderPlaced(
            exchange.pendingOrderId() + 1, user, address(baseToken), amount, false, tick
        );

        vm.prank(user);
        orderId = exchange.place(address(baseToken), amount, false, tick);
    }

}
