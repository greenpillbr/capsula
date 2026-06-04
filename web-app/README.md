# Capsula Web App

Next.js web UI for the Capsula Attendance contract on Celo.

## Pages

- **Create Distribution** (`/create-distribution`) — Fund the contract with GPBR and create distributions (whitelisted wallets only).
- **Claim** (`/claim`) — Claim the latest distribution.
- **Configure** (`/configure`) — Contract config and creator allowlist (authorized wallets only).

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

## Deploy (Vercel)

1. Import the repo and set **Root Directory** to `web-app`.
2. Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel environment variables.
3. Deploy.

## Contracts (Celo mainnet)

- Attendance: `0x12bf6eB348566f2aE2c90DD919025520856236bC`
- GPBR (6 decimals): `0xd832B2F117db51021Ad0387c17182796DBEB69df`
