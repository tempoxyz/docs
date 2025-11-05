// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/FeeAMM.sol";
import "forge-std/Test.sol";

contract MockTIP20WithSystem {

    string public name;
    string public symbol;
    uint8 public decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function currency() external pure returns (string memory) {
        return "USD";
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "INSUFFICIENT_BALANCE");
        unchecked {
            balanceOf[msg.sender] -= amount;
            balanceOf[to] += amount;
        }
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    // Loosened version for testing; no special caller requirement
    function systemTransferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "INSUFFICIENT_BALANCE");
        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
        return true;
    }

}

contract FeeAMMTest is Test {

    FeeAMM amm;
    MockTIP20WithSystem userToken;
    MockTIP20WithSystem validatorToken;

    address alice = address(0xA11CE);

    function setUp() public {
        amm = new FeeAMM();
        userToken = new MockTIP20WithSystem("User", "USR");
        validatorToken = new MockTIP20WithSystem("Validator", "VAL");

        // Fund alice with large balances
        userToken.mint(alice, 10_000e18);
        validatorToken.mint(alice, 10_000e18);
    }

    function test_MintWithValidatorToken_InitialLiquidity_Succeeds() public {
        uint256 amountV = 10_000e18; // above 2*MIN_LIQUIDITY and within alice balance

        uint256 minLiq = amm.MIN_LIQUIDITY();

        vm.prank(alice);
        uint256 liquidity =
            amm.mintWithValidatorToken(address(userToken), address(validatorToken), amountV, alice);

        // Expected liquidity: amountV/2 - MIN_LIQUIDITY
        uint256 expected = amountV / 2 - minLiq;
        assertEq(liquidity, expected);

        bytes32 poolId = amm.getPoolId(address(userToken), address(validatorToken));
        (uint128 uRes, uint128 vRes) = _reserves(poolId);

        assertEq(uint256(uRes), 0);
        assertEq(uint256(vRes), amountV);

        assertEq(amm.totalSupply(poolId), expected + minLiq); // includes locked MIN_LIQUIDITY
        assertEq(amm.liquidityBalances(poolId, alice), expected);
    }

    function test_MintWithValidatorToken_InitialLiquidity_RevertsIf_TooSmall() public {
        uint256 minLiq = amm.MIN_LIQUIDITY();
        uint256 amountV = 2 * minLiq; // amountV/2 == MIN_LIQUIDITY -> should revert

        vm.startPrank(alice);
        vm.expectRevert(bytes("INSUFFICIENT_LIQUIDITY_MINTED"));
        amm.mintWithValidatorToken(address(userToken), address(validatorToken), amountV, alice);
        vm.stopPrank();
    }

    function test_MintWithValidatorToken_SubsequentDeposit_ProportionalShares() public {
        // Initialize pool with equal reserves via two-sided mint
        uint256 U0 = 1e18;
        uint256 V0 = 1e18;

        vm.prank(alice);
        amm.mint(address(userToken), address(validatorToken), U0, V0, alice);

        bytes32 poolId = amm.getPoolId(address(userToken), address(validatorToken));
        uint256 s = amm.totalSupply(poolId);

        // Subsequent single-sided validator deposit
        uint256 vin = 1e18;

        vm.prank(alice);
        uint256 minted =
            amm.mintWithValidatorToken(address(userToken), address(validatorToken), vin, alice);

        // Compute expected: floor(s * vin / (V + n*U)), n=N/SCALE
        (uint128 uRes, uint128 vRes) = _reserves(poolId);
        // uRes,vRes now include the latest deposit; compute from previous state
        // Previous reserves were U0,V0. For expected minted we must use prior reserves.
        uint256 denom = uint256(V0) + (amm.N() * uint256(U0)) / amm.SCALE();
        uint256 expected = (vin * s) / denom;

        assertEq(minted, expected);

        // Reserves should increase only on validator side by vin
        assertEq(uint256(uRes), U0);
        assertEq(uint256(vRes), V0 + vin);

        // Supply and balances updated
        assertEq(amm.totalSupply(poolId), s + expected);
        assertEq(amm.liquidityBalances(poolId, alice), s - amm.MIN_LIQUIDITY() + expected);
    }

    function test_MintWithValidatorToken_RoundsDown() public {
        // Initialize with skewed reserves to create fractional outcome
        uint256 U0 = 123_456_789_012_345_678; // 0.123456789e18
        uint256 V0 = 987_654_321_098_765_432; // 0.987654321e18

        vm.prank(alice);
        amm.mint(address(userToken), address(validatorToken), U0, V0, alice);

        bytes32 poolId = amm.getPoolId(address(userToken), address(validatorToken));
        uint256 s = amm.totalSupply(poolId);

        uint256 vin = 55_555_555_555_555_555; // arbitrary

        // Expected using prior reserves
        uint256 denom = uint256(V0) + (amm.N() * uint256(U0)) / amm.SCALE();
        uint256 expected = (vin * s) / denom; // integer division floors

        vm.prank(alice);
        uint256 minted =
            amm.mintWithValidatorToken(address(userToken), address(validatorToken), vin, alice);

        assertEq(minted, expected);
    }

    function _reserves(bytes32 poolId) internal view returns (uint128, uint128) {
        (uint128 ru, uint128 rv) = amm.pools(poolId);
        return (ru, rv);
    }

}
