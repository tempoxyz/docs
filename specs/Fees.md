# Fees

## Abstract

This spec lays out how fees work on Tempo, including how fees are calculated and how the default fee token for a transaction is determined.

## Motivation

On Tempo, users can pay gas fees in any stablecoin, as long as that stablecoin has sufficient liquidity on the enshrined fee AMM.

In determining *which* token a user pays fees in, we want to maximize customizability (so that wallets or users can implement more sophisticated UX than is possible at the protocol layer), minimize surprise (particularly surprises in which a user pays fees in a stablecoin they did not expect to), and have sane default behavior so that users can begin using basic functions like payments even using wallets that are not customized for Tempo support.

Note that as discussed in the [Fee Token transactions](/protocol/specs/FeeTokenTransaction) spec, the "user" who chooses the fee token for a transaction is the `fee_payer` of that transaction--either the `tx.origin` for normal transactions, or the signer of the `fee_payer_signature` for sponsored transactions.

## Fee Unit Specification

Fees in the `max_base_fee_per_gas` and `max_fee_per_gas` fields of transactions, as well as in block `base_fee_per_gas` field, are specified in units of **USD per 10^18 gas**. Since TIP-20 tokens have 6 decimal places, that means the fee for a transaction can be calculated as `ceil(base_fee * gas_used / 10^12)`.

This unit is chosen to provide sufficient precision for low-fee transactions. Since TIP-20 tokens have only 6 decimal places (as opposed to the 18 decimal places of ETH), expressing fees directly in tokens per gas would not provide enough precision for transactions with very low gas costs. By scaling the fee paid by 10^-12, the protocol ensures that even small fee amounts can be accurately represented and calculated.

## Order of preference

There are four sources of token preference, with this order of precedence:

1. Transaction (set by the `fee_token` field of the transaction)
2. Account (set on the FeeManager contract by the `fee_payer` of the transaction, who could be either the `tx.origin` address or the provider of the `fee_payer_signature` on the transaction)
3. TIP-20 contract (if transaction is calling any function on a TIP-20 contract, the transaction uses that token as its fee token)
4. Validator (set by `block.coinbase`)

The protocol checks preferences at each of these levels, stopping at the first one at which a preference is specified. At that level, the protocol performs the following checks. If any of the checks fail, the transaction is invalid (without looking at any further levels):

* The token must be a TIP-20 token whose currency is USD.
* The token must not be linkingUSD. (While validators can accept fees in linkingUSD, users cannot pay fees in linkingUSD.)
* The user must have sufficient balance in that token to pay the `gasLimit` on the transaction.
* There must be sufficient liquidity on the [fee AMM](#fee-amm) to support the transaction.

## Transaction level

A transaction can specify a fee token. This overrides any preference at the account, contract, or validator level.

This requires a new 2718 transaction type: [Fee Token transactions](/protocol/specs/FeeTokenTransaction). To allow transactions that include EIP-7702 authorizations to also specify a fee token preference, the functionality supported by these transactions is a superset of set code transactions. 

This transaction type adds a `fee_token` field as well as a `fee_payer_signature` field. Transactions can use either or both of these features.

If the `fee_payer_signature` field is set, the transaction is a *sponsored transaction*. This means another address can be specified as the `fee_payer` on the transaction, meaning that it both chooses the fee token and pays for the transaction. If no `fee_payer_signature` is provided, then the `tx.origin` is the `fee_payer`.

The `fee_token` declares which token should be used for fees on the transactions. For sponsored transactions, the `tx.origin` address does not sign over the `fee_token` field (allowing the `fee_payer` to choose the fee token).

The transaction is invalid if `fee_token` is linkingUSD.

The full details of Fee Token transactions are described in greater depth in the [Fee Token transactions](/protocol/specs/FeeTokenTransaction) spec.

## Account level

An account can specify a fee token preference for transactions for which it is the `fee_payer` (including both transactions it sponsors as well as non-sponsored transactions for which it is the `tx.origin`). This overrides any preference set at the contract or validator level.

To set its preference, the account can call the `setUserToken` function on the FeeManager precompile. This call reverts if the user specifies linkingUSD as their fee token.

In a transaction in which the user is calling `setUserToken` on the FeeManager, the newly specified token is used as the fee token (unless the transaction specifies a `fee_token` at the [transaction level](#transaction-level)).

## TIP-20 contracts

If a transaction is a top-level call to a TIP-20 contract for which the currency is USD, that token is used as the user's fee token for that transaction (unless there is a preference specified at the [transaction](#transaction-level) or [account](#account-level) level).

## Validator level

If neither the transaction, the account, or the contract have specified a fee preference, then the fee token for this transaction is the validator's preferred token.

Validators can set their fee preference by calling `setValidatorToken` on the FeeManager contract. This function cannot be called during a block built by that validator.

If the user does not have sufficient balance in the validator's preferred token to pay the gas limit of the transaction, the transaction is invalid.

If the validator's preferred token is linkingUSD, and the check reaches this point, the transaction is invalid, since users cannot pay fees in linkingUSD.

