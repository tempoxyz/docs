# Token Preferences

## Abstract

This spec lays out how the default fee token for a transaction is determined.

## Motivation

On Tempo, users can pay gas fees in any stablecoin, as long as that stablecoin has sufficient liquidity on the enshrined fee AMM. 

In determining *which* token a user pays fees in, we want to maximize customizability (so that wallets or users can implement more sophisticated UX than is possible at the protocol layer), minimize surprise (particularly surprises in which a user pays fees in a stablecoin they did not expect to), and have sane default behavior so that users can begin using basic functions like payments even using wallets that are not customized for Tempo support.

We also want to limit the complexity of block building, in order to minimize denial-of-service attacks. The rules in this spec ensure that the fee token of every transaction in a block can be statically determined from the state at the top of the block and the contents of those transactions, without having to execute any transactions.

## Order of preference

There are four sources of token preference, with this order of precedence:

1. Transaction (set by the `fee_token` field of the transaction)
2. Account (set on the FeeManager contract by the `tx.origin` of the transaction)
3. Contract (set on the FeeManager contract by the `to` of the transaction)
4. Validator (set by `block.coinbase`)

The protocol checks preferences at each of these levels, stopping at the first one at which a preference is specified. At that level, the protocol performs the following checks. If any of the checks fail, the transaction is invalid (without looking at any further levels):

* The token must be a TIP-20 token whose currency is USD.
* The user must have sufficient balance in that token to pay the `gasLimit` on the transaction.
* There must be sufficient liquidity on the [fee AMM](#fee-amm) to support the transaction.

## Transaction level

A transaction can specify a fee token. This overrides any preference at the account, contract, or validator level.

This requires a new 2718 transaction type: "fee token transactions." To allow transactions that include EIP-7702 authorizations to also specify a fee token preference, the functionality supported by fee token transactions is a superset of set code transactions. 

This transaction type is similar to a 7702 “set-code style” transaction—dynamic-fee envelope, access list, and `authorization_list`—but adds a `fee_token` field. The `fee_token` declares which token the sender wishes to use to pay fees. It uses the type byte `0x06` (skipping type `0x05` to avoid any risk of collision with the magic byte used for EIP-7702 authorization signatures).

To allow fee token transactions to also deploy contracts at the top level (which is not supported in set code transactions), fee token transsactions are allowed to have `to` set to `nil`, as long as `authorization_list` is empty.

## Specification

### Transaction type and encoding
- **Type byte:** `0x06`.
- **Envelope:** `0x06 || RLP([payload, y_parity, r, s])`.
- **Signing hash:** `keccak256( 0x06 || RLP(payload) )`.

### `payload` (RLP list, fields in order)
1. `chain_id: uint256`  
2. `nonce: uint256`
3. `fee_token: address?` — **may be nil**  to set no preference
4. `max_priority_fee_per_gas: uint256`  
5. `max_fee_per_gas: uint256`  
6. `gas_limit: uint256`  
7. `to: address?` — **may be nil only if `authorization_list` is empty** (see “Creation rule”).  
8. `value: uint256`  
9. `data: bytes`  
10. `access_list: [ [address, [storageKey…]] ]` (exactly as in EIP-2930)  
11. `authorization_list: […]` (exact tuple format and semantics **exactly as in EIP-7702**, with the exception that it may be empty)

`y_parity: uint8, r: uint256, s: uint256` are as in other typed transactions.

## Semantics
- **Access lists.** Identical to EIP-2930.
- **Authorizations.** `authorization_list` semantics (delegation indicator, installation/teardown, signature domain, intrinsic-gas surcharges) are **identical to EIP-7702**, except that `authorization_list` may be empty.  
- **No blobs.** This type carries no blob fields.  
- **Creation rule.**  
  - If `authorization_list` is **non-empty** → `to` **MUST NOT** be nil (no top-level creation).  
  - If `authorization_list` is **empty** → `to` **MAY** be nil (top-level contract creation behaves as in standard 1559/2718 txs).  
- **Execution.** Apart from the rules above, validity, execution, nonce handling, and state changes are the same as for 7702 when authorizations are present, and the same as for type-2 when `authorization_list` is empty.

## Intrinsic gas and pricing
- Base intrinsic gas, access-list costs, and **per-authorization surcharge** are identical to EIP-7702.  
- When `authorization_list` is empty, there is no authorization surcharge (equivalent to type-2).  

## Account level

An account can specify a fee token preference for transactions for which it is the `tx.origin`. This overrides any preference set at the contract or validator level.

To set its preference, the account can call the `setUserToken` function on the FeeManager precompile.

This method can only be called directly by the user, not through account abstraction.

## Contract level

Certain precompiled contracts specify a fee token preference for transactions for which they are the `to` field. This is overriden by any preferences set at the transaction or account levels, but overrides the validator's fee preference.

* For TIP-20 contracts for which the currency is USD, their fee preference is the token itself. Other TIP-20 contracts have no fee preference.
* For top-level calls directly to the `setUserToken` function on the FeeManager precompile, the `token` argument to that function is interpreted as the contract's fee token preference for purposes of that transaction.

## Validator level

If neither the transaction, the account, or the contract have specified a fee preference, then the fee token for this transaction is the validator's preferred token.

Validators can set their fee preference by calling `setValidatorToken` on the FeeManager contract. This function cannot be called during a block built by that validator.

If the user does not have sufficient balance in the validator's preferred token to pay the gas limit of the transaction, the transaction is invalid.