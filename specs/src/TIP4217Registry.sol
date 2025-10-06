// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface TIP4217Registry {

    function getCurrencyDecimals(string calldata currency) external view returns (uint8);

}
