export const ATTENDANCE_ADDRESS =
  "0x12bf6eB348566f2aE2c90DD919025520856236bC" as const;

export const GPBR_ADDRESS =
  "0xd832B2F117db51021Ad0387c17182796DBEB69df" as const;

export const GPBR_DECIMALS = 6;

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

// GPBRVSwapper bindings. The deployed swapper address is environment-driven so the
// same build can target a local anvil fork or Celo mainnet.
export const GPBRV_ADDRESS =
  "0x6ec3d6e693526108990c6d5cbd2195e051321d32" as const;

export const USDM_ADDRESS =
  "0x765de816845861e75a25fca122bb6898b8b1282a" as const;

export const BRLM_ADDRESS =
  "0xe8537a3d056da446677b9e9d6c5db704eaab4787" as const;

export const MENTO_ROUTER_ADDRESS =
  "0x4861840C2EfB2b98312B0aE34d86fD73E8f9B6f6" as const;

export const MENTO_FACTORY_ADDRESS =
  "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3" as const;

export const GPBRV_DECIMALS = 6;
export const USDM_DECIMALS = 18;
export const BRLM_DECIMALS = 18;

/** Fixed 5% fee charged by the Sarafu swap pool on GPBRV <-> BRLM swaps. */
export const SARAFU_FEE_BPS = BigInt(500);

/** Default slippage buffer applied on top of the live Mento quote. */
export const SLIPPAGE_BPS = BigInt(600);

export const BPS_DENOMINATOR = BigInt(10_000);

export function getGpbrvSwapperAddress(): `0x${string}` | undefined {
  const value = (process.env.NEXT_PUBLIC_GPBRV_SWAPPER_ADDRESS ?? "").trim();
  return /^0x[0-9a-fA-F]{40}$/.test(value) ? (value as `0x${string}`) : undefined;
}

export function isGpbrvSwapEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_GPBRV_SWAP === "true";
}

export const ADMIN_WHITELIST = new Set(
  [
    "0xa9FDeb97d2ACad58eC48d0406Ed2Eb6bB96CfDB5",
  ].map((a) => a.toLowerCase()),
);

export function isAdminAddress(address: string | undefined): boolean {
  if (!address) return false;
  return ADMIN_WHITELIST.has(address.toLowerCase());
}

export const attendanceAbi = [
  {
    type: "function",
    name: "createDistribution",
    inputs: [{ name: "maxClaimers", type: "uint256" }],
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelDistribution",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claim",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setConfig",
    inputs: [
      { name: "_amount", type: "uint256" },
      { name: "_period", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addCreator",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeCreator",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "distributionsCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isActive",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasClaimed",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isCreator",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "amount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "period",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rewardToken",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;

export const gpbrvSwapperAbi = [
  {
    type: "function",
    name: "configure",
    inputs: [{ name: "minipay", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minUsdmOut", type: "uint256" },
    ],
    outputs: [{ name: "usdmOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minGpbrvOut", type: "uint256" },
    ],
    outputs: [{ name: "gpbrvOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawWithMinipay",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minUsdmOut", type: "uint256" },
    ],
    outputs: [{ name: "usdmOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositWithMinipay",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minGpbrvOut", type: "uint256" },
    ],
    outputs: [{ name: "gpbrvOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "userToMinipay",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minipayToUser",
    inputs: [{ name: "minipay", type: "address" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;

export const mentoRouterAbi = [
  {
    type: "function",
    name: "getAmountsOut",
    inputs: [
      { name: "amountIn", type: "uint256" },
      {
        name: "routes",
        type: "tuple[]",
        components: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "factory", type: "address" },
        ],
      },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
  },
] as const;
