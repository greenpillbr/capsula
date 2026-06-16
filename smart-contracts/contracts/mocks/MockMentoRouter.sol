// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IMentoRouter} from "../interfaces/IMentoRouter.sol";

/// @notice Test double for the Mento router. Single-hop swap at a flat 1:1 value, adjusting
///         only for differing token decimals. Must be pre-funded with the output token.
contract MockMentoRouter is IMentoRouter {
    using SafeERC20 for IERC20;

    error EmptyRoutes();
    error InsufficientOutputAmount();

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 /* deadline */
    ) external override returns (uint256[] memory amounts) {
        if (routes.length == 0) revert EmptyRoutes();

        address fromToken = routes[0].from;
        address toToken = routes[routes.length - 1].to;

        IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);

        uint8 fromDecimals = IERC20Metadata(fromToken).decimals();
        uint8 toDecimals = IERC20Metadata(toToken).decimals();
        uint256 amountOut = _scale(amountIn, fromDecimals, toDecimals);
        if (amountOut < amountOutMin) revert InsufficientOutputAmount();

        IERC20(toToken).safeTransfer(to, amountOut);

        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
    }

    function _scale(uint256 value, uint8 fromDecimals, uint8 toDecimals) private pure returns (uint256) {
        if (toDecimals >= fromDecimals) {
            return value * (10 ** (toDecimals - fromDecimals));
        }
        return value / (10 ** (fromDecimals - toDecimals));
    }
}
