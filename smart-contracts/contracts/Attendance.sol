// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Attendance
/// @notice Owner-managed GPBR distribution events: each event is claimable once per user
///         inside a snapshotted block window [startBlock, startBlock + period].
contract Attendance is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable gpbr;

    uint256 public amount = 1_000_000;
    uint256 public period = 5_400;

    struct Distribution {
        uint256 amount;
        uint256 startBlock;
        uint256 endBlock;
    }

    Distribution[] private _distributions;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event ConfigUpdated(uint256 amount, uint256 period);
    event DistributionCreated(uint256 indexed id, uint256 endBlock, uint256 amount);
    event Claim(uint256 indexed id, address indexed user, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    error InvalidConfig();
    error UnknownDistribution();
    error NotActive();
    error AlreadyClaimed();
    error InsufficientPool();

    constructor(address gpbrToken, address initialOwner) Ownable(initialOwner) {
        if (gpbrToken == address(0)) revert InvalidConfig();
        gpbr = IERC20(gpbrToken);
    }

    function setConfig(uint256 _amount, uint256 _period) external onlyOwner {
        if (_amount == 0 || _period == 0) revert InvalidConfig();
        amount = _amount;
        period = _period;
        emit ConfigUpdated(_amount, _period);
    }

    function createDistribution() external onlyOwner returns (uint256 id) {
        uint256 start = block.number;
        uint256 end = start + period;
        uint256 snapshotAmount = amount;

        id = _distributions.length;
        _distributions.push(Distribution({amount: snapshotAmount, startBlock: start, endBlock: end}));

        emit DistributionCreated(id, end, snapshotAmount);
    }

    function claim(uint256 id) external {
        if (id >= _distributions.length) revert UnknownDistribution();
        Distribution memory dist = _distributions[id];
        if (block.number < dist.startBlock || block.number > dist.endBlock) revert NotActive();
        if (claimed[id][msg.sender]) revert AlreadyClaimed();
        if (gpbr.balanceOf(address(this)) < dist.amount) revert InsufficientPool();

        claimed[id][msg.sender] = true;
        gpbr.safeTransfer(msg.sender, dist.amount);

        emit Claim(id, msg.sender, dist.amount);
    }

    function withdraw(uint256 value) external onlyOwner {
        gpbr.safeTransfer(owner(), value);
        emit Withdrawn(owner(), value);
    }

    function distributions(uint256 id) external view returns (Distribution memory) {
        if (id >= _distributions.length) revert UnknownDistribution();
        return _distributions[id];
    }

    function distributionsCount() external view returns (uint256) {
        return _distributions.length;
    }

    function isActive(uint256 id) external view returns (bool) {
        if (id >= _distributions.length) return false;
        Distribution memory dist = _distributions[id];
        return block.number >= dist.startBlock && block.number <= dist.endBlock;
    }

    function hasClaimed(uint256 id, address user) external view returns (bool) {
        return claimed[id][user];
    }
}
