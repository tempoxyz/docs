# TIP Contracts Developer Documentation

TIP contracts enshrine certain standards and features in order to standardize their usage on Tempo. 

* `TIP-20` Contract suite: `TIP-20` extends the `ERC-20` token standard in ways that help with payments use-cases while retaining full backward compatibility. For example, it defines a new `TransferWithMemo` function that allows the sender to include a memo. This memo is emitted in a new `TransferWithMemo` event, allowing for easy backend reconciliation for institutions using this chain. It also allows for the token to inherit access lists and other policies from a third party via the TIP-403 Policy Registry, described below.  
  * `TIP20.sol`: The primary token contract, implementing ERC-20 plus policy checks, mint/burn, pausing, and meta-transaction support.  
  * `TIP20Factory.sol`: A minimal deployment utility for creating new TIP20 instances.  
  * `TIP20RolesAuth.sol`: A role-based access control (RBAC) module used by TIP20.  
* `TIP-4217` Currency Metadata Interface: Provides a currency metadata interface to standardize representations of all stablecoins pegged to the same underlying currency. Currently, the main use-case is to standardize the decimal precision across stablecoins by currency.   
* `TIP-403` Policy Registry Interface: Provides an interface to register policies, such as access lists, that can be inherited/ shared e.g., across `TIP-20` tokens. Currently the main-use case is for multiple `TIP-20` instances to share common access lists which can be maintained by a dedicated provider. 

## 

# TIP-20 Contract Suite

This suite consists of 3 contracts, the main contract, a factory contract, and a role-based access control contract. 

## TIP20.sol (Main Contract)

`TIP20.sol` is the main contract implementing the fungible token logic with compliance gating and extended features.

### Functions

* Standard ERC-20 Implementation: The following functions have identical behavior to the ERC-20 standard.  
  * `balanceOf(address account)`  
  * `transfer(address to, uint256 amount)`  
  * `approve(address spender, uint256 amount)`  
  * `allowance(address owner, address spender)`  
  * `transferFrom(address from, address to, uint256 amount): Note` The TIP1559\_PRECOMPILE address (0x1559c...) is exempt from the allowance check and can transfer tokens from any account without prior approval.  
* Policy Enforcement  
  * All transfers require sender and recipient authorization from the TIP403Registry via `isAuthorized(policyId, account)`.  
  * The active Policy ID is stored in transferPolicyId and is updatable by an admin via change`TransferPolicyId(uint64 newPolicyId)`.  
  * Unauthorized transfers revert with a `PolicyForbids()` error.  
* Dynamic Decimal Handling  
  * `decimals():` Queries the TIP4217Registry to retrieve the correct number of decimals for the specified currency.  
  * The constructor verifies that the currency is valid; otherwise will revert.  
* Administrative Controls  
  * `pause() / unpause():` Controlled by PAUSE\_ROLE / UNPAUSE\_ROLE.  
  * `mint(address to, uint256 amount)`: Controlled by ISSUER\_ROLE.  
  * `burn(uint256 amount)`: Controlled by ISSUER\_ROLE.  
  * `burnBlocked(address from, uint256 amount)`: Controlled by BURN\_BLOCKED\_ROLE, allows for burning tokens from addresses that are blocked by the current transfer policy.  
  * `setSupplyCap(uint256 newSupplyCap)`: Controlled by DEFAULT\_ADMIN\_ROLE.  
* Extensions  
  * `transferWithMemo(address to, uint256 amount, bytes32 memo)`: Behaves like a standard transfer but also emits a TransferWithMemo event containing 32-byte memo.  
  * `transferFromWithMemo(address from, address to, uint256 amount, bytes32 memo):` Analogously a standard transferFrom but also emits a TransferWithMemo event containing 32-byte memo.
  * `mintWithMemo(address to, unit256 amount, bytes32 memo)`: Standard mint but also emits a MintWithMemo event.
  * `burnWithMemo(uint256 amount)`: Standard burn but also emits a BurnWithMemo event.    
  * Includes a notTokenAddress modifier that restricts transfers to certain reserved precompile address ranges.

### Events

* `Transfer(address indexed from, address indexed to, uint256 amount)`  
* `Approval(address indexed owner, address indexed spender, uint256 amount)`  
* `TransferPolicyUpdate(address indexed updater, uint64 indexed newPolicyId)`  
* `Mint(address indexed to, uint256 amount)`  
* `Burn(address indexed from, uint256 amount)`  
* `BurnBlocked(address indexed from, uint256 amount)`  
* `TransferWithMemo(address indexed from, address indexed to, uint256 amount, bytes32 indexed memo)`
* `MintWithMemo (address indexed to, uint256 amount, bytes32 indexed memo)`
* `BurnWithMemo (address indexed from, uint256 amount, bytes32 indexted memo)`
* `SupplyCapUpdate(address indexed updater, uint256 indexed newSupplyCap)`  
* `PauseStateUpdate(address indexed updater, bool isPaused)`

### State Variables

* `string public name, symbol, currency`  
* `uint256 public totalSupply`  
* `mapping(address => uint256) public balanceOf`  
* `mapping(address => mapping(address => uint256)) public allowance`  
* `mapping(address => uint256) public nonces`  
* `mapping(address => mapping(bytes4 => bool)) public salts`  
* `bool public paused`  
* `uint256 public supplyCap`  
* `uint64 public transferPolicyId`  
* `bytes32 public immutable DOMAIN_SEPARATOR`

## TIP20Factory.sol (Deployment Factory)

Provides a simple interface to deploy new TIP20 tokens.

