export const ATTENDANCE_ADDRESS =
  "0x12bf6eB348566f2aE2c90DD919025520856236bC" as const;

/** Good Dollar TokenDistributor — update after deploying ignition/modules/TokenDistributor.ts */
export const TOKEN_DISTRIBUTOR_ADDRESS =
  "0xfE635634A0093bc6E0C8fc02424Aba04e8cB9267" as const;

export const GPBR_ADDRESS =
  "0xd832B2F117db51021Ad0387c17182796DBEB69df" as const;

export const GPBR_DECIMALS = 6;

export const GOOD_DOLLAR_ADDRESS =
  "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A" as const;

export const GOOD_DOLLAR_DECIMALS = 18;

export type DistributorToken = {
  contractAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  decimals: number;
  symbol: string;
};

export const GPBR_DISTRIBUTOR: DistributorToken = {
  contractAddress: ATTENDANCE_ADDRESS,
  tokenAddress: GPBR_ADDRESS,
  decimals: GPBR_DECIMALS,
  symbol: "GPBR",
};

export const GOOD_DOLLAR_DISTRIBUTOR: DistributorToken = {
  contractAddress: TOKEN_DISTRIBUTOR_ADDRESS,
  tokenAddress: GOOD_DOLLAR_ADDRESS,
  decimals: GOOD_DOLLAR_DECIMALS,
  symbol: "G$",
};

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

// GPBRVSwapper bindings. Deployed on Celo mainnet via
// smart-contracts/ignition/modules/GPBRVSwapper.ts — update after redeploying.
export const GPBRV_SWAPPER_ADDRESS =
  "0x126514F2A10e8B10F70c66aeFE9886C7129a727D" as const;

/** Feature flag that unblocks the GPBRV swap routes. */
export const GPBRV_SWAP_ENABLED = true;

export const GPBRV_ADDRESS =
  "0x6ec3d6e693526108990c6d5cbd2195e051321d32" as const;

export const USDM_ADDRESS =
  "0x765de816845861e75a25fca122bb6898b8b1282a" as const;

export const USDC_ADDRESS =
  "0xceba9300f2b948710d2653dd7b07f33a8b32118c" as const;

export const USDT_ADDRESS =
  "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as const;

export const BRLM_ADDRESS =
  "0xe8537a3d056da446677b9e9d6c5db704eaab4787" as const;

export const MENTO_ROUTER_ADDRESS =
  "0x4861840C2EfB2b98312B0aE34d86fD73E8f9B6f6" as const;

/** Mento factory for the BRLM <-> USDM (cUSD) pool. */
export const MENTO_FACTORY_ADDRESS =
  "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3" as const;

/** Mento factory for the USDM <-> USDC and USDM <-> USDT pools (2-hop stables). */
export const STABLE_CUSD_FACTORY_ADDRESS =
  "0xa849b475FE5a4B5C9C3280152c7a1945b907613b" as const;

export const GPBRV_DECIMALS = 6;
export const USDM_DECIMALS = 18;
export const USDC_DECIMALS = 6;
export const USDT_DECIMALS = 6;
export const BRLM_DECIMALS = 18;

/**
 * Stablecoins the swapper can convert GPBRV to/from. USDM is the native Mento
 * counterpart (single BRLM<->USDM hop); the others route through USDM via
 * `cusdFactory` (BRLM<->USDM<->stable). Logos live in `public/tokens/`.
 */
export type SwapStable = {
  address: `0x${string}`;
  decimals: number;
  symbol: string;
  image: string;
  /** Mento factory of the USDM<->stable pool; undefined for USDM (native hop). */
  cusdFactory?: `0x${string}`;
};

export const SWAP_STABLES: SwapStable[] = [
  {
    address: USDM_ADDRESS,
    decimals: USDM_DECIMALS,
    symbol: "USDM",
    image: "/tokens/usdm.png",
  },
  {
    address: USDC_ADDRESS,
    decimals: USDC_DECIMALS,
    symbol: "USDC",
    image: "/tokens/usdc.png",
    cusdFactory: STABLE_CUSD_FACTORY_ADDRESS,
  },
  {
    address: USDT_ADDRESS,
    decimals: USDT_DECIMALS,
    symbol: "USDT",
    image: "/tokens/usdt.png",
    cusdFactory: STABLE_CUSD_FACTORY_ADDRESS,
  },
];

export const DEFAULT_SWAP_STABLE = SWAP_STABLES[0]!;

/** Fixed 5% fee charged by the Sarafu swap pool on GPBRV <-> BRLM swaps. */
export const SARAFU_FEE_BPS = BigInt(500);

/** Default slippage buffer applied on top of the live Mento quote. */
export const SLIPPAGE_BPS = BigInt(500);

export const BPS_DENOMINATOR = BigInt(10_000);

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
    name: "configureFromMinipay",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minStableOut", type: "uint256" },
      { name: "stable", type: "address" },
    ],
    outputs: [{ name: "stableOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minGpbrvOut", type: "uint256" },
      { name: "stable", type: "address" },
    ],
    outputs: [{ name: "gpbrvOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawWithMinipay",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minStableOut", type: "uint256" },
      { name: "stable", type: "address" },
    ],
    outputs: [{ name: "stableOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositWithMinipay",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minGpbrvOut", type: "uint256" },
      { name: "stable", type: "address" },
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
