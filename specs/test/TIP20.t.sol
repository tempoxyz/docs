// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/LinkingUSD.sol";
import "../src/TIP20.sol";
import "../src/TIP20Factory.sol";
import "../src/TIP403Registry.sol";
import "./MockTIP4217Registry.sol";
import "forge-std/Test.sol";

contract TIP20Test is Test {

    TIP20Factory factory;
    TIP20 token;
    TIP20 linkedToken;
    TIP20 anotherToken;

    address constant LINKING_USD = 0x20C0000000000000000000000000000000000000;
    address admin = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);
    address charlie = address(0x4);

    bytes32 constant TEST_MEMO = bytes32(uint256(0x1234567890abcdef));
    bytes32 constant ANOTHER_MEMO = bytes32("Hello World");

    event TransferWithMemo(
        address indexed from, address indexed to, uint256 amount, bytes32 indexed memo
    );
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event NextQuoteTokenSet(address indexed updater, TIP20 indexed nextQuoteToken);
    event QuoteTokenUpdate(address indexed updater, TIP20 indexed newQuoteToken);

    function setUp() public {
        // Deploy mock registries at their precompile addresses
        vm.etch(0x403c000000000000000000000000000000000000, type(TIP403Registry).runtimeCode);
        vm.etch(0x4217c00000000000000000000000000000000000, type(MockTIP4217Registry).runtimeCode);

        // Deploy the factory at the constant address
        factory = new TIP20Factory();
        vm.etch(0x20Fc000000000000000000000000000000000000, address(factory).code);
        factory = TIP20Factory(0x20Fc000000000000000000000000000000000000);

        // Increment the tokenIdCounter to match the tokens we're deploying
        // We need tokenIdCounter to be at least 3 for our test tokens
        vm.store(
            0x20Fc000000000000000000000000000000000000,
            bytes32(uint256(0)), // tokenIdCounter is the first storage slot
            bytes32(uint256(3))
        );

        // Deploy linkingUSD at the specific TIP20 precompile address
        deployCodeTo("LinkingUSD.sol", abi.encode(admin), LINKING_USD);

        // Deploy linked tokens to TIP20 precompile addresses using deployCodeTo
        // Replace address(0) with linkingUSD
        deployCodeTo(
            "TIP20.sol",
            abi.encode("Linked Token", "LINK", "USD", TIP20(LINKING_USD), admin),
            0x20C0000000000000000000000000000000000001
        );
        linkedToken = TIP20(0x20C0000000000000000000000000000000000001);

        deployCodeTo(
            "TIP20.sol",
            abi.encode("Another Token", "OTHER", "USD", TIP20(LINKING_USD), admin),
            0x20C0000000000000000000000000000000000002
        );
        anotherToken = TIP20(0x20C0000000000000000000000000000000000002);

        // Deploy TIP20 token with linkedToken
        deployCodeTo(
            "TIP20.sol",
            abi.encode("Test Token", "TST", "USD", linkedToken, admin),
            0x20C0000000000000000000000000000000000003
        );
        token = TIP20(0x20C0000000000000000000000000000000000003);

        // Setup roles and mint tokens
        vm.startPrank(admin);
        token.grantRole(token.ISSUER_ROLE(), admin);
        token.mint(alice, 1000e18);
        token.mint(bob, 500e18);
        vm.stopPrank();
    }

    function testTransferWithMemo() public {
        uint256 amount = 100e18;

        vm.startPrank(alice);

        // Expect both Transfer and TransferWithMemo events
        vm.expectEmit(true, true, true, true);
        emit Transfer(alice, bob, amount);

        vm.expectEmit(true, true, true, true);
        emit TransferWithMemo(alice, bob, amount, TEST_MEMO);

        token.transferWithMemo(bob, amount, TEST_MEMO);

        vm.stopPrank();

        // Verify balances
        assertEq(token.balanceOf(alice), 900e18);
        assertEq(token.balanceOf(bob), 600e18);
    }

    function testTransferWithMemoDifferentMemos() public {
        uint256 amount1 = 50e18;
        uint256 amount2 = 75e18;

        vm.startPrank(alice);

        // First transfer with TEST_MEMO
        vm.expectEmit(true, true, true, true);
        emit TransferWithMemo(alice, bob, amount1, TEST_MEMO);
        token.transferWithMemo(bob, amount1, TEST_MEMO);

        // Second transfer with ANOTHER_MEMO
        vm.expectEmit(true, true, true, true);
        emit TransferWithMemo(alice, charlie, amount2, ANOTHER_MEMO);
        token.transferWithMemo(charlie, amount2, ANOTHER_MEMO);

        vm.stopPrank();

        // Verify balances
        assertEq(token.balanceOf(alice), 875e18);
        assertEq(token.balanceOf(bob), 550e18);
        assertEq(token.balanceOf(charlie), 75e18);
    }

    function testTransferFromWithMemo() public {
        uint256 amount = 150e18;

        // Alice approves bob to spend her tokens
        vm.prank(alice);
        token.approve(bob, 200e18);

        vm.startPrank(bob);

        // Expect both Transfer and TransferWithMemo events
        vm.expectEmit(true, true, true, true);
        emit Transfer(alice, charlie, amount);

        vm.expectEmit(true, true, true, true);
        emit TransferWithMemo(alice, charlie, amount, TEST_MEMO);

        bool success = token.transferFromWithMemo(alice, charlie, amount, TEST_MEMO);
        assertTrue(success);

        vm.stopPrank();

        // Verify balances
        assertEq(token.balanceOf(alice), 850e18);
        assertEq(token.balanceOf(charlie), 150e18);

        // Verify allowance was decreased
        assertEq(token.allowance(alice, bob), 50e18);
    }

    function testTransferFromWithMemoInsufficientAllowance() public {
        uint256 amount = 300e18;

        // Alice approves bob to spend less than he tries to transfer
        vm.prank(alice);
        token.approve(bob, 200e18);

        vm.startPrank(bob);
        vm.expectRevert(TIP20.InsufficientAllowance.selector);
        token.transferFromWithMemo(alice, charlie, amount, TEST_MEMO);
        vm.stopPrank();

        // Verify balances unchanged
        assertEq(token.balanceOf(alice), 1000e18);
        assertEq(token.balanceOf(charlie), 0);
    }

    function testTransferFromWithMemoInfiniteAllowance() public {
        uint256 amount = 150e18;

        // Alice gives bob infinite allowance
        vm.prank(alice);
        token.approve(bob, type(uint256).max);

        vm.startPrank(bob);

        // First transfer
        token.transferFromWithMemo(alice, charlie, amount, TEST_MEMO);

        // Verify infinite allowance is still infinite
        assertEq(token.allowance(alice, bob), type(uint256).max);

        // Second transfer should also work
        token.transferFromWithMemo(alice, charlie, amount, ANOTHER_MEMO);

        vm.stopPrank();

        // Verify balances
        assertEq(token.balanceOf(alice), 700e18);
        assertEq(token.balanceOf(charlie), 300e18);

        // Verify infinite allowance is still infinite
        assertEq(token.allowance(alice, bob), type(uint256).max);
    }

    function testTransferWithMemoWhenPaused() public {
        // Admin pauses the contract
        vm.startPrank(admin);
        token.grantRole(token.PAUSE_ROLE(), admin);
        token.pause();
        vm.stopPrank();

        vm.startPrank(alice);
        vm.expectRevert(TIP20.ContractPaused.selector);
        token.transferWithMemo(bob, 100e18, TEST_MEMO);
        vm.stopPrank();
    }

    function testTransferFromWithMemoWhenPaused() public {
        // Alice approves bob
        vm.prank(alice);
        token.approve(bob, 200e18);

        // Admin pauses the contract
        vm.startPrank(admin);
        token.grantRole(token.PAUSE_ROLE(), admin);
        token.pause();
        vm.stopPrank();

        vm.startPrank(bob);
        vm.expectRevert(TIP20.ContractPaused.selector);
        token.transferFromWithMemo(alice, charlie, 100e18, TEST_MEMO);
        vm.stopPrank();
    }

    function testTransferWithMemoToTokenAddress() public {
        // Try to transfer to a token precompile address
        address tokenAddress = address(0x2000000000000000000000000000000000000001);

        vm.startPrank(alice);
        vm.expectRevert(TIP20.InvalidRecipient.selector);
        token.transferWithMemo(tokenAddress, 100e18, TEST_MEMO);
        vm.stopPrank();
    }

    function testTransferFromWithMemoToTokenAddress() public {
        // Alice approves bob
        vm.prank(alice);
        token.approve(bob, 200e18);

        // Try to transfer to a token precompile address
        address tokenAddress = address(0x2000000000000000000000000000000000000001);

        vm.startPrank(bob);
        vm.expectRevert(TIP20.InvalidRecipient.selector);
        token.transferFromWithMemo(alice, tokenAddress, 100e18, TEST_MEMO);
        vm.stopPrank();
    }

    function testFuzzTransferWithMemo(address to, uint256 amount, bytes32 memo) public {
        // Avoid invalid recipients
        vm.assume(to != address(0));
        vm.assume((uint160(to) >> 64) != 0x200000000000000000000000);

        // Bound amount to alice's balance
        amount = bound(amount, 0, 1000e18);

        // Get initial balance of recipient
        uint256 toInitialBalance = token.balanceOf(to);

        vm.prank(alice);
        token.transferWithMemo(to, amount, memo);

        // Check balances - handle self-transfer case
        if (alice == to) {
            assertEq(token.balanceOf(alice), 1000e18);
        } else {
            assertEq(token.balanceOf(alice), 1000e18 - amount);
            assertEq(token.balanceOf(to), toInitialBalance + amount);
        }
    }

    function testFuzzTransferFromWithMemo(
        address spender,
        address to,
        uint256 allowanceAmount,
        uint256 transferAmount,
        bytes32 memo
    ) public {
        // Avoid invalid addresses
        vm.assume(spender != address(0) && to != address(0));
        vm.assume((uint160(to) >> 64) != 0x200000000000000000000000);
        vm.assume(spender != 0x1559c00000000000000000000000000000000000); // Not FeeManager

        // Bound amounts
        allowanceAmount = bound(allowanceAmount, 0, 1000e18);
        transferAmount = bound(transferAmount, 0, allowanceAmount);

        // Alice approves spender
        vm.prank(alice);
        token.approve(spender, allowanceAmount);

        // Get initial balance of recipient (in case it's an existing address with balance)
        uint256 toInitialBalance = token.balanceOf(to);

        // Spender transfers from alice to to
        vm.prank(spender);
        bool success = token.transferFromWithMemo(alice, to, transferAmount, memo);
        assertTrue(success);

        // Check balances based on whether it's a self-transfer or not
        if (alice == to) {
            // Self-transfer: alice's balance remains unchanged
            assertEq(token.balanceOf(alice), 1000e18);
        } else {
            // Normal transfer: alice loses transferAmount, to gains transferAmount
            assertEq(token.balanceOf(alice), 1000e18 - transferAmount);
            assertEq(token.balanceOf(to), toInitialBalance + transferAmount);
        }

        // Check allowance
        if (allowanceAmount == type(uint256).max) {
            assertEq(token.allowance(alice, spender), type(uint256).max);
        } else {
            assertEq(token.allowance(alice, spender), allowanceAmount - transferAmount);
        }
    }

    function testMintWithMemo() public {
        uint256 amount = 200e18;
        address recipient = charlie;

        vm.startPrank(admin);

        // Expect Transfer, TransferWithMemo, and Mint events
        vm.expectEmit(true, true, true, true);
        emit Transfer(address(0), recipient, amount);

        vm.expectEmit(true, true, true, true);
        emit TransferWithMemo(address(0), recipient, amount, TEST_MEMO);

        vm.expectEmit(true, true, true, true);
        emit Mint(recipient, amount);

        token.mintWithMemo(recipient, amount, TEST_MEMO);

        vm.stopPrank();

        // Verify balance and total supply
        assertEq(token.balanceOf(recipient), amount);
        assertEq(token.totalSupply(), 1500e18 + amount);
    }

    function testBurnWithMemo() public {
        uint256 amount = 100e18;

        vm.startPrank(admin);

        // First mint some tokens to admin to burn
        token.mint(admin, amount);

        // Expect Transfer, TransferWithMemo, and Burn events
        vm.expectEmit(true, true, true, true);
        emit Transfer(admin, address(0), amount);

        vm.expectEmit(true, true, true, true);
        emit TransferWithMemo(admin, address(0), amount, TEST_MEMO);

        vm.expectEmit(true, true, true, true);
        emit Burn(admin, amount);

        token.burnWithMemo(amount, TEST_MEMO);

        vm.stopPrank();

        // Verify balance and total supply
        assertEq(token.balanceOf(admin), 0);
        assertEq(token.totalSupply(), 1500e18);
    }

    function testMintWithMemoSupplyCapExceeded() public {
        vm.startPrank(admin);

        // Set a supply cap
        token.setSupplyCap(1600e18);

        // Try to mint more than the cap allows
        vm.expectRevert(TIP20.SupplyCapExceeded.selector);
        token.mintWithMemo(charlie, 200e18, TEST_MEMO);

        vm.stopPrank();
    }

    function testBurnWithMemoInsufficientBalance() public {
        vm.startPrank(admin);

        // Try to burn more than admin has
        vm.expectRevert(TIP20.InsufficientBalance.selector);
        token.burnWithMemo(100e18, TEST_MEMO);

        vm.stopPrank();
    }

    function testMintWithMemoRequiresIssuerRole() public {
        // Try to mint without ISSUER_ROLE
        vm.startPrank(alice);
        vm.expectRevert();
        token.mintWithMemo(charlie, 100e18, TEST_MEMO);
        vm.stopPrank();
    }

    function testBurnWithMemoRequiresIssuerRole() public {
        // Try to burn without ISSUER_ROLE
        vm.startPrank(alice);
        vm.expectRevert();
        token.burnWithMemo(100e18, TEST_MEMO);
        vm.stopPrank();
    }

    function testFuzzMintWithMemo(address to, uint256 amount, bytes32 memo) public {
        // Avoid minting to address(0) or token addresses
        vm.assume(to != address(0));
        vm.assume((uint160(to) >> 64) != 0x200000000000000000000000);

        // Bound amount to avoid supply cap overflow
        amount = bound(amount, 0, type(uint256).max - token.totalSupply());

        uint256 initialSupply = token.totalSupply();
        uint256 initialBalance = token.balanceOf(to);

        vm.prank(admin);
        token.mintWithMemo(to, amount, memo);

        assertEq(token.balanceOf(to), initialBalance + amount);
        assertEq(token.totalSupply(), initialSupply + amount);
    }

    function testFuzzBurnWithMemo(uint256 mintAmount, uint256 burnAmount, bytes32 memo) public {
        // Bound amounts
        mintAmount = bound(mintAmount, 1, type(uint256).max / 2);
        burnAmount = bound(burnAmount, 0, mintAmount);

        vm.startPrank(admin);

        // Mint tokens first
        token.mint(admin, mintAmount);

        uint256 balanceBeforeBurn = token.balanceOf(admin);
        uint256 supplyBeforeBurn = token.totalSupply();

        // Burn tokens with memo
        token.burnWithMemo(burnAmount, memo);

        assertEq(token.balanceOf(admin), balanceBeforeBurn - burnAmount);
        assertEq(token.totalSupply(), supplyBeforeBurn - burnAmount);

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                          QUOTE TOKEN TESTS
    //////////////////////////////////////////////////////////////*/

    function testQuoteTokenSetInConstructor() public {
        assertEq(address(token.quoteToken()), address(linkedToken));
    }

    function testSetNextQuoteTokenAndComplete() public {
        vm.startPrank(admin);

        // Expect the NextQuoteTokenSet event
        vm.expectEmit(true, true, false, false);
        emit NextQuoteTokenSet(admin, anotherToken);

        token.setNextQuoteToken(anotherToken);

        // Verify nextQuoteToken is set but quoteToken is not changed yet
        assertEq(address(token.nextQuoteToken()), address(anotherToken));
        assertEq(address(token.quoteToken()), address(linkedToken));

        // Expect the QuoteTokenUpdate event
        vm.expectEmit(true, true, false, false);
        emit QuoteTokenUpdate(admin, anotherToken);

        token.completeQuoteTokenUpdate();

        vm.stopPrank();

        assertEq(address(token.quoteToken()), address(anotherToken));
    }

    function testSetNextQuoteTokenRequiresAdmin() public {
        vm.startPrank(alice);

        vm.expectRevert();
        token.setNextQuoteToken(anotherToken);

        vm.stopPrank();
    }

    function testCompleteQuoteTokenUpdateRequiresAdmin() public {
        vm.prank(admin);
        token.setNextQuoteToken(anotherToken);

        vm.startPrank(alice);

        vm.expectRevert();
        token.completeQuoteTokenUpdate();

        vm.stopPrank();
    }

    function testSetNextQuoteTokenToInvalidAddress() public {
        vm.startPrank(admin);

        // Should revert when trying to set to zero address (not registered in factory)
        vm.expectRevert(TIP20.InvalidQuoteToken.selector);
        token.setNextQuoteToken(TIP20(address(0)));

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        LOOP PREVENTION TESTS
    //////////////////////////////////////////////////////////////*/

    function testCompleteQuoteTokenUpdateCannotCreateDirectLoop() public {
        // Try to set token's quote token to itself
        vm.startPrank(admin);

        // setNextQuoteToken doesn't check for loops
        token.setNextQuoteToken(token);

        // completeQuoteTokenUpdate should detect the loop and revert
        vm.expectRevert(TIP20.InvalidQuoteToken.selector);
        token.completeQuoteTokenUpdate();

        vm.stopPrank();
    }

    function testCompleteQuoteTokenUpdateCannotCreateIndirectLoop() public {
        // Increment tokenIdCounter to allow token 4
        vm.store(
            0x20Fc000000000000000000000000000000000000, bytes32(uint256(0)), bytes32(uint256(4))
        );

        // Create a chain: linkingUSD -> linkedToken -> token -> newToken
        deployCodeTo(
            "TIP20.sol",
            abi.encode("New Token", "NEW", "USD", token, admin),
            0x20C0000000000000000000000000000000000004
        );
        TIP20 newToken = TIP20(0x20C0000000000000000000000000000000000004);

        // Try to set token's quote token to newToken (which would create a loop)
        vm.startPrank(admin);

        // setNextQuoteToken doesn't check for loops
        token.setNextQuoteToken(newToken);

        // completeQuoteTokenUpdate should detect the loop and revert
        vm.expectRevert(TIP20.InvalidQuoteToken.selector);
        token.completeQuoteTokenUpdate();

        vm.stopPrank();
    }

    function testCompleteQuoteTokenUpdateCannotCreateLongerLoop() public {
        // Increment tokenIdCounter to allow tokens 4 and 5
        vm.store(
            0x20Fc000000000000000000000000000000000000, bytes32(uint256(0)), bytes32(uint256(5))
        );

        // Create a longer chain: linkingUSD -> linkedToken -> token -> token2 -> token3
        deployCodeTo(
            "TIP20.sol",
            abi.encode("Token 2", "TK2", "USD", token, admin),
            0x20C0000000000000000000000000000000000004
        );
        TIP20 token2 = TIP20(0x20C0000000000000000000000000000000000004);

        deployCodeTo(
            "TIP20.sol",
            abi.encode("Token 3", "TK3", "USD", token2, admin),
            0x20c0000000000000000000000000000000000005
        );
        TIP20 token3 = TIP20(0x20c0000000000000000000000000000000000005);

        // Try to set linkedToken's quote token to token3 (would create loop)
        vm.startPrank(admin);

        // setNextQuoteToken doesn't check for loops
        linkedToken.setNextQuoteToken(token3);

        // completeQuoteTokenUpdate should detect the loop and revert
        vm.expectRevert(TIP20.InvalidQuoteToken.selector);
        linkedToken.completeQuoteTokenUpdate();

        vm.stopPrank();
    }

    function testCompleteQuoteTokenUpdateValidChangeDoesNotRevert() public {
        // Verify that a valid change doesn't revert
        // token currently links to linkedToken, change it to anotherToken (both depth 1)
        vm.startPrank(admin);

        // This should succeed - no loop created
        token.setNextQuoteToken(anotherToken);
        token.completeQuoteTokenUpdate();

        vm.stopPrank();

        // Verify the change was successful
        assertEq(address(token.quoteToken()), address(anotherToken));
    }

}
