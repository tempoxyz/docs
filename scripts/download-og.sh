#!/bin/bash
# Download OG images for all docs routes

OUT="/Users/achal/Desktop/og-preview"
BASE="http://localhost:5173"
mkdir -p "$OUT"

download_og() {
  local title="$1"
  local section="$2"
  local subsection="$3"
  local filename="$4"

  local url="${BASE}/api/og?title=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$title'))")&section=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$section'))")"
  if [ -n "$subsection" ]; then
    url="${url}&subsection=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$subsection'))")"
  fi

  curl -s -o "${OUT}/${filename}.webp" "$url"
  echo "  Downloaded: ${filename}"
}

echo "=== Landing pages (static) ==="
curl -s -o "${OUT}/landing--home.png" "${BASE}/og-docs.png"
echo "  Downloaded: landing--home.png"

echo ""
echo "=== Top-level section pages (TEMPO + section) ==="
download_og "Getting Funds on Tempo" "BUILD" "" "build--getting-funds"
download_og "Create & Use Accounts" "BUILD" "" "build--use-accounts"
download_og "Make Payments" "BUILD" "" "build--payments"
download_og "Issue Stablecoins" "BUILD" "" "build--issuance"
download_og "Exchange Stablecoins" "BUILD" "" "build--stablecoin-dex"
download_og "Make Machine Payments" "BUILD" "" "build--machine-payments"
download_og "Use Tempo Transactions" "BUILD" "" "build--tempo-transaction"
download_og "Using Tempo with AI" "BUILD" "" "build--ai"

download_og "Overview" "INTEGRATE" "" "integrate--overview"
download_og "Connect to the Network" "INTEGRATE" "" "integrate--connection-details"
download_og "Get Testnet Faucet Funds" "INTEGRATE" "" "integrate--faucet"
download_og "EVM Differences" "INTEGRATE" "" "integrate--evm-compatibility"
download_og "Predeployed Contracts" "INTEGRATE" "" "integrate--predeployed-contracts"
download_og "Token List Registry" "INTEGRATE" "" "integrate--tokenlist"
download_og "Wallet Developers" "INTEGRATE" "" "integrate--wallet-developers"
download_og "Contract Verification" "INTEGRATE" "" "integrate--verify-contracts"

download_og "Overview" "PROTOCOL" "" "protocol--overview"
download_og "Blockspace" "PROTOCOL" "" "protocol--blockspace"
download_og "Fees" "PROTOCOL" "" "protocol--fees"
download_og "TIPs" "PROTOCOL" "" "protocol--tips"

download_og "Overview" "SDKs" "" "sdk--overview"
download_og "TypeScript" "SDKs" "" "sdk--typescript"
download_og "Go" "SDKs" "" "sdk--go"
download_og "Foundry" "SDKs" "" "sdk--foundry"
download_og "Python" "SDKs" "" "sdk--python"
download_og "Rust" "SDKs" "" "sdk--rust"

download_og "Overview" "CLI" "" "cli--overview"
download_og "Wallet" "CLI" "" "cli--wallet"
download_og "Request" "CLI" "" "cli--request"
download_og "Download" "CLI" "" "cli--download"
download_og "Node" "CLI" "" "cli--node"

download_og "Overview" "ECOSYSTEM" "" "ecosystem--overview"
download_og "Bridges & Exchanges" "ECOSYSTEM" "" "ecosystem--bridges"
download_og "Wallets" "ECOSYSTEM" "" "ecosystem--wallets"

download_og "Overview" "LEARN" "" "learn--overview"
download_og "Partners" "LEARN" "" "learn--partners"
download_og "Stablecoins" "LEARN" "" "learn--stablecoins"

echo ""
echo "=== Subsection pages (section + subsection) ==="
download_og "Embed Passkey Accounts" "BUILD" "ACCOUNTS" "build--accounts--embed-passkeys"
download_og "Connect to Wallets" "BUILD" "ACCOUNTS" "build--accounts--connect-to-wallets"
download_og "Add Funds to Your Balance" "BUILD" "ACCOUNTS" "build--accounts--add-funds"

download_og "Send a Payment" "BUILD" "PAYMENTS" "build--payments--send"
download_og "Accept a Payment" "BUILD" "PAYMENTS" "build--payments--accept"
download_og "Attach a Transfer Memo" "BUILD" "PAYMENTS" "build--payments--transfer-memos"
download_og "Pay Fees in Any Stablecoin" "BUILD" "PAYMENTS" "build--payments--pay-fees"
download_og "Sponsor User Fees" "BUILD" "PAYMENTS" "build--payments--sponsor-user-fees"
download_og "Send Parallel Transactions" "BUILD" "PAYMENTS" "build--payments--parallel"

download_og "Create a Stablecoin" "BUILD" "ISSUANCE" "build--issuance--create"
download_og "Mint Stablecoins" "BUILD" "ISSUANCE" "build--issuance--mint"
download_og "Use Your Stablecoin for Fees" "BUILD" "ISSUANCE" "build--issuance--use-for-fees"
download_og "Distribute Rewards" "BUILD" "ISSUANCE" "build--issuance--distribute-rewards"
download_og "Manage Your Stablecoin" "BUILD" "ISSUANCE" "build--issuance--manage"

