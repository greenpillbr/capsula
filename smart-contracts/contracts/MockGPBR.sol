// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Minimal GPBR-like ERC20 (6 decimals) used only by the test suite.
contract MockGPBR is ERC20 {
    constructor() ERC20("Mock GPBR", "mGPBR") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 value) external {
        _mint(to, value);
    }
}
