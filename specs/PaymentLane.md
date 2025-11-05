
# Payment lane

## Abstract

Introduces a second consensus gas constraint for **non-payment** transactions. A new field-`generalGasLimit`-is added to the header. Transactions are classified as either payments or non-payments based solely on their transaction data, without requiring any access to blockchain state. For a block to be valid, total `gasUsed` must be less than the `gasLimit` **and** the gas used by non-payment transactions must be less than `generalGasLimit`. 

---

## Motivation

Preserve throughput and predictable inclusion for simple payments under heavy non-payment demand without changing the fee market or canonical header fields.

---

## Terminology

- **Payment transaction:** Determined by a versioned, pure classifier `isPaymentTx(tx) -> bool`.  
- **Non-payment transaction:** `!isPaymentTx(tx)`.  

---

## Specification

### 1. Transaction classification (pure, versioned)

A chain-config constant `ClassifierID` selects the active rule set.

- **Classifier v1:** `isPaymentTx(tx) == true` if `tx.to` has the reserved 14-byte prefix `0x20c000000…` corresponding to TIP20 factory-deployed token contracts OR, for AA transactions, if every item in `tx.calls` is a CALL to an address that has the reserved 14-byte prefix `0x20c000000…`.
  _Note:_ Only the **outer** transaction envelope is considered; internal calls and state are ignored. Later forks may change the classifier by bumping `ClassifierID`.


### 2. Custom Block header fields 

Adds a new limit, `generalGasLimit` as a custom field in the header. The total amount of gas by non-payment transactions in the block must be smaller than `generalGasLimit`. 

> Consensus fields unchanged: `gasLimit`, `gasUsed`, `baseFeePerGas`, etc.

### 3. Lane ordering (consensus)

No specific lane ordering, general priority ordering can be used and is recommended. 

Any system transactions (such as the one required as part of the fee AMM) must be the last transaction in the block and no regular transaction can follow those.

### 4. Gas accounting & validity (consensus)

Validity of a block requires that 
```
gasUsed       >= Σ gasConsumed(txs[0..n])
generalGasLimit >= Σ gasConsumed(tx[i])   for all i such that !isPaymentTx(tx[i])
```

Where `gasConsumed` includes intrinsic gas and gas burned by reverts, as in the existing protocol.

### 5. Fee market

No changes to basefee or pricing rules. Payment txs pay the same basefee as non-payment txs. The additional meter only caps aggregate non-payment gas.

### 6. JSON-RPC surface (informative)

- `eth_getBlockBy*`: expose new field `generalGasUsed` from header.

---

## Rationale

- **Compatibility:** Adds new `generalGasUsed`; light clients and tooling remain largely unaffected.  
- **Determinism:** A pure, versioned classifier guarantees pre-execution agreement and makes verification possible without state.  
- **Simplicity:** Single fee market; a single additional cap.


---

## Test Vectors (sketch)

1. **All payments:**  valid iff `gasUsed ≤ gasLimit`.  
2. **All non-payments:**  valid iff `gasUsed ≤ generalGasLimit`.  
3. **Hearder missing `generalGasLimit` field/malformed:** invalid.  

---

