// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { TIP20 } from "./TIP20.sol";
import { ITIP20 } from "./interfaces/ITIP20.sol";
import { ITIP20Factory } from "./interfaces/ITIP20Factory.sol";

contract TIP20Factory is ITIP20Factory {

    uint256 public tokenIdCounter = 1;

    function createToken(
        string memory name,
        string memory symbol,
        string memory currency,
        ITIP20 quoteToken,
        address admin
    ) external returns (address) {
        // Validate that quoteToken is a valid TIP20
        if (!isTIP20(address(quoteToken))) {
            revert InvalidQuoteToken();
        }

        // If token is USD, its quote token must also be USD
        if (keccak256(bytes(currency)) == keccak256(bytes("USD"))) {
            if (keccak256(bytes(quoteToken.currency())) != keccak256(bytes("USD"))) {
                revert InvalidQuoteToken();
            }
        }

        ++tokenIdCounter;

        TIP20 token = new TIP20(name, symbol, currency, quoteToken, admin);
        emit TokenCreated(address(token), tokenIdCounter, name, symbol, currency, quoteToken, admin);

        // Note: Will deploy at specific vanity
        // address determined by tokenIdCounter.
        return address(token);
    }

    function isTIP20(address token) public view returns (bool) {
        return bytes12(bytes20(token)) == 0x20c000000000000000000000
            && uint64(uint160(token)) <= tokenIdCounter;
    }

}
