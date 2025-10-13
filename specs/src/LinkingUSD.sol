// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { TIP20 } from "./TIP20.sol";

contract LinkingUSD is TIP20 {

    error TransfersDisabled();

    address private constant STABLECOIN_DEX = 0xDEc0000000000000000000000000000000000000;

    constructor(address admin) TIP20("linkingUSD", "linkingUSD", "USD", TIP20(address(0)), admin) { }

    function transfer(address to, uint256 amount) external override notPaused returns (bool) {
        if (msg.sender == STABLECOIN_DEX) {
            _transfer(msg.sender, to, amount);
            return true;
        } else {
            revert TransfersDisabled();
        }
    }

    function transferFrom(address from, address to, uint256 amount)
        external
        override
        notPaused
        returns (bool)
    {
        if (msg.sender == STABLECOIN_DEX) {
            _transferFrom(from, to, amount);
            return true;
        } else {
            revert TransfersDisabled();
        }
    }

    function transferWithMemo(address, uint256, bytes32) external view override notPaused {
        revert TransfersDisabled();
    }

    function transferFromWithMemo(address, address, uint256, bytes32)
        external
        view
        override
        notPaused
        returns (bool)
    {
        revert TransfersDisabled();
    }

}
