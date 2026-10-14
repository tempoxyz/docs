# // [!region setup]
import os
from web3 import Web3
from pytempo import Call, TempoTransaction
from pytempo.contracts import ALPHA_USD, BETA_USD, TIP20

w3 = Web3(Web3.HTTPProvider("https://rpc.moderato.tempo.xyz"))
account = w3.eth.account.from_key(os.environ["TEMPO_PRIVATE_KEY"])
recipient = Web3.to_checksum_address(os.environ["TEMPO_RECIPIENT"])
# // [!endregion setup]

# // [!region transaction]
def make_transaction(calls, fee_token=ALPHA_USD):
    rpc_calls = [{
        "to": Web3.to_checksum_address(bytes(call.to)),
        "data": "0x" + call.data.hex(),
        "value": hex(call.value),
    } for call in calls]
    gas_request = {
        "type": "0x76", "from": account.address,
        "feeToken": fee_token, "calls": rpc_calls,
    }
    gas = int(w3.manager.request_blocking("eth_estimateGas", [gas_request]), 16)
    return TempoTransaction.create(
        chain_id=w3.eth.chain_id,
        gas_limit=(gas * 12 + 9) // 10,
        max_fee_per_gas=w3.eth.gas_price * 2,
        max_priority_fee_per_gas=0,
        nonce=w3.eth.get_transaction_count(account.address),
        fee_token=fee_token,
        calls=tuple(calls),
    )


def submit(tx):
    signed = tx.sign(account.key.hex())
    tx_hash = w3.eth.send_raw_transaction(signed.encode())
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    if receipt["status"] != 1:
        raise RuntimeError("Transaction reverted")
    return receipt
# // [!endregion transaction]

# // [!region contracts]
from pytempo.contracts import (
    STABLECOIN_DEX_ABI, STABLECOIN_DEX_ADDRESS, TIP20_FACTORY_ADDRESS,
)

factory_abi = [
    {
        "type": "function", "name": "createToken", "stateMutability": "nonpayable",
        "inputs": [{"name": name, "type": kind} for name, kind in [
            ("name", "string"), ("symbol", "string"), ("currency", "string"),
            ("quoteToken", "address"), ("admin", "address"), ("salt", "bytes32"),
        ]],
        "outputs": [{"name": "token", "type": "address"}],
    },
    {
        "type": "function", "name": "getTokenAddress", "stateMutability": "pure",
        "inputs": [{"name": "sender", "type": "address"}, {"name": "salt", "type": "bytes32"}],
        "outputs": [{"name": "token", "type": "address"}],
    },
]
factory = w3.eth.contract(address=TIP20_FACTORY_ADDRESS, abi=factory_abi)
dex = w3.eth.contract(address=STABLECOIN_DEX_ADDRESS, abi=STABLECOIN_DEX_ABI)
# // [!endregion contracts]
