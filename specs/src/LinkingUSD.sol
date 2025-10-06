// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { TIP20 } from "./TIP20.sol";

contract LinkingUSD is TIP20 {

    error TransfersDisabled();

    constructor(address admin, address factory)
        TIP20("linkingUSD", "linkingUSD", "USD", TIP20(address(0)), admin, factory)
    { }

    function depth() public view override returns (uint32) {
        return 0;
    }

    function transfer(address, uint256) external override notPaused returns (bool) {
        revert TransfersDisabled();
    }

    function transferFrom(address, address, uint256) external override notPaused returns (bool) {
        revert TransfersDisabled();
    }

    function transferWithMemo(address, uint256, bytes32) external override notPaused {
        revert TransfersDisabled();
    }

    function transferFromWithMemo(address, address, uint256, bytes32)
        external
        override
        notPaused
        returns (bool)
    {
        revert TransfersDisabled();
    }

}
