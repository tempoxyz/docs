// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/LinkingUSD.sol";
import "../src/TIP20.sol";
import "../src/TIP20Factory.sol";
import "../src/TIP20RewardRegistry.sol";
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
    event RewardScheduled(
        address indexed funder, uint64 indexed id, uint256 amount, uint32 durationSeconds
    );
    event RewardCanceled(address indexed funder, uint64 indexed id, uint256 refund);
    event RewardRecipientSet(address indexed holder, address indexed recipient);

    function setUp() public {
        // Deploy mock registries at their precompile addresses
        vm.etch(0x403c000000000000000000000000000000000000, type(TIP403Registry).runtimeCode);
        vm.etch(0x4217c00000000000000000000000000000000000, type(MockTIP4217Registry).runtimeCode);

        // Deploy TIP20RewardsRegistry at its precompile address
        vm.etch(0x3000000000000000000000000000000000000000, type(TIP20RewardsRegistry).runtimeCode);

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
        amount = bound(amount, 0, type(uint128).max - token.totalSupply());

        uint256 initialSupply = token.totalSupply();
        uint256 initialBalance = token.balanceOf(to);

        vm.prank(admin);
        token.mintWithMemo(to, amount, memo);

        assertEq(token.balanceOf(to), initialBalance + amount);
        assertEq(token.totalSupply(), initialSupply + amount);
    }

    function testFuzzBurnWithMemo(uint256 mintAmount, uint256 burnAmount, bytes32 memo) public {
        // Bound amounts
        mintAmount = bound(mintAmount, 1, type(uint128).max / 2);
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

    /*//////////////////////////////////////////////////////////////
                        REWARD DISTRIBUTION TESTS
    //////////////////////////////////////////////////////////////*/

    function testSetRewardRecipientOptIn() public {
        vm.startPrank(alice);

        vm.expectEmit(true, true, false, false);
        emit RewardRecipientSet(alice, alice);

        token.setRewardRecipient(alice);

        (address delegatedRecipient,,) = token.userRewardInfo(alice);
        assertEq(delegatedRecipient, alice);
        assertEq(token.optedInSupply(), 1000e18);

        vm.stopPrank();
    }

    function testSetRewardRecipientOptOut() public {
        // First opt in
        vm.startPrank(alice);
        token.setRewardRecipient(alice);

        // Then opt out
        vm.expectEmit(true, true, false, false);
        emit RewardRecipientSet(alice, address(0));

        token.setRewardRecipient(address(0));

        (address delegatedRecipient,,) = token.userRewardInfo(alice);
        assertEq(delegatedRecipient, address(0));
        assertEq(token.optedInSupply(), 0);

        vm.stopPrank();
    }

    function testSetRewardRecipientToDifferentAddress() public {
        vm.startPrank(alice);

        vm.expectEmit(true, true, false, false);
        emit RewardRecipientSet(alice, bob);

        token.setRewardRecipient(bob);

        (address delegatedRecipient,,) = token.userRewardInfo(alice);
        assertEq(delegatedRecipient, bob);
        assertEq(token.optedInSupply(), 1000e18);

        vm.stopPrank();
    }

    function testRewardInjectionWithNoOptedIn() public {
        // When no one has opted in, rewards are still allowed but get locked
        vm.startPrank(admin);
        token.mint(admin, 1000e18);

        // Should revert with `NoOptedInSupply` if trying to start a timed reward
        vm.expectRevert(TIP20.NoOptedInSupply.selector);
        token.startReward(100e18, 0);
    }

    function testRewardInjectionAndClaimBasic() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin injects rewards (immediate payout with seconds = 0)
        vm.startPrank(admin);
        token.mint(admin, 1000e18);

        uint256 rewardAmount = 100e18;

        vm.expectEmit(true, true, true, true);
        emit Transfer(admin, address(token), rewardAmount);

        vm.expectEmit(true, true, true, true);
        emit RewardScheduled(admin, 0, rewardAmount, 0);

        uint64 id = token.startReward(rewardAmount, 0);

        vm.stopPrank();

        assertEq(id, 0); // Immediate payout returns 0
        assertEq(token.balanceOf(address(token)), rewardAmount);

        // Claim the rewards
        uint256 balanceBeforeClaim = token.balanceOf(alice);

        (,, uint256 rewardBalance) = token.userRewardInfo(alice);

        vm.expectEmit(true, true, true, true);
        emit Transfer(address(token), alice, 100e18);

        vm.prank(alice);
        token.claimRewards();

        assertEq(token.balanceOf(alice), balanceBeforeClaim + 100e18);
        assertEq(token.balanceOf(address(token)), 0);
    }

    function testRewardsWithNothingToDistribute() public {
        // Alice opts in but no rewards have been distributed
        vm.prank(alice);
        token.setRewardRecipient(alice);

        uint256 balanceBefore = token.balanceOf(alice);

        // No rewards to claim
        vm.prank(alice);
        token.claimRewards();

        // Balance should be unchanged
        assertEq(token.balanceOf(alice), balanceBefore);
    }

    function testRewardDistributionProRata() public {
        // Alice (1000e18) and Bob (500e18) opt in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        vm.prank(bob);
        token.setRewardRecipient(bob);

        assertEq(token.optedInSupply(), 1500e18);

        // Admin injects 300e18 rewards (immediate)
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(300e18, 0);
        vm.stopPrank();

        // Claim rewards for Alice and Bob
        // Alice should get 200e18 (2/3 of rewards)
        // Bob should get 100e18 (1/3 of rewards)
        vm.prank(alice);
        token.claimRewards();

        vm.prank(bob);
        token.claimRewards();

        assertEq(token.balanceOf(alice), 1000e18 + 200e18);
        assertEq(token.balanceOf(bob), 500e18 + 100e18);
    }

    function testRewardDistributionWithDelegation() public {
        // Alice opts in but delegates rewards to Charlie
        vm.prank(alice);
        token.setRewardRecipient(charlie);

        (address delegatedRecipient,,) = token.userRewardInfo(alice);
        assertEq(delegatedRecipient, charlie);

        // Admin injects rewards (immediate)
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 0);
        vm.stopPrank();

        // Trigger reward accumulation by alice doing a balance-changing operation
        vm.prank(alice);
        token.transfer(alice, 0);

        // Charlie claims the delegated rewards
        vm.prank(charlie);
        token.claimRewards();

        assertEq(token.balanceOf(charlie), 100e18);
    }

    function testRewardAccountingOnTransfer() public {
        // Alice and Bob opt in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        vm.prank(bob);
        token.setRewardRecipient(bob);

        // Inject rewards
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(150e18, 0);
        vm.stopPrank();

        // Alice transfers 200e18 to Bob
        // This accumulates rewards during the transfer
        vm.prank(alice);
        token.transfer(bob, 200e18);

        // Claim rewards
        vm.prank(alice);
        token.claimRewards();

        vm.prank(bob);
        token.claimRewards();

        // Check that opted-in supply includes claimed rewards
        assertEq(token.optedInSupply(), 1500e18 + 150e18);

        // Alice should have 800e18 + 100e18 rewards (1000/1500 * 150)
        // Bob should have 700e18 + 50e18 rewards (500/1500 * 150)
        assertEq(token.balanceOf(alice), 800e18 + 100e18);
        assertEq(token.balanceOf(bob), 700e18 + 50e18);
    }

    function testRewardAccountingOnMint() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Inject rewards
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 0);
        vm.stopPrank();

        // Mint more tokens to Alice - this accumulates pending rewards
        vm.prank(admin);
        token.mint(alice, 500e18);

        // Claim rewards
        vm.prank(alice);
        token.claimRewards();

        // Check opted-in supply
        assertEq(token.optedInSupply(), 1500e18 + 100e18);

        // Alice should have received the 100e18 rewards after claiming
        assertEq(token.balanceOf(alice), 1500e18 + 100e18);
    }

    function testRewardAccountingOnBurn() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Grant Alice ISSUER_ROLE so she can burn
        vm.startPrank(admin);
        token.grantRole(token.ISSUER_ROLE(), alice);
        vm.stopPrank();

        // Inject rewards
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 0);
        vm.stopPrank();

        // Alice burns some tokens - this accumulates pending rewards
        vm.startPrank(alice);
        token.burn(200e18);
        vm.stopPrank();

        // Claim rewards
        vm.prank(alice);
        token.claimRewards();

        // Check opted-in supply
        assertEq(token.optedInSupply(), 800e18 + 100e18);

        // Alice should have received the full 100e18 rewards after claiming
        assertEq(token.balanceOf(alice), 800e18 + 100e18);
    }

    function testMultipleRewardInjections() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin injects rewards multiple times
        vm.startPrank(admin);
        token.mint(admin, 1000e18);

        token.startReward(50e18, 0);
        token.startReward(30e18, 0);
        token.startReward(20e18, 0);

        vm.stopPrank();

        // Claim rewards
        vm.prank(alice);
        token.claimRewards();

        assertEq(token.balanceOf(alice), 1000e18 + 100e18);
    }

    function testChangingRewardRecipient() public {
        // Alice opts in with herself as recipient
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Inject some rewards
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 0);
        vm.stopPrank();

        // Alice changes recipient to Bob
        // This accumulates any accrued rewards into Alice's rewardBalance
        vm.prank(alice);
        token.setRewardRecipient(bob);

        // Alice claims her accumulated rewards
        vm.prank(alice);
        token.claimRewards();

        // Alice should have received her rewards after claiming
        assertEq(token.balanceOf(alice), 1000e18 + 100e18);

        // Now bob is the recipient for future rewards
        (address delegatedRecipient,,) = token.userRewardInfo(alice);
        assertEq(delegatedRecipient, bob);
    }

    function testTransferToNonOptedInUser() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Bob does not opt in

        // Inject rewards
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 0);
        vm.stopPrank();

        // Alice transfers to Bob - rewards are accumulated
        vm.prank(alice);
        token.transfer(bob, 300e18);

        // Claim rewards
        vm.prank(alice);
        token.claimRewards();

        // Opted-in supply should decrease since Bob is not opted in, but includes Alice's claimed rewards
        assertEq(token.optedInSupply(), 700e18 + 100e18);

        // Alice should have received her rewards after claiming
        assertEq(token.balanceOf(alice), 700e18 + 100e18);
    }

    function testTransferFromNonOptedInToOptedIn() public {
        // Bob opts in
        vm.prank(bob);
        token.setRewardRecipient(bob);

        // Alice does not opt in

        // Inject rewards
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(50e18, 0);
        vm.stopPrank();

        // Alice transfers to Bob - rewards accumulated to Bob
        vm.prank(alice);
        token.transfer(bob, 200e18);

        // Bob claims rewards
        vm.prank(bob);
        token.claimRewards();

        // Opted-in supply should include Bob's claimed rewards
        assertEq(token.optedInSupply(), 700e18 + 50e18);

        // Bob should have received rewards for his original 500e18 after claiming
        assertEq(token.balanceOf(bob), 700e18 + 50e18);
    }

    function testRewardWhenPaused() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Pause the contract
        vm.startPrank(admin);
        token.grantRole(token.PAUSE_ROLE(), admin);
        token.pause();

        token.mint(admin, 1000e18);
        vm.expectRevert(TIP20.ContractPaused.selector);
        token.startReward(100e18, 0);

        vm.stopPrank();
    }

    function testRewardDistributionWhenPaused() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Inject rewards
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 0);

        // Pause the contract
        token.grantRole(token.PAUSE_ROLE(), admin);
        token.pause();
        vm.stopPrank();

        // Alice tries to claim rewards - should fail because paused
        vm.prank(alice);
        vm.expectRevert(TIP20.ContractPaused.selector);
        token.claimRewards();
    }

    function testSetRewardRecipientWhenPaused() public {
        // Pause the contract
        vm.startPrank(admin);
        token.grantRole(token.PAUSE_ROLE(), admin);
        token.pause();
        vm.stopPrank();

        // Alice tries to set reward recipient
        vm.prank(alice);
        vm.expectRevert(TIP20.ContractPaused.selector);
        token.setRewardRecipient(alice);
    }

    function testFuzzRewardDistribution(
        uint256 aliceBalance,
        uint256 bobBalance,
        uint256 rewardAmount
    ) public {
        // Bound inputs
        aliceBalance = bound(aliceBalance, 1e18, 1000e18);
        bobBalance = bound(bobBalance, 1e18, 1000e18);
        rewardAmount = bound(rewardAmount, 1e18, 500e18);

        // Alice and bob already have balances from setUp (1000e18 and 500e18)
        // We need to adjust them to the desired balances
        vm.startPrank(admin);

        // Calculate how much to transfer to match desired balances
        uint256 aliceCurrentBalance = token.balanceOf(alice);
        uint256 bobCurrentBalance = token.balanceOf(bob);

        if (aliceBalance > aliceCurrentBalance) {
            token.mint(alice, aliceBalance - aliceCurrentBalance);
        } else if (aliceBalance < aliceCurrentBalance) {
            vm.stopPrank();
            vm.prank(alice);
            token.transfer(admin, aliceCurrentBalance - aliceBalance);
            vm.startPrank(admin);
        }

        if (bobBalance > bobCurrentBalance) {
            token.mint(bob, bobBalance - bobCurrentBalance);
        } else if (bobBalance < bobCurrentBalance) {
            vm.stopPrank();
            vm.prank(bob);
            token.transfer(admin, bobCurrentBalance - bobBalance);
            vm.startPrank(admin);
        }

        // Mint tokens for rewards
        token.mint(admin, rewardAmount);
        vm.stopPrank();

        // Both opt in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        vm.prank(bob);
        token.setRewardRecipient(bob);

        uint256 totalOptedIn = aliceBalance + bobBalance;

        // Inject rewards
        vm.prank(admin);
        token.startReward(rewardAmount, 0);

        // Calculate expected rewards
        uint256 aliceExpectedReward = (rewardAmount * aliceBalance) / totalOptedIn;
        uint256 bobExpectedReward = (rewardAmount * bobBalance) / totalOptedIn;

        // Claim rewards
        vm.prank(alice);
        token.claimRewards();

        vm.prank(bob);
        token.claimRewards();

        // Check balances (allow for rounding error due to integer division)
        assertApproxEqAbs(token.balanceOf(alice), aliceBalance + aliceExpectedReward, 1000);
        assertApproxEqAbs(token.balanceOf(bob), bobBalance + bobExpectedReward, 1000);
    }

    /*//////////////////////////////////////////////////////////////
                        STREAMING REWARDS TESTS
    //////////////////////////////////////////////////////////////*/

    function testCreateStreamBasic() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin creates a 100 second stream
        vm.startPrank(admin);
        token.mint(admin, 1000e18);

        vm.expectEmit(true, true, false, true);
        emit RewardScheduled(admin, 1, 100e18, 100);

        assertEq(token.balanceOf(address(token)), 0);
        uint64 streamId = token.startReward(100e18, 100);
        assertEq(token.balanceOf(address(token)), 100e18);

        vm.stopPrank();

        assertEq(streamId, 1);
        assertEq(token.nextStreamId(), 2);

        // Check stream data
        (address funder, uint64 startTime, uint64 endTime, uint256 rate, uint256 amount) =
            token.getStream(1);
        assertEq(funder, admin);
        assertEq(startTime, block.timestamp);
        assertEq(endTime, block.timestamp + 100);
        assertEq(amount, 100e18);
        assertGt(rate, 0);
    }

    function testStreamRewardsAccrueOverTime() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin creates a 100 second stream with 100e18 tokens
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 100);
        vm.stopPrank();

        // Fast forward 50 seconds (halfway through)
        vm.warp(block.timestamp + 50);

        // Claim rewards - Alice should have accrued ~50e18 (half of 100e18)
        vm.prank(alice);
        token.claimRewards();

        assertEq(token.balanceOf(alice), 1050e18);
    }

    function testStreamRewardsFullDuration() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin creates a 100 second stream
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 100);
        vm.stopPrank();

        // Fast forward to exactly the stream end
        vm.warp(block.timestamp + 100);

        // Call finalizeStreams (system transaction)
        vm.prank(address(0x3000000000000000000000000000000000000000));
        token.finalizeStreams(uint64(block.timestamp));

        // Claim rewards - Alice should have accrued the full 100e18
        vm.prank(alice);
        token.claimRewards();

        assertEq(token.balanceOf(alice), 1100e18);
    }

    function testCancelStreamBasic() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin creates a 100 second stream
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.setRewardRecipient(bob);

        uint256 initialOptedInSupply = token.optedInSupply();
        assertEq(initialOptedInSupply, 2000e18);

        uint64 streamId = token.startReward(100e18, 100);
        assertEq(token.optedInSupply(), initialOptedInSupply - 100e18);
        vm.stopPrank();

        // Get the stream data to find endTime
        (,, uint64 endTime,,) = token.getStream(streamId);

        // Get registry reference
        TIP20RewardsRegistry registry =
            TIP20RewardsRegistry(0x3000000000000000000000000000000000000000);

        // Cancel stream
        vm.warp(block.timestamp + 25);
        vm.startPrank(admin);
        vm.expectEmit(true, true, false, true);
        emit RewardCanceled(admin, streamId, 75e18);
        uint256 refund = token.cancelReward(streamId);
        vm.stopPrank();

        // Should get back ~75e18 (75% of original amount)
        assertEq(refund, 75e18);
        assertEq(token.balanceOf(admin), 975e18);
        assertEq(token.optedInSupply(), initialOptedInSupply - 25e18);
    }

    function testCancelStreamNotFunder() public {
        // Admin creates a stream
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        uint64 streamId = token.startReward(100e18, 100);
        vm.stopPrank();

        // Alice tries to cancel it
        vm.prank(alice);
        vm.expectRevert(TIP20.NotStreamFunder.selector);
        token.cancelReward(streamId);
    }

    function testCancelStreamAlreadyEnded() public {
        // Admin creates a stream
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        uint64 streamId = token.startReward(100e18, 100);
        vm.stopPrank();

        // Fast forward past the end
        vm.warp(block.timestamp + 101);

        // Try to cancel - should fail
        vm.prank(admin);
        vm.expectRevert(TIP20.StreamInactive.selector);
        token.cancelReward(streamId);
    }

    function testCancelStreamInactive() public {
        // Try to cancel a non-existent stream
        vm.prank(admin);
        vm.expectRevert(TIP20.StreamInactive.selector);
        token.cancelReward(999);
    }

    function testMultipleOverlappingStreams() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin creates two overlapping streams
        vm.startPrank(admin);
        token.mint(admin, 2000e18);

        token.startReward(100e18, 100); // First stream starts at t=1, ends at t=101
        vm.stopPrank();

        // Wait 50 seconds to t=51
        vm.warp(51);

        // Claim rewards from first stream's first 50 seconds (50e18 accrued so far)
        vm.prank(alice);
        token.claimRewards();

        // Admin starts second stream at t=51
        vm.prank(admin);
        token.startReward(100e18, 100); // Second stream: [51, 151]

        // Fast forward another 50 seconds to t=101 (first stream ends, second is halfway)
        vm.warp(101);

        // Claim remaining rewards
        // Alice should have: remaining 50e18 from first stream + ~50e18 from second stream
        vm.prank(alice);
        token.claimRewards();

        assertApproxEqAbs(token.balanceOf(alice), 1150e18, 2e18);
    }

    function testFinalizeStreams() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin creates a stream
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 100);
        vm.stopPrank();

        uint256 rateBeforeEnd = token.totalRewardPerSecond();
        assertGt(rateBeforeEnd, 0);

        // Fast forward to exactly the end time
        vm.warp(block.timestamp + 100);

        // Call finalizeStreams from the registry address (system transaction)
        vm.prank(address(0x3000000000000000000000000000000000000000));
        token.finalizeStreams(uint64(block.timestamp));

        // Rate should now be 0
        assertEq(token.totalRewardPerSecond(), 0);
    }

    function testFinalizeStreamsOnlySystem() public {
        // Admin creates a stream
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 100);
        vm.stopPrank();

        // Fast forward to end
        vm.warp(block.timestamp + 100);

        // Try to call finalizeStreams as non-zero address
        vm.prank(alice);
        vm.expectRevert("Only system");
        token.finalizeStreams(uint64(block.timestamp));
    }

    function testRewardWithZeroAmount() public {
        vm.prank(admin);
        vm.expectRevert(TIP20.InvalidAmount.selector);
        token.startReward(0, 100);
    }

    function testStreamWithProRataDistribution() public {
        // Alice and Bob opt in with different balances
        vm.prank(alice);
        token.setRewardRecipient(alice);

        vm.prank(bob);
        token.setRewardRecipient(bob);

        // Total opted in: alice 1000e18, bob 500e18 = 1500e18
        assertEq(token.optedInSupply(), 1500e18);

        // Admin creates a stream
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(150e18, 100);
        vm.stopPrank();

        // Fast forward to end
        vm.warp(block.timestamp + 100);

        // Claim rewards
        // Alice should get 2/3 (100e18), Bob should get 1/3 (50e18)
        vm.prank(alice);
        token.claimRewards();

        vm.prank(bob);
        token.claimRewards();

        assertApproxEqAbs(token.balanceOf(alice), 1100e18, 1e18);
        assertApproxEqAbs(token.balanceOf(bob), 550e18, 1e18);
    }

    function testStreamAccrualWithZeroOptedInSupply() public {
        // Admin creates a stream when no one is opted in (starts at t=1)
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 100); // Stream: [1, 101]
        vm.stopPrank();

        // Fast forward 50 seconds to t=51
        vm.warp(51);

        // Alice opts in now (at t=51)
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Fast forward to stream end at t=101
        vm.warp(101);

        // Finalize the stream (system transaction at endTime = 101)
        vm.prank(address(0x3000000000000000000000000000000000000000));
        token.finalizeStreams(101);

        // Claim rewards
        // Alice should only get rewards for the time she was opted in (last 50 seconds)
        // Since optedInSupply was 0 for first 50 seconds, those rewards are lost
        vm.prank(alice);
        token.claimRewards();

        // Alice should have roughly 50e18 (rewards from last 50 seconds)
        assertApproxEqAbs(token.balanceOf(alice), 1050e18, 2e18);
    }

    function testTransferRewardsAfterClaim() public {
        // Alice opts in
        vm.prank(alice);
        token.setRewardRecipient(alice);

        // Admin injects rewards (immediate)
        vm.startPrank(admin);
        token.mint(admin, 1000e18);
        token.startReward(100e18, 0);
        vm.stopPrank();

        // Claim rewards - Alice receives 100e18 rewards
        vm.prank(alice);
        token.claimRewards();

        // Verify Alice received the rewards
        assertEq(token.balanceOf(alice), 1100e18);
        assertEq(token.optedInSupply(), 1100e18);

        // Alice should be able to transfer the rewards to Bob
        vm.prank(alice);
        token.transfer(bob, 100e18);

        // Verify the transfer succeeded
        assertEq(token.balanceOf(alice), 1000e18);
        assertEq(token.balanceOf(bob), 600e18);
        assertEq(token.optedInSupply(), 1000e18);
    }

}
