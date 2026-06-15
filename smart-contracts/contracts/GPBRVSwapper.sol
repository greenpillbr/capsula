// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ISwapPool} from "./interfaces/ISwapPool.sol";
import {IMentoRouter} from "./interfaces/IMentoRouter.sol";

/// @title GPBRVSwapper
/// @notice Converts between GPBRV and USDM by chaining the Sarafu swap pool and the
///         Mento router. Two flavours are available:
///           - Single wallet (`deposit` / `withdraw`): the caller spends one token and
///             receives the other in the same wallet. No setup required.
///           - MiniPay-linked (`depositWithMinipay` / `withdrawWithMinipay`): a user links
///             a MiniPay address once via `configure`, then either side can move value across:
///               - withdrawWithMinipay: user spends GPBRV, MiniPay receives USDM
///               - depositWithMinipay:  MiniPay spends USDM, user receives GPBRV
contract GPBRVSwapper {
    using SafeERC20 for IERC20;

    IERC20 public immutable gpbrv;
    IERC20 public immutable brlm;
    IERC20 public immutable usdm;
    ISwapPool public immutable sarafuPool;
    IMentoRouter public immutable mentoRouter;
    address public immutable mentoFactory;

    uint256 private constant SWAP_DEADLINE = 300;

    /// @notice Main wallet => linked MiniPay wallet.
    mapping(address => address) public userToMinipay;
    /// @notice MiniPay wallet => owning main wallet (reverse of `userToMinipay`).
    mapping(address => address) public minipayToUser;

    event Configured(address indexed user, address indexed minipay);
    event Withdrawn(address indexed user, address indexed minipay, uint256 gpbrvIn, uint256 usdmOut);
    event Deposited(address indexed minipay, address indexed user, uint256 usdmIn, uint256 gpbrvOut);
    event WithdrawnDirect(address indexed account, uint256 gpbrvIn, uint256 usdmOut);
    event DepositedDirect(address indexed account, uint256 usdmIn, uint256 gpbrvOut);

    error InvalidAddress();
    error MinipayAlreadyLinked();
    error NotConfigured();
    error NothingReceived();
    error InsufficientOutput();

    constructor(
        address _gpbrv,
        address _brlm,
        address _usdm,
        address _sarafuPool,
        address _mentoRouter,
        address _mentoFactory
    ) {
        if (
            _gpbrv == address(0) ||
            _brlm == address(0) ||
            _usdm == address(0) ||
            _sarafuPool == address(0) ||
            _mentoRouter == address(0) ||
            _mentoFactory == address(0)
        ) revert InvalidAddress();

        gpbrv = IERC20(_gpbrv);
        brlm = IERC20(_brlm);
        usdm = IERC20(_usdm);
        sarafuPool = ISwapPool(_sarafuPool);
        mentoRouter = IMentoRouter(_mentoRouter);
        mentoFactory = _mentoFactory;
    }

    /// @notice Link the caller's main wallet to a MiniPay wallet. Re-configuring with a
    ///         new MiniPay address clears the previous reverse mapping.
    function configure(address minipay) external {
        if (minipay == address(0) || minipay == msg.sender) revert InvalidAddress();

        address existingUser = minipayToUser[minipay];
        if (existingUser != address(0) && existingUser != msg.sender) revert MinipayAlreadyLinked();

        address oldMinipay = userToMinipay[msg.sender];
        if (oldMinipay != address(0) && oldMinipay != minipay) {
            delete minipayToUser[oldMinipay];
        }

        userToMinipay[msg.sender] = minipay;
        minipayToUser[minipay] = msg.sender;

        emit Configured(msg.sender, minipay);
    }

    /// @notice Caller spends GPBRV and receives USDM in the same wallet.
    /// @param amount GPBRV amount to convert (6 decimals).
    /// @param minUsdmOut Minimum USDM the caller must receive (slippage guard, 18 decimals).
    function withdraw(uint256 amount, uint256 minUsdmOut) external returns (uint256 usdmOut) {
        gpbrv.safeTransferFrom(msg.sender, address(this), amount);

        uint256 brlmReceived = _sarafuSwap(gpbrv, brlm, amount);
        usdmOut = _mentoSwap(brlm, usdm, brlmReceived, minUsdmOut, msg.sender);

        emit WithdrawnDirect(msg.sender, amount, usdmOut);
    }

    /// @notice Caller spends USDM and receives GPBRV in the same wallet.
    /// @param amount USDM amount to convert (18 decimals).
    /// @param minGpbrvOut Minimum GPBRV the caller must receive (slippage guard, 6 decimals).
    function deposit(uint256 amount, uint256 minGpbrvOut) external returns (uint256 gpbrvOut) {
        usdm.safeTransferFrom(msg.sender, address(this), amount);

        // Intermediate BRLM has no user-facing slippage guard; the final GPBRV output is checked instead.
        uint256 brlmReceived = _mentoSwap(usdm, brlm, amount, 0, address(this));
        gpbrvOut = _sarafuSwap(brlm, gpbrv, brlmReceived);
        if (gpbrvOut < minGpbrvOut) revert InsufficientOutput();

        gpbrv.safeTransfer(msg.sender, gpbrvOut);

        emit DepositedDirect(msg.sender, amount, gpbrvOut);
    }

    /// @notice User spends GPBRV; the configured MiniPay wallet receives USDM.
    /// @param amount GPBRV amount to convert (6 decimals).
    /// @param minUsdmOut Minimum USDM the MiniPay wallet must receive (slippage guard, 18 decimals).
    function withdrawWithMinipay(uint256 amount, uint256 minUsdmOut) external returns (uint256 usdmOut) {
        address minipay = userToMinipay[msg.sender];
        if (minipay == address(0)) revert NotConfigured();

        gpbrv.safeTransferFrom(msg.sender, address(this), amount);

        uint256 brlmReceived = _sarafuSwap(gpbrv, brlm, amount);
        usdmOut = _mentoSwap(brlm, usdm, brlmReceived, minUsdmOut, minipay);

        emit Withdrawn(msg.sender, minipay, amount, usdmOut);
    }

    /// @notice MiniPay spends USDM; the linked main wallet receives GPBRV.
    /// @param amount USDM amount to convert (18 decimals).
    /// @param minGpbrvOut Minimum GPBRV the user must receive (slippage guard, 6 decimals).
    function depositWithMinipay(uint256 amount, uint256 minGpbrvOut) external returns (uint256 gpbrvOut) {
        address user = minipayToUser[msg.sender];
        if (user == address(0)) revert NotConfigured();

        usdm.safeTransferFrom(msg.sender, address(this), amount);

        // Intermediate BRLM has no user-facing slippage guard; the final GPBRV output is checked instead.
        uint256 brlmReceived = _mentoSwap(usdm, brlm, amount, 0, address(this));
        gpbrvOut = _sarafuSwap(brlm, gpbrv, brlmReceived);
        if (gpbrvOut < minGpbrvOut) revert InsufficientOutput();

        gpbrv.safeTransfer(user, gpbrvOut);

        emit Deposited(msg.sender, user, amount, gpbrvOut);
    }

    /// @dev Swaps `amountIn` of `tokenIn` for `tokenOut` through the Sarafu pool, returning
    ///      the amount of `tokenOut` received by this contract.
    function _sarafuSwap(IERC20 tokenIn, IERC20 tokenOut, uint256 amountIn) private returns (uint256 received) {
        uint256 before = tokenOut.balanceOf(address(this));
        tokenIn.forceApprove(address(sarafuPool), amountIn);
        sarafuPool.withdraw(address(tokenOut), address(tokenIn), amountIn);
        received = tokenOut.balanceOf(address(this)) - before;
        if (received == 0) revert NothingReceived();
    }

    /// @dev Swaps `amountIn` of `tokenIn` for `tokenOut` through the Mento router, sending
    ///      the output to `to` and returning the amount `to` received.
    function _mentoSwap(
        IERC20 tokenIn,
        IERC20 tokenOut,
        uint256 amountIn,
        uint256 minOut,
        address to
    ) private returns (uint256 received) {
        tokenIn.forceApprove(address(mentoRouter), amountIn);

        IMentoRouter.Route[] memory routes = new IMentoRouter.Route[](1);
        routes[0] = IMentoRouter.Route({from: address(tokenIn), to: address(tokenOut), factory: mentoFactory});

        uint256 before = tokenOut.balanceOf(to);
        mentoRouter.swapExactTokensForTokens(amountIn, minOut, routes, to, block.timestamp + SWAP_DEADLINE);
        received = tokenOut.balanceOf(to) - before;
        if (received == 0) revert NothingReceived();
    }
}
