export const ATTENDANCE_ADDRESS =
  "0xb6c34871AFB61Fd07B850d14E9FC573600c4B08C" as const;

export const GPBR_ADDRESS =
  "0xd832B2F117db51021Ad0387c17182796DBEB69df" as const;

export const GPBR_DECIMALS = 6;

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
