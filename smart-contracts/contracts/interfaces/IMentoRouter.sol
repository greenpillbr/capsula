// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Minimal interface for the Mento (Uniswap V2 style) router used to swap
///         BRLM <-> USDM on Celo.
interface IMentoRouter {
    struct Route {
        address from;
        address to;
        address factory;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}
