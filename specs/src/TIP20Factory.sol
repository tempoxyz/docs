// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { TIP20 } from "./TIP20.sol";

contract TIP20Factory {

    error InvalidLinkingToken();

    event TokenCreated(
        address indexed token,
        uint256 indexed tokenId,
        string name,
        string symbol,
        string currency,
        TIP20 linkingToken,
        address admin
    );

    uint256 public tokenIdCounter = 1;

    function createToken(
        string memory name,
        string memory symbol,
        string memory currency,
        TIP20 linkingToken,
        address admin
    ) external returns (address) {
        // Validate that linkingToken is a valid TIP20
        if (!isTIP20(address(linkingToken))) {
            revert InvalidLinkingToken();
        }

        ++tokenIdCounter;

        TIP20 token = new TIP20(name, symbol, currency, linkingToken, admin, address(this));
        emit TokenCreated(
            address(token), tokenIdCounter, name, symbol, currency, linkingToken, admin
        );

        // Note: Will deploy at specific vanity
        // address determined by tokenIdCounter.
        return address(token);
    }

    function isTIP20(address token) public view returns (bool) {
        return bytes12(bytes20(token)) == 0x20c000000000000000000000
            && uint64(uint160(token)) <= tokenIdCounter;
    }

}
