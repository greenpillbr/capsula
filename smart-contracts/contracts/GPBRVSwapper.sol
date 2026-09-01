// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ISwapPool} from "./interfaces/ISwapPool.sol";
import {IMentoRouter} from "./interfaces/IMentoRouter.sol";

/// @title GPBRVSwapper
/// @notice Converts between GPBRV and a supported stablecoin by chaining the Sarafu swap pool
///         and the Mento router. The caller picks the stablecoin per call:
///           - USDM (Celo cUSD) is the native Mento counterpart and swaps in a single hop.
///           - Any other registered stable (e.g. USDC, USDT) routes through USDM as the middle
///             hop (BRLM <-> USDM <-> stable), using the per-stable factory recorded at deploy.
///         Two flavours are available:
///           - Single wallet (`deposit` / `withdraw`): the caller spends one token and
///             receives the other in the same wallet. No setup required.
///           - MiniPay-linked (`depositWithMinipay` / `withdrawWithMinipay`): a user links
///             a MiniPay address once, then either side can move value across:
///               - withdrawWithMinipay: user spends GPBRV, MiniPay receives the stable
///               - depositWithMinipay:  MiniPay spends the stable, user receives GPBRV
///         The link can be created from either end: `configure` is called by the main
///         wallet, `configureFromMinipay` by the MiniPay wallet (which is the only option
///         while browsing inside MiniPay).
/// @dev The two Sarafu legs are not symmetric. GPBRV (6) -> BRLM (18) uses the plain
///      3-arg `withdraw`; BRLM (18) -> GPBRV (6) must use the `deductFee` overload, since
///      the 3-arg form mixes fee units and reverts with ERR_BALANCE when the input token
///      has more decimals than the output.
contract GPBRVSwapper {
    using SafeERC20 for IERC20;

    IERC20 public immutable gpbrv;
    IERC20 public immutable brlm;
    IERC20 public immutable usdm;
    ISwapPool public immutable sarafuPool;
    IMentoRouter public immutable mentoRouter;
    address public immutable mentoFactory;

    /// @notice Registered 2-hop stable => the Mento factory of its USDM<->stable pool.
    ///         USDM itself is always supported (native single hop) and is not stored here.
    mapping(address => address) public stableCusdFactory;

    uint256 private constant SWAP_DEADLINE = 300;

    /// @notice Main wallet => linked MiniPay wallet.
    mapping(address => address) public userToMinipay;
    /// @notice MiniPay wallet => owning main wallet (reverse of `userToMinipay`).
    mapping(address => address) public minipayToUser;

    event Configured(address indexed user, address indexed minipay);
    event WithdrawMiniPay(address indexed user, address indexed minipay, address stable, uint256 gpbrvIn, uint256 stableOut);
    event DepositMinipay(address indexed minipay, address indexed user, address stable, uint256 stableIn, uint256 gpbrvOut);
    event WithdrawnDirect(address indexed account, address indexed stable, uint256 gpbrvIn, uint256 stableOut);
    event DepositedDirect(address indexed account, address indexed stable, uint256 stableIn, uint256 gpbrvOut);

    error InvalidAddress();
    error ArrayLengthMismatch();
    error UnsupportedStable();
    error MinipayAlreadyLinked();
    error UserAlreadyLinked();
    error NotConfigured();
    error NothingReceived();
    error InsufficientOutput();

    /// @param stables Additional stablecoins reachable via USDM (e.g. USDC, USDT).
    /// @param factories Parallel array: `factories[i]` is the Mento factory of the
    ///        USDM<->`stables[i]` pool. Must be the same length as `stables`.
    constructor(
        address _gpbrv,
        address _brlm,
        address _usdm,
        address _sarafuPool,
        address _mentoRouter,
        address _mentoFactory,
        address[] memory stables,
        address[] memory factories
    ) {
        if (
            _gpbrv == address(0) ||
            _brlm == address(0) ||
            _usdm == address(0) ||
            _sarafuPool == address(0) ||
            _mentoRouter == address(0) ||
            _mentoFactory == address(0)
        ) revert InvalidAddress();
        if (stables.length != factories.length) revert ArrayLengthMismatch();

        gpbrv = IERC20(_gpbrv);
        brlm = IERC20(_brlm);
        usdm = IERC20(_usdm);
        sarafuPool = ISwapPool(_sarafuPool);
        mentoRouter = IMentoRouter(_mentoRouter);
        mentoFactory = _mentoFactory;

        for (uint256 i = 0; i < stables.length; i++) {
            if (stables[i] == address(0) || factories[i] == address(0)) revert InvalidAddress();
            stableCusdFactory[stables[i]] = factories[i];
        }
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

    /// @notice Link the calling MiniPay wallet to a main wallet. Mirror of `configure`
    ///         for users browsing inside MiniPay, where the caller is the MiniPay wallet.
    ///         Re-configuring with a new main wallet clears the previous forward mapping.
    function configureFromMinipay(address user) external {
        if (user == address(0) || user == msg.sender) revert InvalidAddress();

        address existingMinipay = userToMinipay[user];
        if (existingMinipay != address(0) && existingMinipay != msg.sender) revert UserAlreadyLinked();

        address oldUser = minipayToUser[msg.sender];
        if (oldUser != address(0) && oldUser != user) {
            delete userToMinipay[oldUser];
        }

        userToMinipay[user] = msg.sender;
        minipayToUser[msg.sender] = user;

        emit Configured(user, msg.sender);
    }

    /// @notice Caller spends GPBRV and receives `stable` in the same wallet.
    /// @param amount GPBRV amount to convert (6 decimals).
    /// @param minStableOut Minimum stable the caller must receive (slippage guard).
    /// @param stable USDM, or any registered 2-hop stable (USDC, USDT).
    function withdraw(uint256 amount, uint256 minStableOut, address stable) external returns (uint256 stableOut) {
        IMentoRouter.Route[] memory routes = _routesFromBrlm(stable);

        gpbrv.safeTransferFrom(msg.sender, address(this), amount);

        uint256 brlmReceived = _sarafuSwap(gpbrv, brlm, amount, false);
        stableOut = _mentoSwap(brlm, IERC20(stable), routes, brlmReceived, minStableOut, msg.sender);

        emit WithdrawnDirect(msg.sender, stable, amount, stableOut);
    }

    /// @notice Caller spends `stable` and receives GPBRV in the same wallet.
    /// @param amount Stable amount to convert.
    /// @param minGpbrvOut Minimum GPBRV the caller must receive (slippage guard, 6 decimals).
    /// @param stable USDM, or any registered 2-hop stable (USDC, USDT).
    function deposit(uint256 amount, uint256 minGpbrvOut, address stable) external returns (uint256 gpbrvOut) {
        IMentoRouter.Route[] memory routes = _routesToBrlm(stable);

        IERC20(stable).safeTransferFrom(msg.sender, address(this), amount);

        // Intermediate BRLM has no user-facing slippage guard; the final GPBRV output is checked instead.
        uint256 brlmReceived = _mentoSwap(IERC20(stable), brlm, routes, amount, 0, address(this));
        // BRLM (18) -> GPBRV (6) requires the deductFee overload; see the contract-level @dev note.
        gpbrvOut = _sarafuSwap(brlm, gpbrv, brlmReceived, true);
        if (gpbrvOut < minGpbrvOut) revert InsufficientOutput();

        gpbrv.safeTransfer(msg.sender, gpbrvOut);

        emit DepositedDirect(msg.sender, stable, amount, gpbrvOut);
    }

    /// @notice User spends GPBRV; the configured MiniPay wallet receives `stable`.
    /// @param amount GPBRV amount to convert (6 decimals).
    /// @param minStableOut Minimum stable the MiniPay wallet must receive (slippage guard).
    /// @param stable USDM, or any registered 2-hop stable (USDC, USDT).
    function withdrawWithMinipay(uint256 amount, uint256 minStableOut, address stable) external returns (uint256 stableOut) {
        address minipay = userToMinipay[msg.sender];
        if (minipay == address(0)) revert NotConfigured();

        IMentoRouter.Route[] memory routes = _routesFromBrlm(stable);

        gpbrv.safeTransferFrom(msg.sender, address(this), amount);

        uint256 brlmReceived = _sarafuSwap(gpbrv, brlm, amount, false);
        stableOut = _mentoSwap(brlm, IERC20(stable), routes, brlmReceived, minStableOut, minipay);

        emit WithdrawMiniPay(msg.sender, minipay, stable, amount, stableOut);
    }

    /// @notice MiniPay spends `stable`; the linked main wallet receives GPBRV.
    /// @param amount Stable amount to convert.
    /// @param minGpbrvOut Minimum GPBRV the user must receive (slippage guard, 6 decimals).
    /// @param stable USDM, or any registered 2-hop stable (USDC, USDT).
    function depositWithMinipay(uint256 amount, uint256 minGpbrvOut, address stable) external returns (uint256 gpbrvOut) {
        address user = minipayToUser[msg.sender];
        if (user == address(0)) revert NotConfigured();

        IMentoRouter.Route[] memory routes = _routesToBrlm(stable);

        IERC20(stable).safeTransferFrom(msg.sender, address(this), amount);

        // Intermediate BRLM has no user-facing slippage guard; the final GPBRV output is checked instead.
        uint256 brlmReceived = _mentoSwap(IERC20(stable), brlm, routes, amount, 0, address(this));
        // BRLM (18) -> GPBRV (6) requires the deductFee overload; see the contract-level @dev note.
        gpbrvOut = _sarafuSwap(brlm, gpbrv, brlmReceived, true);
        if (gpbrvOut < minGpbrvOut) revert InsufficientOutput();

        gpbrv.safeTransfer(user, gpbrvOut);

        emit DepositMinipay(msg.sender, user, stable, amount, gpbrvOut);
    }

    /// @dev Mento route BRLM -> `stable`. One hop for USDM, two hops (via USDM) otherwise.
    ///      Reverts `UnsupportedStable` for a stable that was not registered at deploy.
    function _routesFromBrlm(address stable) private view returns (IMentoRouter.Route[] memory routes) {
        if (stable == address(usdm)) {
            routes = new IMentoRouter.Route[](1);
            routes[0] = IMentoRouter.Route({from: address(brlm), to: address(usdm), factory: mentoFactory});
            return routes;
        }

        address factory = stableCusdFactory[stable];
        if (factory == address(0)) revert UnsupportedStable();

        routes = new IMentoRouter.Route[](2);
        routes[0] = IMentoRouter.Route({from: address(brlm), to: address(usdm), factory: mentoFactory});
        routes[1] = IMentoRouter.Route({from: address(usdm), to: stable, factory: factory});
    }

    /// @dev Mento route `stable` -> BRLM. Reverse of `_routesFromBrlm`.
    function _routesToBrlm(address stable) private view returns (IMentoRouter.Route[] memory routes) {
        if (stable == address(usdm)) {
            routes = new IMentoRouter.Route[](1);
            routes[0] = IMentoRouter.Route({from: address(usdm), to: address(brlm), factory: mentoFactory});
            return routes;
        }

        address factory = stableCusdFactory[stable];
        if (factory == address(0)) revert UnsupportedStable();

        routes = new IMentoRouter.Route[](2);
        routes[0] = IMentoRouter.Route({from: stable, to: address(usdm), factory: factory});
        routes[1] = IMentoRouter.Route({from: address(usdm), to: address(brlm), factory: mentoFactory});
    }

    /// @dev Swaps `amountIn` of `tokenIn` for `tokenOut` through the Sarafu pool, returning
    ///      the amount of `tokenOut` received by this contract. `deductFee` selects the
    ///      overload that takes the pool fee from the output token, required whenever
    ///      `tokenIn` has more decimals than `tokenOut`.
    function _sarafuSwap(
        IERC20 tokenIn,
        IERC20 tokenOut,
        uint256 amountIn,
        bool deductFee
    ) private returns (uint256 received) {
        uint256 before = tokenOut.balanceOf(address(this));
        tokenIn.forceApprove(address(sarafuPool), amountIn);
        if (deductFee) {
            sarafuPool.withdraw(address(tokenOut), address(tokenIn), amountIn, true);
        } else {
            sarafuPool.withdraw(address(tokenOut), address(tokenIn), amountIn);
        }
        received = tokenOut.balanceOf(address(this)) - before;
        if (received == 0) revert NothingReceived();
    }

    /// @dev Swaps `amountIn` of `tokenIn` for `tokenOut` through the Mento router along the
    ///      given `routes`, sending the output to `to` and returning the amount `to` received.
    function _mentoSwap(
        IERC20 tokenIn,
        IERC20 tokenOut,
        IMentoRouter.Route[] memory routes,
        uint256 amountIn,
        uint256 minOut,
        address to
    ) private returns (uint256 received) {
        tokenIn.forceApprove(address(mentoRouter), amountIn);

        uint256 before = tokenOut.balanceOf(to);
        mentoRouter.swapExactTokensForTokens(amountIn, minOut, routes, to, block.timestamp + SWAP_DEADLINE);
        received = tokenOut.balanceOf(to) - before;
        if (received == 0) revert NothingReceived();
    }
}
