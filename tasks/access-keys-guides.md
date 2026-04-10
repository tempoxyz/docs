# Use Access Keys — Guide Structure

New sidebar section under **Build on Tempo** called **"Use Access Keys"**.

## Sidebar Structure

```
Build on Tempo
├── ...existing items...
├── Use Access Keys          ← NEW section (after "Make Payments" or "Issue Stablecoins")
│   ├── Overview             → /guide/access-keys
│   ├── Send a payment       → /guide/access-keys/send-a-payment        ← START HERE
│   ├── Set up subscriptions → /guide/access-keys/subscriptions
│   └── Revoke access keys         → /guide/access-keys/revoke-a-key           (future)
├── ...existing items...
```

## File Structure

```
src/pages/guide/access-keys/
├── index.mdx                  # Overview — what access keys are, when to use them
├── send-a-payment.mdx         # Send a payment using an access key
└── subscriptions.mdx          # Set up recurring subscriptions via access keys
```

## Page: Overview (`index.mdx`)

Brief intro page covering:
- What access keys are (secondary signing keys provisioned by a root key)
- Why use them (avoid repeated passkey prompts, delegate to agents/scripts, scoped spending limits)
- Link to protocol spec (AccountKeychain)
- Cards linking to each guide

## Page: Send a Payment (`send-a-payment.mdx`)

Mirrors the structure of `/guide/payments/send-a-payment` but centered around access keys.

### Outline

1. **Intro** — "Send a stablecoin payment using an access key. Access keys let you sign transactions without repeated passkey prompts, with optional spending limits."

2. **Steps**
   1. **Set up Wagmi & integrate accounts** — link to existing embed passkeys/connect wallets guides
   2. **Authorize an access key** — show how to authorize an access key on connect (via `authorizeAccessKey` param on connector) or programmatically via `wallet_authorizeAccessKey`
      - **Wagmi examples should show two variants side-by-side (Tabs):**
        - **Tempo Wallet** — using `tempoWallet()` connector with `authorizeAccessKey`
        - **Domain-bound WebAuthn** — using `webAuthn()` connector with `authorizeAccessKey`
   3. **Add testnet funds** — same as existing (faucet)
   4. **Send a payment with the access key** — show `useTransferSync` (transactions auto-sign with the access key, no passkey prompt)
   5. **Display receipt** — same pattern as existing

3. **Recipes** (Tabs: Viem / Wagmi (Tempo Wallet) / Wagmi (WebAuthn) / Rust / Cast / Solidity)
   - **Authorize an access key** — code to provision a key with expiry + spending limits
   - **Send a transfer with an access key** — code showing the key_authorization field
   - **Check remaining spending limit** — read from AccountKeychain precompile

4. **Best practices**
   - Set appropriate expiry times
   - Use spending limits to scope access
   - Revoke keys when no longer needed
   - Store access keys securely

5. **Next steps**
   - Revoke access keys → (future guide)
   - Learn about [Account Keychain](/protocol/transactions/AccountKeychain)

## Page: Set Up Subscriptions (`subscriptions.mdx`)

Subscriptions use access keys as the primitive — a user authorizes an access key with a spending limit and expiry, and the merchant/service pulls payments periodically using that key.

### Outline

1. **Intro** — "Set up recurring stablecoin subscriptions on Tempo. Access keys with spending limits let users authorize merchants to pull payments on a schedule — no smart contract escrow needed."

2. **How it works**
   - User authorizes an access key for the merchant with a periodic spending limit (e.g. 10 USDC/month)
   - Merchant stores the access key and pulls payments on their schedule
   - User can revoke the key at any time to cancel
   - Spending limits prevent overcharging

3. **Steps**
   1. **Set up accounts** — link to existing guides
   2. **User: Authorize a subscription key** — authorize an access key for the merchant's address with spending limits matching the subscription amount + expiry
      - **Wagmi examples should show two variants (Tabs):**
        - **Tempo Wallet** — using `tempoWallet()` connector with `authorizeAccessKey`
        - **Domain-bound WebAuthn** — using `webAuthn()` connector with `authorizeAccessKey`
   3. **Merchant: Pull a payment** — use the access key to sign a transfer on behalf of the user
   4. **User: Cancel the subscription** — revoke the access key

4. **Recipes** (Tabs: Viem / Wagmi (Tempo Wallet) / Wagmi (WebAuthn) / Rust / etc.)
   - **Authorize a subscription key with monthly limit**
   - **Pull a subscription payment (merchant-side)**
   - **Check remaining subscription allowance**
   - **Revoke/cancel subscription**

5. **Best practices**
   - Set spending limits to match subscription amount (prevent overcharging)
   - Use expiry for fixed-term subscriptions
   - Provide users a clear way to revoke (cancel)
   - Emit events / memos for reconciliation

6. **Next steps**
   - Send a payment → /guide/access-keys/send-a-payment
   - Account Keychain spec → /protocol/transactions/AccountKeychain

## vocs.config.ts Changes

Add new sidebar item after "Make Payments":

```ts
{
  text: 'Use Access Keys',
  collapsed: true,
  items: [
    { text: 'Overview', link: '/guide/access-keys' },
    { text: 'Send a payment', link: '/guide/access-keys/send-a-payment' },
    { text: 'Set up subscriptions', link: '/guide/access-keys/subscriptions' },
  ],
},
```

## Phases

### Phase 1: Scaffold & Overview ✅
- [x] Draft structure (this file)
- [x] Create `src/pages/guide/access-keys/` directory
- [x] Create `src/pages/guide/access-keys/index.mdx` (overview page)
- [x] Add sidebar entry in `vocs.config.ts` (all items, link future ones)
- [x] Verify with `pnpm run check`

### Phase 2: Send a Payment guide ✅
- [x] Create `src/pages/guide/access-keys/send-a-payment.mdx`
  - [x] Intro + steps section (set up, authorize key, add funds, send, receipt)
  - [x] Wagmi tabs: Tempo Wallet + WebAuthn variants
  - [x] Recipes section (Viem / Wagmi (Tempo Wallet) / Wagmi (WebAuthn) / Rust / Cast)
  - [x] Best practices + next steps
- [x] Verify with `pnpm run check`

### Phase 3: Subscriptions guide
- [ ] Create `src/pages/guide/access-keys/subscriptions.mdx`
  - [ ] Intro + "How it works" section
  - [ ] Steps (authorize subscription key, pull payment, cancel)
  - [ ] Wagmi tabs: Tempo Wallet + WebAuthn variants
  - [ ] Recipes section (authorize, pull, check allowance, revoke)
  - [ ] Best practices + next steps
- [ ] Verify with `pnpm run dev` and `pnpm run check`

### Phase 4: Polish & cross-link
- [ ] Cross-link from existing guides (payments, tempo-transaction, machine-payments)
- [ ] Add links from AccountKeychain protocol page to new guides
- [ ] Final `pnpm run check` for dead links