* Maintains `tokenIdCounter` for tracking the number of created tokens.  
* `createToken(string memory name, string memory symbol, string memory currency, address admin)`:  
  * Deploys a new TIP20 contract to a deterministic address derived from the tokenIdCounter.  
  * Passes in the specified parameters to the new token's constructor.  
  * Grants the DEFAULT\_ADMIN\_ROLE to the specified admin address.  
* Post-deployment, all other roles must be configured manually.  
* Events: This contract does not emit any events.

## TIP20RolesAuth.sol (Role Based Access Control)

Implements a compact, gas-efficient role control system.

* Roles are stored as `mapping(bytes32 => mapping(address => bool))`.  
* Each role's admin role is stored in `roleAdmin`.  
* DEFAULT\_ADMIN\_ROLE is the default admin for any role that does not have an admin explicitly set.  
* `grantRole(bytes32 role, address account)` and `revokeRole(bytes32 role, address account)` require the caller to have the role’s designated admin role.  
* `renounceRole(bytes32 role)` allows a caller to remove a role from themselves.  
* `setRoleAdmin(bytes32 role, bytes32 adminRole)` changes a role's admin role.  
* Includes an UNGRANTABLE\_ROLE which can never be granted, as it is its own admin. This is a security feature to prevent critical permissions from being assigned.

### Events

* `RoleMembershipUpdated(bytes32 indexed role, address indexed account, address indexed sender, bool hasRole)`  
* `RoleAdminUpdated(bytes32 indexed role, bytes32 indexed newAdminRole, address indexed sender)`

## 

# TIP-4217: Currency Metadata Interface

The `TIP4217Registry.sol` contract provides a standardized way to retrieve decimal precision for ISO 4217-style currency codes. For example, TIP-20 uses this for consistent currency formatting when a stablecoin issuer registers the token as representing a specific currency. 

* `getCurrencyDecimals(string calldata currency)`: Returns the decimals for the given currency. If the return value is 0, TIP20 token deployments will revert.  
* Events: This contract is an interface and does not emit any events.

## 

# TIP-403: Policy Registry Interface

Defines and manages policies. A policy maintains either a list of addresses that are either allowed or blocked, as well as an `admin` address that is authorized to modify that list. These lists can then be adopted by other contracts to control permissions (such as who can transfer tokens). 

## Special Policies 

The registry has two hardcoded, special-purpose policies:

* Policy ID 1: The "always-allow" policy. isAuthorized will always return true. A new TIP20 token uses this policy by default.  
* Policy ID 0: The "always-reject" policy. isAuthorized will always return false.

## Functions

* `isAuthorized(uint64 policyId, address user)`: Returns true if an account is allowed under the given policy.  
* `createPolicy(address admin, PolicyType policyType)`: Creates a new policy and returns its policyId. It can be configured with an admin policy for future changes. To create a "self-owned" policy that can be managed by its own members, pass type(uint64).max as the adminPolicyId. This is only allowed for whitelist policies.  
* `setPolicyAdmin(uint64 policyId, address admin)`: Updates the `admin` address for a given policy.  
* `modifyPolicyWhitelist(uint64 policyId, address account, bool allowed)` and  `modifyPolicyBlacklist(uint64 policyId, address account, bool restricted)`: Adds or removes addresses from a whitelist or blacklist policy, respectively.

## Events

* `PolicyAdminUpdated(uint64 indexed policyId, address indexed updater, address indexed admin)`  
* `PolicyCreated(uint64 indexed policyId, address indexed updater, PolicyType policyType)`  
* `WhitelistUpdated(uint64 indexed policyId, address indexed updater, address indexed account, bool allowed)`  
* `BlacklistUpdated(uint64 indexed policyId, address indexed updater, address indexed account, bool restricted)`

# 

# Tutorial

## Deploying a New Token and Setting Up Roles

This workflow describes how a project administrator can create a new token and delegate minting capabilities to another operator address.

* Actors:  
  1. Project Admin: The primary administrator account.  
  2. Token Operator: An account designated to handle minting.  
* Steps:  
  1. Deploy Token: The Project Admin calls `createToken()` on the `TIP20Factory` contract, providing the token's name, symbol, currency, and their own address as the initial admin. This creates a new `TIP20` token instance.  
  2. Grant Issuer Role: The Project Admin, who holds the `DEFAULT_ADMIN_ROLE`, calls `grantRole()` on the new `TIP20` token contract. They grant the `ISSUER_ROLE` to the Token Operator's address.  
  3. Mint Tokens: The Token Operator can now call `mint()` on the `TIP20` token to issue new tokens to any address.

## Creating and Applying a Whitelist Policy

This workflow shows how to restrict token transfers to a list of approved users.

* Actors:  
  1.  Admin: An account responsible for managing approval policies.  
  2. User A & User B: End-users who have completed the KYC process.  
  3. User C: An end-user who has not completed the KYC process.  
* Steps:  
  1. Create Whitelist Policy: The Admin calls `createPolicy()` on the `TIP403Registry`, specifying the policy type as `WHITELIST` and setting their own address as the admin (or an admin policy they control). This returns a new `policyId`.  
  2. Add Users to Whitelist: The Admin calls `modifyPolicyWhitelist()` on the `TIP403Registry` for the newly created `policyId`, adding the addresses of User A and User B to the whitelist by setting their status to `true`.  
  3. Apply Policy to Token: The token's `DEFAULT_ADMIN_ROLE` holder calls `changeTransferPolicyId()` on the `TIP20` token contract, setting the `transferPolicyId` to the new whitelist `policyId`.  
  4. Test Transfers:  
     * User A can successfully transfer tokens to User B because both are on the whitelist.  
     * If User A attempts to transfer tokens to User C, the transaction will fail because User C is not on the whitelist.

