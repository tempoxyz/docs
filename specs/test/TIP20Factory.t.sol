// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/LinkingUSD.sol";
import "../src/TIP20Factory.sol";
import "../src/TIP403Registry.sol";
import "forge-std/Test.sol";

contract TIP20FactoryTest is Test {

    TIP20Factory factory;
    LinkingUSD quoteToken;
    address admin = address(0x1);

    function setUp() public {
        // Deploy mock registries at their precompile addresses
        vm.etch(0x403c000000000000000000000000000000000000, type(TIP403Registry).runtimeCode);
        

        // Deploy factory at the constant address
        factory = new TIP20Factory();
        vm.etch(0x20Fc000000000000000000000000000000000000, address(factory).code);
        factory = TIP20Factory(0x20Fc000000000000000000000000000000000000);

        // Initialize the tokenIdCounter to 1 (default initial value)
        vm.store(
            0x20Fc000000000000000000000000000000000000, bytes32(uint256(0)), bytes32(uint256(1))
        );

        // Deploy LinkingUSD at the root TIP20 address with proper constructor storage
        deployCodeTo("LinkingUSD.sol", abi.encode(admin), 0x20C0000000000000000000000000000000000000);
        quoteToken = LinkingUSD(0x20C0000000000000000000000000000000000000);
    }

    function testCreateTokenWithValidQuoteToken() public {
        // Create token with LinkingUSD as the quote token
        address tokenAddr = factory.createToken(
            "Test Token", "TEST", "USD", TIP20(0x20C0000000000000000000000000000000000000), admin
        );

        TIP20 token = TIP20(tokenAddr);
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(address(token.quoteToken()), 0x20C0000000000000000000000000000000000000);
    }

    function testCreateTokenWithInvalidQuoteTokenReverts() public {
        // Try to create token with non-TIP20 address as quote token
        vm.expectRevert(TIP20Factory.InvalidQuoteToken.selector);
        factory.createToken(
            "Test Token",
            "TEST",
            "USD",
            TIP20(address(0x1234)), // Invalid address
            admin
        );
    }

    function testCreateTokenWithZeroAddressReverts() public {
        // Try to create token with zero address as quote token
        vm.expectRevert(TIP20Factory.InvalidQuoteToken.selector);
        factory.createToken("Test Token", "TEST", "USD", TIP20(address(0)), admin);
    }

    function testIsTIP20Function() public {
        assertTrue(factory.isTIP20(0x20C0000000000000000000000000000000000000));
        assertTrue(factory.isTIP20(0x20C0000000000000000000000000000000000001));
        assertFalse(factory.isTIP20(address(0)));
        assertFalse(factory.isTIP20(address(0x1234)));
        assertFalse(factory.isTIP20(0x21C0000000000000000000000000000000000000));
    }

    function testTokenIdCounter() public {
        assertEq(factory.tokenIdCounter(), 1);

        factory.createToken(
            "Token 1", "TK1", "USD", TIP20(0x20C0000000000000000000000000000000000000), admin
        );
        assertEq(factory.tokenIdCounter(), 2);

        factory.createToken(
            "Token 2", "TK2", "USD", TIP20(0x20C0000000000000000000000000000000000000), admin
        );
        assertEq(factory.tokenIdCounter(), 3);
    }

}
