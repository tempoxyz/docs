// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/TIP4217Registry.sol";

contract MockTIP4217Registry is TIP4217Registry {

    mapping(string => uint8) private currencyDecimals;

    constructor() {
        // Set default decimals for common currencies
        currencyDecimals["USD"] = 6;
        currencyDecimals["EUR"] = 6;
        currencyDecimals["BTC"] = 8;
        currencyDecimals["ETH"] = 18;
    }

    function getCurrencyDecimals(string calldata currency) external view override returns (uint8) {
        uint8 decimals = currencyDecimals[currency];
        return decimals == 0 ? 18 : decimals; // Default to 18 if not set
    }

    function setCurrencyDecimals(string calldata currency, uint8 decimals) external {
        currencyDecimals[currency] = decimals;
    }

}