download_og "Managing Fee Liquidity" "BUILD" "EXCHANGE" "build--exchange--fee-liquidity"
download_og "Executing Swaps" "BUILD" "EXCHANGE" "build--exchange--executing-swaps"
download_og "View the Orderbook" "BUILD" "EXCHANGE" "build--exchange--orderbook"
download_og "Providing Liquidity" "BUILD" "EXCHANGE" "build--exchange--providing-liquidity"

download_og "Client Quickstart" "BUILD" "MACHINE PAY" "build--machine-pay--client"
download_og "Agent Quickstart" "BUILD" "MACHINE PAY" "build--machine-pay--agent"
download_og "Server Quickstart" "BUILD" "MACHINE PAY" "build--machine-pay--server"
download_og "Accept One-Time Payments" "BUILD" "MACHINE PAY" "build--machine-pay--one-time"
download_og "Accept Pay-as-you-go Payments" "BUILD" "MACHINE PAY" "build--machine-pay--payg"
download_og "Accept Streamed Payments" "BUILD" "MACHINE PAY" "build--machine-pay--streamed"

download_og "Specification" "PROTOCOL" "TIP-20" "protocol--tip20--spec"
download_og "Overview" "PROTOCOL" "TIP-20" "protocol--tip20--overview"
download_og "Specification" "PROTOCOL" "TIP-20 REWARDS" "protocol--tip20-rewards--spec"
download_og "Specification" "PROTOCOL" "TIP-403" "protocol--tip403--spec"
download_og "Specification" "PROTOCOL" "FEES" "protocol--fees--spec"
download_og "Fee AMM" "PROTOCOL" "FEES" "protocol--fees--fee-amm"
download_og "Specification" "PROTOCOL" "TRANSACTIONS" "protocol--transactions--spec"
download_og "EIP-4337 Comparison" "PROTOCOL" "TRANSACTIONS" "protocol--transactions--eip4337"
download_og "EIP-7702 Comparison" "PROTOCOL" "TRANSACTIONS" "protocol--transactions--eip7702"
download_og "Account Keychain Precompile Specification" "PROTOCOL" "TRANSACTIONS" "protocol--transactions--keychain"
download_og "Payment Lane Specification" "PROTOCOL" "BLOCKSPACE" "protocol--blockspace--payment-lane"
download_og "Consensus and Finality" "PROTOCOL" "BLOCKSPACE" "protocol--blockspace--consensus"
download_og "Specification" "PROTOCOL" "DEX" "protocol--dex--spec"
download_og "Quote Tokens" "PROTOCOL" "DEX" "protocol--dex--quote-tokens"
download_og "Executing Swaps" "PROTOCOL" "DEX" "protocol--dex--executing-swaps"
download_og "Providing Liquidity" "PROTOCOL" "DEX" "protocol--dex--providing-liquidity"
download_og "DEX Balance" "PROTOCOL" "DEX" "protocol--dex--balance"

download_og "Handlers" "SDKs" "TYPESCRIPT" "sdk--typescript--handlers"
download_og "compose" "SDKs" "TYPESCRIPT" "sdk--typescript--compose"
download_og "feePayer" "SDKs" "TYPESCRIPT" "sdk--typescript--feePayer"
download_og "keyManager" "SDKs" "TYPESCRIPT" "sdk--typescript--keyManager"

download_og "System Requirements" "BUILD" "NODE" "node--system-requirements"
download_og "Installation" "BUILD" "NODE" "node--installation"
download_og "Running an RPC Node" "BUILD" "NODE" "node--rpc"
download_og "Running a Validator" "BUILD" "NODE" "node--validator"
download_og "Operating Your Validator" "BUILD" "NODE" "node--operate-validator"
download_og "Network Upgrades and Releases" "BUILD" "NODE" "node--network-upgrades"

download_og "Remittances" "LEARN" "USE CASES" "learn--use-cases--remittances"
download_og "Global Payouts" "LEARN" "USE CASES" "learn--use-cases--global-payouts"
download_og "Payroll" "LEARN" "USE CASES" "learn--use-cases--payroll"
download_og "Embedded Finance" "LEARN" "USE CASES" "learn--use-cases--embedded-finance"
download_og "Tokenized Deposits" "LEARN" "USE CASES" "learn--use-cases--tokenized-deposits"
download_og "Microtransactions" "LEARN" "USE CASES" "learn--use-cases--microtransactions"
download_og "Agentic Commerce" "LEARN" "USE CASES" "learn--use-cases--agentic-commerce"

download_og "Native Stablecoins" "LEARN" "TEMPO" "learn--tempo--native-stablecoins"
download_og "Modern Transactions" "LEARN" "TEMPO" "learn--tempo--modern-transactions"
download_og "Performance" "LEARN" "TEMPO" "learn--tempo--performance"
download_og "Onchain FX" "LEARN" "TEMPO" "learn--tempo--fx"
download_og "Privacy" "LEARN" "TEMPO" "learn--tempo--privacy"
download_og "Machine Payments" "LEARN" "TEMPO" "learn--tempo--machine-payments"

echo ""
echo "=== Done ==="
ls -1 "$OUT" | wc -l
echo "images saved to $OUT"
