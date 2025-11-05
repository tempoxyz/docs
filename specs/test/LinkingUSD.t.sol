// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/LinkingUSD.sol";
import "../src/TIP20.sol";
import "../src/TIP20Factory.sol";
import "../src/TIP403Registry.sol";
import "forge-std/Test.sol";

contract LinkingUSDTest is Test {

    LinkingUSD quoteToken;
    TIP20Factory factory;
    address admin = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);
    address constant STABLECOIN_DEX = 0xDEc0000000000000000000000000000000000000;

    function setUp() public {
        vm.etch(0x403c000000000000000000000000000000000000, type(TIP403Registry).runtimeCode);
        

        quoteToken = new LinkingUSD(admin);
        vm.startPrank(admin);
        quoteToken.grantRole(quoteToken.ISSUER_ROLE(), admin);
        vm.stopPrank();
    }

    function test_Metadata() public view {
        assertEq(quoteToken.name(), "linkingUSD");
        assertEq(quoteToken.symbol(), "linkingUSD");
        assertEq(quoteToken.currency(), "USD");
        assertEq(address(quoteToken.quoteToken()), address(0));
    }

    function test_Transfer_RevertIf_NoRoleAndNotStableDex(address sender, uint256 amount) public {
        vm.assume(sender != STABLECOIN_DEX);
        vm.startPrank(sender);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        quoteToken.transfer(bob, amount);
        vm.stopPrank();
    }

    function test_TransferFrom_RevertIf_NoRoleAndNotStableDex(address sender, uint256 amount)
        public
    {
        vm.assume(sender != STABLECOIN_DEX);
        vm.startPrank(sender);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        quoteToken.transferFrom(alice, bob, amount);
        vm.stopPrank();
    }

    function test_TransferWithMemo_RevertIf_NoRoleAndNotStableDex(address sender) public {
        vm.assume(sender != STABLECOIN_DEX);
        vm.startPrank(sender);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        quoteToken.transferWithMemo(bob, 100, bytes32(0));
        vm.stopPrank();
    }

    function test_TransferFromWithMemo_RevertIf_NoRoleAndNotStableDex(address sender) public {
        vm.assume(sender != STABLECOIN_DEX);
        vm.prank(sender);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        quoteToken.transferFromWithMemo(alice, bob, 100, bytes32(0));
    }

    function test_Mint(uint128 amount) public {
        vm.assume(amount > 0);

        uint256 balanceBefore = quoteToken.balanceOf(alice);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), balanceBefore + amount);
    }

    function test_Burn(uint128 amount) public {
        vm.assume(amount > 0);

        uint256 balanceBefore = quoteToken.balanceOf(admin);

        vm.startPrank(admin);

        quoteToken.mint(admin, amount);
        assertEq(quoteToken.balanceOf(admin), balanceBefore + amount);

        vm.expectEmit(true, true, true, true);
        emit TIP20.Burn(admin, amount);
        quoteToken.burn(amount);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(admin), balanceBefore);
    }

    function test_Approve(uint256 amount) public {
        vm.prank(alice);
        bool success = quoteToken.approve(bob, amount);
        assertTrue(success);

        assertEq(quoteToken.allowance(alice, bob), amount);
    }

    function test_Transfer(uint128 amount) public {
        vm.assume(amount > 0);

        vm.prank(admin);
        quoteToken.mint(STABLECOIN_DEX, amount);

        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);
        uint256 dexBalanceBefore = quoteToken.balanceOf(STABLECOIN_DEX);

        vm.startPrank(STABLECOIN_DEX);
        bool success = quoteToken.transfer(bob, amount);
        assertTrue(success);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
        assertEq(quoteToken.balanceOf(STABLECOIN_DEX), dexBalanceBefore - amount);
    }

    function test_TransferFrom(uint128 amount) public {
        vm.assume(amount > 0);

        vm.prank(admin);
        quoteToken.mint(alice, amount);

        vm.prank(alice);
        quoteToken.approve(STABLECOIN_DEX, amount);

        uint256 aliceBalanceBefore = quoteToken.balanceOf(alice);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);
        uint256 allowanceBefore = quoteToken.allowance(alice, STABLECOIN_DEX);

        vm.startPrank(STABLECOIN_DEX);
        bool success = quoteToken.transferFrom(alice, bob, amount);
        assertTrue(success);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
        assertEq(quoteToken.allowance(alice, STABLECOIN_DEX), allowanceBefore - amount);
    }

    function test_TransferFrom_RevertIf_InsufficientAllowance() public {
        vm.startPrank(STABLECOIN_DEX);
        vm.expectRevert(TIP20.InsufficientAllowance.selector);
        quoteToken.transferFrom(alice, bob, 100);
        vm.stopPrank();
    }

    function test_Transfer_RevertIf_InsufficientBalance() public {
        vm.prank(admin);
        quoteToken.mint(STABLECOIN_DEX, 50);

        vm.startPrank(STABLECOIN_DEX);
        vm.expectRevert(TIP20.InsufficientBalance.selector);
        quoteToken.transfer(bob, 100);
        vm.stopPrank();
    }

    function test_Transfer_WithTransferRole(uint128 amount) public {
        vm.assume(amount > 0);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        quoteToken.grantRole(quoteToken.TRANSFER_ROLE(), alice);
        vm.stopPrank();

        uint256 aliceBalanceBefore = quoteToken.balanceOf(alice);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);

        vm.startPrank(alice);
        bool success = quoteToken.transfer(bob, amount);
        assertTrue(success);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
    }

    function test_Transfer_WithReceiveWithMemoRole_Reverts(uint128 amount) public {
        vm.assume(amount > 0);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        quoteToken.grantRole(quoteToken.RECEIVE_WITH_MEMO_ROLE(), bob);
        vm.stopPrank();

        vm.startPrank(alice);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        quoteToken.transfer(bob, amount);
        vm.stopPrank();
    }

    function test_TransferWithMemo_WithTransferRole(uint128 amount) public {
        vm.assume(amount > 0);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        quoteToken.grantRole(quoteToken.TRANSFER_ROLE(), alice);
        vm.stopPrank();

        uint256 aliceBalanceBefore = quoteToken.balanceOf(alice);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);

        vm.startPrank(alice);
        quoteToken.transferWithMemo(bob, amount, "test memo");
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
    }

    function test_TransferWithMemo_WithReceiveWithMemoRole(uint128 amount) public {
        vm.assume(amount > 0);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        quoteToken.grantRole(quoteToken.RECEIVE_WITH_MEMO_ROLE(), bob);
        vm.stopPrank();

        uint256 aliceBalanceBefore = quoteToken.balanceOf(alice);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);

        vm.startPrank(alice);
        quoteToken.transferWithMemo(bob, amount, "test memo");
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
    }

    function test_TransferWithMemo_WithStablecoinDex(uint128 amount) public {
        vm.assume(amount > 0);

        vm.prank(admin);
        quoteToken.mint(STABLECOIN_DEX, amount);

        uint256 dexBalanceBefore = quoteToken.balanceOf(STABLECOIN_DEX);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);

        vm.startPrank(STABLECOIN_DEX);
        quoteToken.transferWithMemo(bob, amount, "test memo");
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(STABLECOIN_DEX), dexBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
    }

    function test_TransferFrom_WithTransferRole(uint128 amount) public {
        vm.assume(amount > 0);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        quoteToken.grantRole(quoteToken.TRANSFER_ROLE(), alice);
        vm.stopPrank();

        vm.prank(alice);
        quoteToken.approve(bob, amount);

        uint256 aliceBalanceBefore = quoteToken.balanceOf(alice);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);
        uint256 allowanceBefore = quoteToken.allowance(alice, bob);

        vm.startPrank(bob);
        bool success = quoteToken.transferFrom(alice, bob, amount);
        assertTrue(success);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
        assertEq(quoteToken.allowance(alice, bob), allowanceBefore - amount);
    }

    function test_TransferFrom_WithReceiveWithMemoRole_Reverts(uint128 amount) public {
        vm.assume(amount > 0);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        quoteToken.grantRole(quoteToken.RECEIVE_WITH_MEMO_ROLE(), bob);
        vm.stopPrank();

        vm.prank(alice);
        quoteToken.approve(alice, amount);

        vm.startPrank(alice);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        quoteToken.transferFrom(alice, bob, amount);
        vm.stopPrank();
    }

    function test_TransferFromWithMemo_WithTransferRole(uint128 amount) public {
        vm.assume(amount > 0);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        quoteToken.grantRole(quoteToken.TRANSFER_ROLE(), alice);
        vm.stopPrank();

        vm.prank(alice);
        quoteToken.approve(bob, amount);

        uint256 aliceBalanceBefore = quoteToken.balanceOf(alice);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);
        uint256 allowanceBefore = quoteToken.allowance(alice, bob);

        vm.startPrank(bob);
        bool success = quoteToken.transferFromWithMemo(alice, bob, amount, "test memo");
        assertTrue(success);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
        assertEq(quoteToken.allowance(alice, bob), allowanceBefore - amount);
    }

    function test_TransferFromWithMemo_WithReceiveWithMemoRole(uint128 amount) public {
        vm.assume(amount > 0);

        vm.startPrank(admin);
        quoteToken.mint(alice, amount);
        quoteToken.grantRole(quoteToken.RECEIVE_WITH_MEMO_ROLE(), bob);
        vm.stopPrank();

        vm.prank(alice);
        quoteToken.approve(alice, amount);

        uint256 aliceBalanceBefore = quoteToken.balanceOf(alice);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);
        uint256 allowanceBefore = quoteToken.allowance(alice, alice);

        vm.startPrank(alice);
        bool success = quoteToken.transferFromWithMemo(alice, bob, amount, "test memo");
        assertTrue(success);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
        assertEq(quoteToken.allowance(alice, alice), allowanceBefore - amount);
    }

    function test_TransferFromWithMemo_WithStablecoinDex(uint128 amount) public {
        vm.assume(amount > 0);

        vm.prank(admin);
        quoteToken.mint(alice, amount);

        vm.prank(alice);
        quoteToken.approve(STABLECOIN_DEX, amount);

        uint256 aliceBalanceBefore = quoteToken.balanceOf(alice);
        uint256 bobBalanceBefore = quoteToken.balanceOf(bob);
        uint256 allowanceBefore = quoteToken.allowance(alice, STABLECOIN_DEX);

        vm.startPrank(STABLECOIN_DEX);
        bool success = quoteToken.transferFromWithMemo(alice, bob, amount, "test memo");
        assertTrue(success);
        vm.stopPrank();

        assertEq(quoteToken.balanceOf(alice), aliceBalanceBefore - amount);
        assertEq(quoteToken.balanceOf(bob), bobBalanceBefore + amount);
        assertEq(quoteToken.allowance(alice, STABLECOIN_DEX), allowanceBefore - amount);
    }

}
