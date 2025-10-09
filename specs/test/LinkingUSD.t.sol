// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/LinkingUSD.sol";
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
    address feeManager = 0xfeEC000000000000000000000000000000000000;

    function setUp() public {
        // Deploy mock registries at their precompile addresses
        vm.etch(0x403c000000000000000000000000000000000000, type(TIP403Registry).runtimeCode);
        vm.etch(0x4217c00000000000000000000000000000000000, type(MockTIP4217Registry).runtimeCode);

        // Deploy factory at the constant address
        factory = new TIP20Factory();
        vm.etch(0x20Fc000000000000000000000000000000000000, address(factory).code);
        factory = TIP20Factory(0x20Fc000000000000000000000000000000000000);

        // Initialize the tokenIdCounter to 1 (default initial value)
        vm.store(
            0x20Fc000000000000000000000000000000000000, bytes32(uint256(0)), bytes32(uint256(1))
        );

        // Deploy LinkingUSD to the root TIP20 address with proper constructor initialization
        deployCodeTo(
            "LinkingUSD.sol:LinkingUSD",
            abi.encode(admin),
            0x20C0000000000000000000000000000000000000
        );
        linkingToken = LinkingUSD(0x20C0000000000000000000000000000000000000);

        // Setup roles and mint tokens
        vm.startPrank(admin);
        linkingToken.grantRole(linkingToken.ISSUER_ROLE(), admin);
        linkingToken.mint(alice, 1000e18);
        linkingToken.mint(bob, 500e18);
        vm.stopPrank();
    }

    function testMetadata() public {
        assertEq(linkingToken.name(), "linkingUSD");
        assertEq(linkingToken.symbol(), "linkingUSD");
        assertEq(linkingToken.currency(), "USD");
        assertEq(address(linkingToken.quoteToken()), address(0));
    }

    function testTransferFails() public {
        vm.startPrank(alice);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transfer(bob, 100e18);
        vm.stopPrank();
    }

    function testTransferFromFails() public {
        vm.prank(alice);
        linkingToken.approve(bob, 200e18);

        vm.startPrank(bob);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transferFrom(alice, bob, 100e18);
        vm.stopPrank();
    }

    function testTransferWithMemoFails() public {
        vm.startPrank(alice);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transferWithMemo(bob, 100e18, bytes32(0));
        vm.stopPrank();
    }

    function testTransferFromWithMemoFails() public {
        vm.prank(alice);
        linkingToken.approve(bob, 200e18);

        vm.startPrank(bob);
        vm.expectRevert(LinkingUSD.TransfersDisabled.selector);
        linkingToken.transferFromWithMemo(alice, bob, 100e18, bytes32(0));
        vm.stopPrank();
    }

    function testSystemTransferFromWorks() public {
        // systemTransferFrom should still work for fee manager
        vm.startPrank(feeManager);
        bool success = linkingToken.systemTransferFrom(alice, bob, 100e18);
        assertTrue(success);
        vm.stopPrank();

        // Verify balances changed
        assertEq(linkingToken.balanceOf(alice), 900e18);
        assertEq(linkingToken.balanceOf(bob), 600e18);
    }

    function testMintingWorks() public {
        vm.startPrank(admin);
        linkingToken.mint(alice, 200e18);
        vm.stopPrank();

        assertEq(linkingToken.balanceOf(alice), 1200e18);
    }

    function testBurningWorks() public {
        vm.startPrank(admin);
        linkingToken.mint(admin, 100e18);
        linkingToken.burn(50e18);
        vm.stopPrank();

        assertEq(linkingToken.balanceOf(admin), 50e18);
    }

    function testApproveWorks() public {
        vm.prank(alice);
        bool success = linkingToken.approve(bob, 100e18);
        assertTrue(success);

        assertEq(linkingToken.allowance(alice, bob), 100e18);
    }

}
