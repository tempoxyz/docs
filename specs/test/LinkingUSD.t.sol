// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/LinkingUSD.sol";
import "../src/TIP20.sol";
import "../src/TIP20Factory.sol";
import "../src/TIP403Registry.sol";
import "./MockTIP4217Registry.sol";
import "forge-std/Test.sol";

contract LinkingUSDTest is Test {

    LinkingUSD linkingToken;
    TIP20Factory factory;
    address admin = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);
    address constant STABLECOIN_DEX = 0xDEc0000000000000000000000000000000000000;

    function setUp() public {
        vm.etch(0x403c000000000000000000000000000000000000, type(TIP403Registry).runtimeCode);
        vm.etch(0x4217c00000000000000000000000000000000000, type(MockTIP4217Registry).runtimeCode);

        linkingToken = new LinkingUSD(admin);
        vm.startPrank(admin);
        linkingToken.grantRole(linkingToken.ISSUER_ROLE(), admin);
        vm.stopPrank();
    }

    function test_Metadata() public view {
        assertEq(linkingToken.name(), "linkingUSD");
        assertEq(linkingToken.symbol(), "linkingUSD");
        assertEq(linkingToken.currency(), "USD");
        assertEq(address(linkingToken.quoteToken()), address(0));
    }

    function test_Transfer_RevertIf_NotStableDex(address sender, uint256 amount) public {
        vm.startPrank(sender);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transfer(bob, amount);
        vm.stopPrank();
    }

    function test_TransferFrom_RevertIf_NotStableDex(address sender, uint256 amount) public {
        vm.startPrank(sender);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transferFrom(alice, bob, amount);
        vm.stopPrank();
    }

    function test_TransferWithMemo_Reverts(address sender) public {
        vm.startPrank(sender);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transferWithMemo(bob, 100, bytes32(0));
        vm.stopPrank();

        // Assert that transfer from with memo is disabled for all callers, including stable dex
        vm.startPrank(STABLECOIN_DEX);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transferWithMemo(bob, 100, bytes32(0));
        vm.stopPrank();
    }

    function test_TransferFromWithMemo_Reverts(address sender) public {
        vm.prank(sender);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transferFromWithMemo(alice, bob, 100, bytes32(0));
        vm.stopPrank();

        // Assert that transfer from with memo is disabled for all callers, including stable dex
        vm.startPrank(STABLECOIN_DEX);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transferFromWithMemo(alice, bob, 100, bytes32(0));
        vm.stopPrank();
    }

    function test_Mint(uint128 amount) public {
        vm.assume(amount > 0);

        uint256 balanceBefore = linkingToken.balanceOf(alice);

        vm.startPrank(admin);
        linkingToken.mint(alice, amount);
        vm.stopPrank();

        assertEq(linkingToken.balanceOf(alice), balanceBefore + amount);
    }

    function test_Burn(uint128 amount) public {
        vm.assume(amount > 0);

        uint256 balanceBefore = linkingToken.balanceOf(admin);

        vm.startPrank(admin);

        linkingToken.mint(admin, amount);
        assertEq(linkingToken.balanceOf(admin), balanceBefore + amount);

        vm.expectEmit(true, true, true, true);
        emit TIP20.Burn(admin, amount);
        linkingToken.burn(amount);
        vm.stopPrank();

        assertEq(linkingToken.balanceOf(admin), balanceBefore);
    }

    function test_Approve(uint256 amount) public {
        vm.prank(alice);
        bool success = linkingToken.approve(bob, amount);
        assertTrue(success);

        assertEq(linkingToken.allowance(alice, bob), amount);
    }

    function test_Transfer(uint128 amount) public {
        vm.assume(amount > 0);

        vm.prank(admin);
        linkingToken.mint(STABLECOIN_DEX, amount);

        uint256 bobBalanceBefore = linkingToken.balanceOf(bob);
        uint256 dexBalanceBefore = linkingToken.balanceOf(STABLECOIN_DEX);

        vm.startPrank(STABLECOIN_DEX);
        bool success = linkingToken.transfer(bob, amount);
        assertTrue(success);
        vm.stopPrank();

        assertEq(linkingToken.balanceOf(bob), bobBalanceBefore + amount);
        assertEq(linkingToken.balanceOf(STABLECOIN_DEX), dexBalanceBefore - amount);
    }

    function test_TransferFrom(uint128 amount) public {
        vm.assume(amount > 0);

        vm.prank(admin);
        linkingToken.mint(alice, amount);

        vm.prank(alice);
        linkingToken.approve(STABLECOIN_DEX, amount);

        uint256 aliceBalanceBefore = linkingToken.balanceOf(alice);
        uint256 bobBalanceBefore = linkingToken.balanceOf(bob);
        uint256 allowanceBefore = linkingToken.allowance(alice, STABLECOIN_DEX);

        vm.startPrank(STABLECOIN_DEX);
        bool success = linkingToken.transferFrom(alice, bob, amount);
        assertTrue(success);
        vm.stopPrank();

        assertEq(linkingToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(linkingToken.balanceOf(bob), bobBalanceBefore + amount);
        assertEq(linkingToken.allowance(alice, STABLECOIN_DEX), allowanceBefore - amount);
    }

    function test_TransferFrom_RevertIf_InsufficientAllowance() public {
        vm.startPrank(STABLECOIN_DEX);
        vm.expectRevert(TIP20.InsufficientAllowance.selector);
        linkingToken.transferFrom(alice, bob, 100);
        vm.stopPrank();
    }

    function test_Transfer_RevertIf_InsufficientBalance() public {
        vm.prank(admin);
        linkingToken.mint(STABLECOIN_DEX, 50);

        vm.startPrank(STABLECOIN_DEX);
        vm.expectRevert(TIP20.InsufficientBalance.selector);
        linkingToken.transfer(bob, 100);
        vm.stopPrank();
    }

}
