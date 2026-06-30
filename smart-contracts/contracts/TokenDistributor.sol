// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title TokenDistributor
/// @notice Owner-managed reward-token distribution events: each event is claimable once per user
///         inside a snapshotted block window [startBlock, startBlock + period].
contract TokenDistributor is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable rewardToken;

    uint256 public amount = 1_000_000; // default reward amount (1 token with 6 decimals)
    uint256 public period = 5_400; // 90 minutes (5400 blocks, 1 block = 1 second)

    mapping(address => bool) public isCreator;

    struct Distribution {
        uint256 amount;
        uint256 startBlock;
        uint256 endBlock;
        uint256 maxClaimers;
        uint256 claimsCount;
        bool cancelled;
    }

    Distribution[] private _distributions;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event ConfigUpdated(uint256 amount, uint256 period);
    event CreatorAdded(address indexed account);
    event CreatorRemoved(address indexed account);
    event DistributionCreated(uint256 indexed id, uint256 endBlock, uint256 amount, uint256 maxClaimers);
    event DistributionCancelled(uint256 indexed id);
    event Claim(uint256 indexed id, address indexed user, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    error InvalidConfig();
    error UnknownDistribution();
    error NotActive();
    error AlreadyClaimed();
    error InsufficientPool();
    error NotAllowedCreator();
    error MaxClaimersReached();

    modifier onlyCreator() {
        if (!isCreator[msg.sender]) revert NotAllowedCreator();
        _;
    }

    constructor(address _rewardToken, address initialOwner) Ownable(initialOwner) {
        if (_rewardToken == address(0)) revert InvalidConfig();
        rewardToken = IERC20(_rewardToken);
        isCreator[initialOwner] = true;
        emit CreatorAdded(initialOwner);
    }

    function addCreator(address account) external onlyOwner {
        if (account == address(0) || isCreator[account]) revert InvalidConfig();
        isCreator[account] = true;
        emit CreatorAdded(account);
    }

    function removeCreator(address account) external onlyOwner {
        if (!isCreator[account]) revert InvalidConfig();
        isCreator[account] = false;
        emit CreatorRemoved(account);
    }

    function setConfig(uint256 _amount, uint256 _period) external onlyOwner {
        if (_amount == 0 || _period == 0) revert InvalidConfig();
        amount = _amount;
        period = _period;
        emit ConfigUpdated(_amount, _period);
    }

    function createDistribution(uint256 maxClaimers) external onlyCreator returns (uint256 id) {
        uint256 start = block.number;
        uint256 end = start + period;
        uint256 snapshotAmount = amount;
        uint256 effectiveMax = maxClaimers == 0 ? type(uint256).max : maxClaimers;

        id = _distributions.length;
        _distributions.push(
            Distribution({
                amount: snapshotAmount,
                startBlock: start,
                endBlock: end,
                maxClaimers: effectiveMax,
                claimsCount: 0,
                cancelled: false
            })
        );

        emit DistributionCreated(id, end, snapshotAmount, effectiveMax);
    }

    function cancelDistribution(uint256 id) external onlyCreator {
        if (id >= _distributions.length) revert UnknownDistribution();
        if (_distributions[id].cancelled) revert NotActive();
        _distributions[id].cancelled = true;
        emit DistributionCancelled(id);
    }

    function claim(uint256 id) external {
        if (id >= _distributions.length) revert UnknownDistribution();
        Distribution storage dist = _distributions[id];
        if (block.number < dist.startBlock || block.number > dist.endBlock) revert NotActive();
        if (dist.cancelled) revert NotActive();
        if (dist.claimsCount >= dist.maxClaimers) revert MaxClaimersReached();
        if (claimed[id][msg.sender]) revert AlreadyClaimed();
        if (rewardToken.balanceOf(address(this)) < dist.amount) revert InsufficientPool();

        claimed[id][msg.sender] = true;
        dist.claimsCount++;
        rewardToken.safeTransfer(msg.sender, dist.amount);

        emit Claim(id, msg.sender, dist.amount);
    }

    function withdraw(uint256 value) external onlyOwner {
        rewardToken.safeTransfer(owner(), value);
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
        if (dist.cancelled) return false;
        if (dist.claimsCount >= dist.maxClaimers) return false;
        return block.number >= dist.startBlock && block.number <= dist.endBlock;
    }

    function hasClaimed(uint256 id, address user) external view returns (bool) {
        return claimed[id][user];
    }
}
