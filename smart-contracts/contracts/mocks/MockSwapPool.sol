// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ISwapPool} from "../interfaces/ISwapPool.sol";

/// @notice Test double for the Sarafu swap pool. Swaps at a flat 1:1 value, adjusting only
///         for differing token decimals. Must be pre-funded with the output token.
contract MockSwapPool is ISwapPool {
    using SafeERC20 for IERC20;

    function withdraw(address outToken, address inToken, uint256 value) external override {
        _swap(outToken, inToken, value);
    }

    function withdraw(address outToken, address inToken, uint256 value, bool) external override {
        _swap(outToken, inToken, value);
    }

    function _swap(address outToken, address inToken, uint256 value) private {
        IERC20(inToken).safeTransferFrom(msg.sender, address(this), value);

        uint8 inDecimals = IERC20Metadata(inToken).decimals();
        uint8 outDecimals = IERC20Metadata(outToken).decimals();
        uint256 outValue = _scale(value, inDecimals, outDecimals);

        IERC20(outToken).safeTransfer(msg.sender, outValue);
    }

    function deposit(address token, uint256 value) external override {
        IERC20(token).safeTransferFrom(msg.sender, address(this), value);
    }

    function _scale(uint256 value, uint8 fromDecimals, uint8 toDecimals) private pure returns (uint256) {
        if (toDecimals >= fromDecimals) {
            return value * (10 ** (toDecimals - fromDecimals));
        }
        return value / (10 ** (fromDecimals - toDecimals));
    }
}
