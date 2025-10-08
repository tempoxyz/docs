# Token Preferences

## Abstract

This spec lays out how the default fee token for a transaction is determined.

## Motivation

On Tempo, users can pay gas fees in any stablecoin, as long as that stablecoin has sufficient liquidity on the enshrined fee AMM. 

In determining *which* token a user pays fees in, we want to maximize customizability (so that wallets or users can implement more sophisticated UX than is possible at the protocol layer), minimize surprise (particularly surprises in which a user pays fees in a stablecoin they did not expect to), and have sane default behavior so that users can begin using basic functions like payments even using wallets that are not customized for Tempo support.

We also want to limit the complexity of block building, in order to minimize denial-of-service attacks. The rules in this spec ensure that the fee token of every transaction in a block can be statically determined from the state at the top of the block and the contents of those transactions, without having to execute any transactions.

Note that as discussed in the [Tempo transactions](/protocol/specs/TempoTransaction) spec, the "user" who chooses the fee token for a transaction is the `fee_payer` of that transaction--either the `tx.origin` for normal transactions, or the signer of the `fee_payer_signature` for sponsored transactions.

## Order of preference

There are four sources of token preference, with this order of precedence:

1. Transaction (set by the `fee_token` field of the transaction)
2. Account (set on the FeeManager contract by the `fee_payer` of the transaction, who could be either the `tx.origin` address or the provider of the `fee_payer_signature` on the transaction)
3. Contract (predefined based on the `to` of the transaction)
4. Validator (set by `block.coinbase`)

The protocol checks preferences at each of these levels, stopping at the first one at which a preference is specified. At that level, the protocol performs the following checks. If any of the checks fail, the transaction is invalid (without looking at any further levels):

* The token must be a TIP-20 token whose currency is USD.
* The user must have sufficient balance in that token to pay the `gasLimit` on the transaction.
* There must be sufficient liquidity on the [fee AMM](#fee-amm) to support the transaction.

## Transaction level

A transaction can specify a fee token. This overrides any preference at the account, contract, or validator level.

This requires a new 2718 transaction type: [Tempo transactions](/protocol/specs/TempoTransaction). To allow transactions that include EIP-7702 authorizations to also specify a fee token preference, the functionality supported by these transactions is a superset of set code transactions. 

This transaction type adds a `fee_token` field as well as a `fee_payer_signature` field. Transactions can use either or both of these features.

If the `fee_payer_signature` field is set, the transaction is a *sponsored transaction*. This means another address can be specified as the `fee_payer` on the transaction, meaning that it both chooses the fee token and pays for the transaction. If no `fee_payer_signature` is provided, then the `tx.origin` is the `fee_payer`.

The `fee_token` declares which token should be used for fees on the transactions. For sponsored transactions, the `tx.origin` address does not sign over the `fee_token` field (allowing the `fee_payer` to choose the fee token).

The full details of Tempo transactions are described in greater depth in the [Tempo transactions](/protocol/specs/TempoTransaction) spec.

## Account level

An account can specify a fee token preference for transactions for which it is the `fee_payer` (including both transactions it sponsors as well as non-sponsored transactions for which it is the `tx.origin`). This overrides any preference set at the contract or validator level.

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