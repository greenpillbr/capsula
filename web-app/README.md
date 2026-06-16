# Capsula Web App

Next.js web UI for the Capsula Attendance contract on Celo.

## Pages

- **Create Distribution** (`/create-distribution`) — Fund the contract with GPBR and create distributions (whitelisted wallets only).
- **Claim** (`/claim`) — Claim the latest distribution.
- **Configure** (`/configure`) — Contract config and creator allowlist (authorized wallets only).
- **GPBRV Swap** (`/gpbrv-swap/*`) — Link a MiniPay wallet (`configure`), and swap GPBRV to USDM (`withdraw`) or USDM to GPBRV (`deposit`) through the `GPBRVSwapper` contract. Withdraw and Deposit are gated behind the `NEXT_PUBLIC_ENABLE_GPBRV_SWAP` feature flag and show a warning when the connected wallet is not linked.

Interactive routes use a server `page.tsx` for static translated shell and a client sibling for wallet/forms (e.g. `app/claim/Claim.tsx`, `app/configure/Configure.tsx`).

## Components

- **`HeaderWrapper`** — Server component; resolves nav labels and renders **`Header`**.
- **`Header`** — Client component; navigation, locale toggle, RainbowKit connect button.

See `AGENTS.md` for i18n conventions and full agent guidance.

## Setup

```bash
bun install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local
bun dev
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com)) |
| `NEXT_PUBLIC_GPBRV_SWAPPER_ADDRESS` | Deployed `GPBRVSwapper` address. Required for the GPBRV Swap pages. |
| `NEXT_PUBLIC_ENABLE_GPBRV_SWAP` | Set to `true` to enable the Withdraw and Deposit tabs/routes. Configure stays available regardless. |
| `NEXT_PUBLIC_CELO_RPC_URL` | Optional RPC URL. By default it is used only as a fallback after public Celo (forno). |
| `NEXT_PUBLIC_CELO_ANVIL` | When set, `NEXT_PUBLIC_CELO_RPC_URL` becomes the primary transport (e.g. `http://127.0.0.1:8545`), so the app hits a local anvil fork instead of public Celo. |

### Local fork testing

```bash
NEXT_PUBLIC_GPBRV_SWAPPER_ADDRESS=<deployed-on-fork> \
NEXT_PUBLIC_ENABLE_GPBRV_SWAP=true \
NEXT_PUBLIC_CELO_ANVIL=1 \
NEXT_PUBLIC_CELO_RPC_URL=http://127.0.0.1:8545 \
bun dev
```

## Deploy (Vercel)

1. Import the repo and set **Root Directory** to `web-app`.
2. Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel environment variables.
3. Deploy.

## Contracts (Celo mainnet)

- Attendance: `0x12bf6eB348566f2aE2c90DD919025520856236bC`
- GPBR (6 decimals): `0xd832B2F117db51021Ad0387c17182796DBEB69df`
- GPBRV (6 decimals): `0x6ec3d6e693526108990c6d5cbd2195e051321d32`
- USDM (18 decimals): `0x765de816845861e75a25fca122bb6898b8b1282a`
- GPBRVSwapper: set via `NEXT_PUBLIC_GPBRV_SWAPPER_ADDRESS` (no fixed mainnet deployment yet)
