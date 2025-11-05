## Fee Token Transactions (Type 0x77)

### Abstract

This introduces a new 2718 transaction type, `0x77`, which extends EIP-1559/EIP-7702 semantics. Tempo users can (a) optionally name a preferred fee token, which overrides any fee token preference specified at the account, contract, or validator level, and (b) optionally delegate fee payment to a third-party payer via an additional signature. The format preserves access-list and authorization capabilities, supports contract creation, and keeps compatibility with Tempo’s token-preference resolution rules.

### Motivation
- Allow wallets to override global/account defaults by declaring a fee token directly in the transaction.
- Support sponsored fee payments without account-abstraction indirection.
- Preserve 7702 features (authorization lists, delegate code) in the same envelope, keeping smart-wallet use cases.
- Maintain deterministic fee-token selection and validation for block builders, ensuring the `fee_token` and recovered `fee_payer` are known statically from the transaction body plus state at block start.

### Transaction Type Overview
- **Type byte:** `0x77`
- **EIP-2718 envelope:** `0x77 || RLP([payload_fields…, y_parity, r, s])` (where `y_parity`, `r`, and `s` are from sender signature)
- **Sender signing hash:** `keccak256(0x77 || RLP(payload_fields with field 12 = 0x00 if fee_payer is present or 0x80 if fee_payer is absent, and with fee_token as 0x80 if fee_payer is present))`
- **Feepayer signing hash:** `keccak256(0x78 || RLP(payload_fields with field 12 = sender_address))`
- **Upgrade scope:** Superset of EIP-1559 + EIP-7702 (dynamic fee, access list, authorization list) with two Tempo extensions: `fee_token` field and `fee_payer_signature`.

### Payload Fields (RLP list in order)
1. `chain_id: uint256`
2. `nonce: uint256`
3. `max_priority_fee_per_gas: uint256`
4. `max_fee_per_gas: uint256`
5. `gas_limit: uint256`
6. `to: address?` — empty string only permitted when `authorization_list` is empty (“creation rule”).
7. `value: uint256`
8. `input: bytes` - calldata or constructor bytecode.
9. `access_list: [ [address, [storageKey…]] ]` per EIP-2930.
10. `authorization_list: [SignedAuthorization…]` per EIP-7702 (each item encodes `(chain_id, address, nonce, code_hash, version, yParity, r, s)` exactly as upstream).
11. `fee_token: address?` — 20-byte address when set; empty string (`0x80`, in RLP) when absent.
12. `fee_payer_signature: (y_parity, r, s)?`  — signature when set; empty string (`0x80`) when absent.

After these fields, the typed-transaction envelope appends the sender’s `(y_parity, r, s)` scalars in the standard way.

### Signing Domains

#### Sender signature

For purposes of computing the transaction hash for the sender's signature:

* The fields are preceded by the transaction type `0x77`.
* Field 12 (`fee_payer_signature`) is encoded as a single byte indicating presence (`0x00`) or absence (`0x80`) of a fee payer signature; actual `(v,r,s)` bytes can be appended later without invalidating the sender signature.
* If `fee_payer_signature` is present, Field 3 (`fee_token`) is encoded as an empty string (`0x80`) regardless of whether a fee token is present in the transaction. This allows the fee payer to use that field to specify their own fee token.

#### Fee payer signature

Only included for sponsored transactions. For purposes of computing the transaction hash for the fee payer's signature:

* The fields are preceded by a magic byte `0x78`.
* Field 12 is serialized as the *sender address*. This allows the fee payer to commit to the sender's address.

### Validation Rules
- **Signature requirements**
  - Sender signature must be valid for the transaction per standard secp256k1 recovery.
  - If `fee_payer_signature` present → recovery of fee payer address MUST succeed; otherwise the transaction is invalid.
  - If `fee_payer_signature` absent → fee payer defaults to the sender address.
- **Creation rule:** If `authorization_list` is non-empty, `to` MUST be a call target (no top-level creation). If `authorization_list` is empty, `to` MAY be empty for contract creation.
- **Authorization semantics:** Identical to EIP-7702 (installation/teardown, gas surcharge, domain separation). Empty list is allowed (behaves like type-2).
- **Access list semantics:** Identical to EIP-2930.
- **Blobs:** Not supported.
- **Token preference check:** When `fee_token` is `Some(address)` the transaction layer uses that address as the user’s preferred token. Validation ensures it is a USD TIP-20 token with sufficient balance/liquidity; failures reject the transaction before execution (see [Token Preferences](/protocol/specs/Fees) spec).
- **Fee payer resolution:** Execution environments and mempool validators derive the fee payer as:
  - Fee payer signature present → recovered address.
  - Otherwise → sender address.
  This address is used for all fee accounting (pre-charge, refund) with the TIP Fee Manager precompile.
- **Intrinsic gas:** Same base costs as EIP-7702; authorization surcharge applies only when the list is non-empty.
- **Replay protection:** `chain_id` MUST match the network; transactions replayed onto other chains fail.

### Execution Semantics
1. Recover `sender` (as [described above](#sender-signature)).
2. If `fee_payer_signature` is present, then recover `fee_payer` (as [described above](#fee-payer-signature)).
3. Determine effective fee token via token-preference precedence (as discussed in the [Token Preferences](/protocol/specs/Fees) spec).
4. TIP Fee Manager precompile charges fees from the resolved fee payer’s balance in the selected token; refunds also go to the fee payer.
5. Nonce handling, gas accounting, access-list warmups, authorization installations, and execution all mirror existing 1559/7702 behavior under the Tempo EVM handler.

### Error Cases (Non-exhaustive)
- `fee_payer_signature` present but unrecoverable → invalid transaction.
- `authorization_list` non-empty with `to = nil` → invalid.
- Fee payer balance in fee token insufficient for `gas_limit * max_fee_per_gas` → invalid.
- Any sender signature failure or malformed RLP → invalid.
