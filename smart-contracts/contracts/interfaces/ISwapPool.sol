// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Minimal interface for the Sarafu Network permissioned swap pool.
/// @dev `withdraw` performs a swap: it pulls `value` of `inToken` from the caller
///      and sends the corresponding amount of `outToken` back to the caller.
interface ISwapPool {
    function withdraw(address outToken, address inToken, uint256 value) external;

    /// @dev Sarafu overload: when `deductFee` is true, fees are taken from the output
    ///      token (`withdraw_less_fee`). Required for cross-decimal swaps such as
    ///      BRLM (18) -> GPBRV (6); the 3-arg form mixes fee units and reverts with
    ///      ERR_BALANCE when the input token has more decimals than the output.
    function withdraw(address outToken, address inToken, uint256 value, bool deductFee) external;

    function deposit(address token, uint256 value) external;
}
