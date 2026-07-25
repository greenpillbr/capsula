# Capsula Web App

Next.js web UI for Capsula: a customizable framework for community management with decentralized power, running on Celo.

## Communities (multi-tenant)

Capsula hosts several communities. `/` is the community selector; everything else lives under `/[community]/…`, and that first path segment is the only thing that decides which instance is active.

| Community | Slug | Features |
|---|---|---|
| GreenPillBR | `greenpillbr` | Attendance, Resgatar, Swap, Ferramentas |
| GrowEcossistemas | `grow` | Attendance (contract not deployed yet) |

Instances are configured in **`lib/communities.ts`** — enabled features, contract addresses, logo, description, home content and tools links. Adding a community is a data change there plus a logo in `public/communities/` and two i18n strings. Addresses themselves stay in `lib/contracts.ts`.

## Pages

- **Community selector** (`/`) — Capsula's pitch plus a card per community.
- **Community home** (`/[community]`) — that community's intro, meeting info and useful links.
- **Register attendance** (`/[community]/registrar-presenca`) — Register attendance for the latest distribution. Gear icon → `…/configurar`.
- **Claim** (`/[community]/resgatar`) — Claim Good Dollar (G$) from the latest distribution. Gear icon → `…/configurar`.
- **Distributor admin** (`/[community]/{registrar-presenca,resgatar}/configurar`) — Per feature, on one page: fund the contract, create distributions, set the reward config, and manage the creator allowlist (authorized wallets only).
- **GPBRV Swap** (`/[community]/gpbrv-swap/*`) — Four tabs over the `GPBRVSwapper` contract:
  - `/[community]/gpbrv-swap/deposit` — spend a stablecoin, receive GPBRV in the same wallet.
  - `/[community]/gpbrv-swap/withdraw` — spend GPBRV, receive the stablecoin in the same wallet; optionally send it to a linked MiniPay wallet instead.
  - `/[community]/gpbrv-swap/configure` — link a MiniPay wallet from your main wallet.
  - `/[community]/gpbrv-swap/minipay/*` — the MiniPay-only section (deposit + link your main wallet). Usable only inside the MiniPay in-app browser; elsewhere it explains how to get there.

A route 404s when the community does not enable its feature; when the feature is on but the contract is still `null`, the page shows a "not deployed yet" notice instead of the form. The old un-prefixed URLs redirect to `greenpillbr` (see `next.config.ts`).

Interactive routes use a server `page.tsx` for the static translated shell and a client sibling for wallet/forms (e.g. `app/claim/ClaimForm.tsx`, `app/[community]/distributor-admin/ConfigurePanels.tsx`).

## Components

- **`AppShell`** — Server component; header + `<main>` + footer chrome, rendered below the root layout so the header can know the active community.
- **`HeaderWrapper`** — Server component; takes a `CommunityConfig | null`, resolves that community's nav labels, and renders **`Header`**.
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
| `NEXT_PUBLIC_CELO_RPC_URL` | Optional RPC URL. By default it is used only as a fallback after public Celo (forno). |
| `NEXT_PUBLIC_CELO_ANVIL` | When set, `NEXT_PUBLIC_CELO_RPC_URL` becomes the primary transport (e.g. `http://127.0.0.1:8545`), so the app hits a local anvil fork instead of public Celo. |

### Local fork testing

Point a community's `contracts` at the fork deployment in `lib/communities.ts` (or edit the address in `lib/contracts.ts`), then:

```bash
NEXT_PUBLIC_CELO_ANVIL=1 \
NEXT_PUBLIC_CELO_RPC_URL=http://127.0.0.1:8545 \
bun dev
```

## Deploy (Vercel)

1. Import the repo and set **Root Directory** to `web-app`.
2. Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel environment variables.
3. Deploy.

## Contracts (Celo mainnet)

- GPBR TokenDistributor (`ATTENDANCE_ADDRESS`): `0x12bf6eB348566f2aE2c90DD919025520856236bC`
- Good Dollar TokenDistributor (`TOKEN_DISTRIBUTOR_ADDRESS`): update in `lib/contracts.ts` after deploying `ignition/modules/TokenDistributor.ts`
- GPBR (6 decimals): `0xd832B2F117db51021Ad0387c17182796DBEB69df`
- Good Dollar / G$ (18 decimals): `0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A`
- GPBRV (6 decimals): `0x6ec3d6e693526108990c6d5cbd2195e051321d32`
- USDM (18 decimals): `0x765de816845861e75a25fca122bb6898b8b1282a`
- GPBRVSwapper (`GPBRV_SWAPPER_ADDRESS`): `0x126514F2A10e8B10F70c66aeFE9886C7129a727D` — update in `lib/contracts.ts` after redeploying
