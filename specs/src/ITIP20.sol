// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { IERC20 } from "./IERC20.sol";

interface ITIP20 is IERC20 {

    function currency() external view returns (string memory);

    function systemTransferFrom(address from, address to, uint256 amount) external returns (bool);

}
