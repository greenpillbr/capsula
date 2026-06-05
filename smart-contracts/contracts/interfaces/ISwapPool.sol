// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Minimal interface for the Sarafu Network permissioned swap pool.
/// @dev `withdraw` performs a swap: it pulls `value` of `inToken` from the caller
///      and sends the corresponding amount of `outToken` back to the caller.
interface ISwapPool {
    function withdraw(address outToken, address inToken, uint256 value) external;

    function deposit(address token, uint256 value) external;
}
