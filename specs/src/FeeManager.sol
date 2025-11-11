// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { FeeAMM } from "./FeeAMM.sol";
import { TIP20Factory } from "./TIP20Factory.sol";
import { IERC20 } from "./interfaces/IERC20.sol";
import { IFeeManager } from "./interfaces/IFeeManager.sol";
import { ITIP20 } from "./interfaces/ITIP20.sol";

contract FeeManager is IFeeManager, FeeAMM {

    address internal constant LINKING_USD = 0x20C0000000000000000000000000000000000000;

    // Validator token preferences
    mapping(address => address) public validatorTokens;

    // User token preferences
    mapping(address => address) public userTokens;

    // Fee collection tracking
    uint256 private collectedFees;

    // Track tokens that have collected fees
    address[] private tokensWithFees;
    mapping(address => bool) private tokenInFeesArray;

    modifier onlyDirectCall() {
        // In the real implementation, the protocol does a check that this is the top frame,
        // which is no longer possible in the EVM due to 7702
        require(msg.sender == tx.origin, "ONLY_DIRECT_CALL");
        _;
    }

    // TODO: could just call this on the TIP20Factory contract
    function isTIP20(address token) internal pure returns (bool) {
        return bytes14(bytes20(token)) == 0x20c0000000000000000000000000;
    }

    function setValidatorToken(address token) external onlyDirectCall {
        // prevent changing within the validator's own block to avoid edge cases
        require(msg.sender != block.coinbase, "CANNOT_CHANGE_WITHIN_BLOCK");
        require(isTIP20(token), "INVALID_TOKEN");
        require(
            keccak256(bytes(ITIP20(token).currency())) == keccak256(bytes("USD")), "INVALID_TOKEN"
        );
        validatorTokens[msg.sender] = token;
        emit ValidatorTokenSet(msg.sender, token);
    }

    function setUserToken(address token) external onlyDirectCall {
        require(isTIP20(token), "INVALID_TOKEN");
        // forbid setting linkingUSD as the user's fee token
        require(token != LINKING_USD, "CANNOT_SET_LINKINGUSD");
        require(
            keccak256(bytes(ITIP20(token).currency())) == keccak256(bytes("USD")), "INVALID_TOKEN"
        );
        userTokens[msg.sender] = token;
        emit UserTokenSet(msg.sender, token);
    }

    // This function is called by the protocol before any transaction is executed.
    // If it reverts, the transaction is invalid
    function collectFeePreTx(address user, address txToAddress, uint256 maxAmount)
        external
        returns (address userToken)
    {
        require(msg.sender == address(0), "ONLY_PROTOCOL");

        // Get validator's preferred token
        address validatorToken = validatorTokens[block.coinbase];
        require(validatorToken != address(0), "VALIDATOR_TOKEN_NOT_SET");

        // Get user's preferred token
        // Logic is: transaction > account > contract > validator
        // TODO: once transactions can set their preferred fee token, add this to the logic
        // TODO: special-case the logic for when txToAddress is this contract, as per the spec
        userToken = userTokens[user];
        if (userToken == address(0)) {
            if (isTIP20(txToAddress)) {
                userToken = txToAddress;
            } else {
                userToken = validatorToken;
            }
        }

        // If user token is different from validator token, reserve AMM liquidity
        if (userToken != validatorToken) {
            reserveLiquidity(userToken, validatorToken, maxAmount);
        }

        ITIP20(userToken).systemTransferFrom(user, address(this), maxAmount);
    }

    // This function is called by the protocol after a transaction is executed.
    // It should never revert. If it does, there is a design flaw in the protocol.
    function collectFeePostTx(
        address user,
        uint256 maxAmount,
        uint256 actualUsed,
        address userToken,
        address validatorToken
    ) external {
        require(msg.sender == address(0), "ONLY_PROTOCOL");

        // Calculate refund amount
        uint256 refundAmount = maxAmount - actualUsed;

        // Refund unused tokens to user
        if (refundAmount > 0) {
            IERC20(userToken).transfer(user, refundAmount);
        }

        releaseLiquidityPostTx(userToken, validatorToken, refundAmount);

        // Track collected fees (only the actual used amount)
        if (actualUsed > 0) {
            if (userToken == validatorToken) {
                collectedFees += actualUsed;
            } else if (!tokenInFeesArray[userToken]) {
                tokensWithFees.push(userToken);
                tokenInFeesArray[userToken] = true;
            }
        }
    }

    // This function is called once in a special transaction required by the protocol at the end of each block.
    // It should never revert. If it does, there is a design flaw in the protocol.
    function executeBlock() external {
        require(msg.sender == address(0), "ONLY_PROTOCOL");

        // Get current validator's preferred token
        address validatorToken = validatorTokens[block.coinbase];
        require(validatorToken != address(0), "VALIDATOR_TOKEN_NOT_SET");

        // Process all collected fees and execute pending swaps
        for (uint256 i = 0; i < tokensWithFees.length; i++) {
            address token = tokensWithFees[i];

            if (token != validatorToken) {
                // Check if pool exists
                FeeAMM.Pool memory pool = this.getPool(token, validatorToken);
                if (pool.reserveUserToken > 0 || pool.reserveValidatorToken > 0) {
                    // Execute pending swaps to update reserves and get output amount
                    collectedFees += executePendingFeeSwaps(token, validatorToken);
                }
            }

            // Clear tracking for this token
            tokenInFeesArray[token] = false;
            delete tokensWithFees[i];
        }

        delete tokensWithFees;

        // Transfer all validator tokens to the validator
        if (collectedFees > 0) {
            IERC20(validatorToken).transfer(block.coinbase, collectedFees);
            collectedFees = 0;
        }
    }

}
