<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Documentation

**Always read `AGENTS.md` and `README.md` at the start of a task** that touches structure, naming, pages, or setup. When you rename files, add pages, or change conventions, **update both files** so they stay accurate.

## TokenDistributor (dual instances)

The app talks to two `TokenDistributor` deployments on Celo:

- **GPBR** — `ATTENDANCE_ADDRESS` in `lib/contracts.ts` (legacy Attendance deployment; same ABI).
- **Good Dollar (G$)** — `TOKEN_DISTRIBUTOR_ADDRESS` in `lib/contracts.ts` (deploy via `smart-contracts/ignition/modules/TokenDistributor.ts`).

`lib/contracts.ts` exports `DistributorToken`, `GPBR_DISTRIBUTOR`, and `GOOD_DOLLAR_DISTRIBUTOR` (contract address, reward token, decimals, symbol). Shared ABI: `attendanceAbi`.

### Claim routes

- `/registrar-presenca` — GPBR attendance (`ClaimForm` + `registerAttendance.*` i18n keys).
- `/resgatar` — Good Dollar claim (`ClaimForm` + `resgatar.*` keys).
- Shared form: `app/claim/ClaimForm.tsx`.

### Admin routes (tabbed subpages)

- `/create-distribution/gpbr` and `/create-distribution/good-dollar` — `CreateDistributionPageClient` receives a `DistributorToken` and fund-description key.
- `/configure/gpbr` and `/configure/good-dollar` — `Configure` receives a `DistributorToken`.
- Root `/create-distribution` and `/configure` redirect to the GPBR tab.

Header nav: **Registrar presença**, **Resgatar**; settings menu links to GPBR admin tabs by default.

## GPBRV Swap section

`app/gpbrv-swap/` hosts the `GPBRVSwapper` UI. A client `layout.tsx` renders **four** top-level tabs:

| Tab | Route | Contract call |
|---|---|---|
| Depositar | `/gpbrv-swap/deposit` | `deposit` |
| Sacar | `/gpbrv-swap/withdraw` | `withdraw`, or `withdrawWithMinipay` when the MiniPay checkbox is on |
| Configurar | `/gpbrv-swap/configure` | `configure` |
| MiniPay | `/gpbrv-swap/minipay/*` | see below |

- **Single-wallet flow** — `deposit` / `withdraw` share `DirectSwapForm.tsx`. **No `configure` step is required.** In `withdraw` mode the form also offers a checkbox that redirects the stablecoin to the caller's linked MiniPay wallet by calling `withdrawWithMinipay` instead of `withdraw`; it is disabled until `userToMinipay[address]` is set. `withdrawWithMinipay` pulls GPBRV from the caller, so it can only be sent by the *main* wallet — that is why it lives here and not under the MiniPay tab.
- **Stablecoin selector** — deposit, withdraw, and the MiniPay deposit form all render `TokenSelector.tsx` to pick the stable side (USDM / USDC / USDT, from `SWAP_STABLES` in `lib/contracts.ts`, logos in `public/tokens/`). The selected stable's address is passed as the trailing arg to every `deposit`/`withdraw`/`*WithMinipay` call. USDC/USDT (6 decimals) route via the contract's 2-hop path; USDM (18) is single-hop.
- **Slippage & minimum received** — the minimum-received field is read-only and computed from the live Mento quote minus the 5% Sarafu fee minus the slippage buffer. Slippage (default 5%, `SLIPPAGE_BPS`) is the editable knob via `SlippageControl.tsx` (gear icon → inline percent input). `useEstimatedMin` takes the selected stable and the slippage bps.
- **MiniPay tab** — `app/gpbrv-swap/minipay/` with a segmented sub-nav (`MinipayGate.tsx`) over `deposit` (`MinipayDepositForm.tsx` → `depositWithMinipay`) and `configure` (`ConfigureFromMinipay.tsx` → `configureFromMinipay`, where the input is the *main wallet* address). Both require the connected wallet to be the MiniPay wallet.
- `MinipayGate.tsx` blocks the sub-section when `useIsMiniPay()` is `false`, showing how to open the page from inside MiniPay plus a link to `/gpbrv-swap/configure` when the wallet has no link yet. While detection is pending (`undefined`) it renders the children, so nobody sees a flash of the fallback.

`Panel.tsx` is the shared section card.

- The top-level nav link lives in `components/HeaderWrapper.tsx` (`navLinks`) and points at `/gpbrv-swap/configure`.
- Contract bindings, token addresses, the deployed `GPBRV_SWAPPER_ADDRESS` constant (exposed via the `getGpbrvSwapperAddress()` helper), and the `GPBRV_SWAP_ENABLED` feature flag (via `isGpbrvSwapEnabled()`) are in `lib/contracts.ts`. The ABI exposes `deposit`/`withdraw` (single wallet), `depositWithMinipay`/`withdrawWithMinipay`, and both link entry points `configure`/`configureFromMinipay`.
- Feature flag: `GPBRV_SWAP_ENABLED` in `lib/contracts.ts` unblocks the swap routes (server `page.tsx`). Both Configure pages (main-wallet and MiniPay) are always available.
- `GPBRV_SWAPPER_ADDRESS` in `lib/contracts.ts` holds the deployed contract address, alongside the other Celo addresses. Update it after redeploying the swapper.
- The MiniPay deposit page shows an amber warning and disables inputs when the connected wallet is not registered (`minipayToUser`). Forms compute a **read-only** minimum-received field from a live on-chain Mento router quote, adjusted for the 5% Sarafu pool fee and the editable slippage buffer (default 5%, `SLIPPAGE_BPS`). Quote logic lives in `app/gpbrv-swap/useEstimatedMin.ts` (parametrized by the selected stable + slippage bps); Mento/BRLM/USDC/USDT addresses and ABIs are in `lib/contracts.ts`. For USDC/USDT the quote uses the 2-hop route BRLM↔USDM↔stable. The deposit estimate stays correct under the contract's `deductFee` swap: taking 5% off the BRLM input is proportionally identical to taking it off the GPBRV output.

## MiniPay

MiniPay is a mobile-only in-app browser on Celo. Three pieces of plumbing support it:

- **`lib/useIsMiniPay.ts`** — reads `window.ethereum?.isMiniPay` in an effect and returns `boolean | undefined`; `undefined` until the effect runs, so server render and first paint agree.
- **`components/Providers.tsx`** — `MiniPayAutoConnect` connects the `injected` connector automatically when MiniPay is detected (the connection is implicit there). `lib/wagmi.ts` spells out the RainbowKit wallet list including `injectedWallet` so that connector always exists.
- **`components/Header.tsx`** — hides the RainbowKit `ConnectButton` inside MiniPay, as the Celo docs require.

`app/layout.tsx` exports an explicit `viewport` (`width=device-width, initialScale=1`). Swap inputs use `h-12 text-base` (16px avoids iOS focus zoom) and the tab row scrolls horizontally on narrow screens. Testing on a real device goes through MiniPay's **Site Tester** (Developer Settings) pointed at an ngrok tunnel — the Android emulator cannot be used.

## UI libraries

### shadcn/ui

**Always read and follow the shadcn tooling before creating, adding, composing, styling, or fixing UI components** — do not hand-roll primitives or copy registry files from memory. In Cursor, load the `shadcn` skill (`SKILL.md`) at the start of any UI task; in Claude Code the equivalent is the `shadcn` MCP server declared in the repo-root `.mcp.json`. Either way use the same workflow: check installed components (`bunx shadcn@latest info`), fetch docs (`bunx shadcn@latest docs <component>`), add via CLI, then compose using the documented patterns and critical rules.

UI primitives live under `components/ui/`. Configuration is in `components.json` (style: **base-nova**, RSC enabled, CSS variables in `app/globals.css`).

- **Add a component:** `bunx shadcn@latest add <name>` (e.g. `dropdown-menu`, `button`, `tooltip`).
- **Prefer the CLI** over hand-copying registry files so versions and Base UI APIs stay aligned.
- **Imports:** `@/components/ui/<component>`; merge class names with `cn()` from `@/lib/utils`.
- **Primitives:** shadcn components here use [**Base UI**](https://base-ui.com) (`@base-ui/react`), not Radix. Triggers/items often support a `render` prop to compose with other elements (e.g. shadcn `Button` as `DropdownMenuTrigger`).
- **TooltipProvider:** optional for a single tooltip; add locally around tooltip groups when multiple adjacent tooltips need shared open delay (see shadcn tooltip install docs).

`app/globals.css` imports `shadcn/tailwind.css` and `tw-animate-css`; theme tokens (`--primary`, `--border`, etc.) are defined on `:root`. Page-level Tailwind (e.g. `text-green-600` in the header) can coexist with shadcn tokens.

**Currently installed:** `button`, `card`, `dropdown-menu`, `separator`, `tooltip`.

The home page (`app/page.tsx`) uses `HomeSection` for hero blocks and shadcn `Card` + `Separator` for the resources list.

### Icons

| Library | Use |
|---------|-----|
| **react-icons** | App chrome and custom UI (e.g. `HiOutlineCog6Tooth` from `react-icons/hi2` in `Header`). Import from the package subpath for the set you need. |
| **lucide-react** | Icons inside shadcn-generated `components/ui/*` (default in `components.json` `iconLibrary`). Do not replace those with react-icons unless you are intentionally customizing a shadcn file. |

### Supporting utilities

- **`class-variance-authority`**, **`clsx`**, **`tailwind-merge`** — variants and `cn()` helper.
- **`shadcn`** (dev dependency) — CLI only; not imported in app code.

## Internationalization (i18n)

The web-app supports **Brazilian Portuguese (`pt-BR`)** and **English (`en`)**. There is no third-party i18n library — translations live in typed string files under `lib/i18n/`.

### Locales and detection

- **Default locale:** `pt-BR`
- **Supported locales:** `pt-BR`, `en`
- **Detection order (server):** `capsula-locale` cookie → `Accept-Language` header (`en*` → `en`, otherwise `pt-BR`)
- **Detection order (client):** `localStorage` → cookie → `navigator.language` (same `en*` rule)
- **Persistence:** choosing a language in the header writes to `localStorage`, a cookie, and `document.documentElement.lang`, then calls `router.refresh()` so server-rendered content updates.

### File layout

```
lib/i18n/
├── types.ts              # Locale type, TranslationKey union, DEFAULT_LOCALE, STORAGE_KEY
├── pt-BR.ts              # Portuguese strings
├── en.ts                 # English strings
├── index.ts              # translations map, detectLocale(), RainbowKit locale helper
├── server.ts             # getRequestLocale(), getServerTranslations() (server only)
├── persist.ts            # persistLocale() — syncs cookie/localStorage/html lang (client)
└── LanguageProvider.tsx  # React context + useTranslation() hook (client)
```

### Adding or changing strings

1. Add the key to the `TranslationKey` union in `lib/i18n/types.ts`.
2. Add the string to **both** `lib/i18n/pt-BR.ts` and `lib/i18n/en.ts`.
3. Use the key via `t("your.key")` — never hardcode user-facing copy in components or pages.

Key naming convention: `section.name` (e.g. `claim.title`, `configure.errorInvalidAddress`, `common.yes`).

### Server vs client

Prefer **server-side** translations when the component does not need hooks or browser APIs:

```tsx
import { getServerTranslations } from "@/lib/i18n/server";

export default async function MyPage() {
  const { t } = await getServerTranslations();
  return <h1>{t("claim.title")}</h1>;
}
```

Use **`useTranslation()`** from `lib/i18n/LanguageProvider` only in client components (`"use client"`) that need interactivity, wagmi, or live locale updates (e.g. form validation messages, dynamic contract UI).

**Pattern for interactive pages:** server `page.tsx` renders static translated shell (title, descriptions); a client sibling (e.g. `ClaimForm.tsx`, `Configure.tsx`) handles wallet/forms with `useTranslation()`.

| Server (`getServerTranslations`) | Client (`useTranslation`) |
|----------------------------------|---------------------------|
| `app/page.tsx` | `app/claim/ClaimForm.tsx`, `app/configure/Configure.tsx`, etc. |
| `app/*/page.tsx` (titles, static copy) | `components/Header.tsx` |
| `components/HeaderWrapper.tsx` (nav labels) | `components/Providers.tsx`, `TxButton` |
| `app/layout.tsx` (`generateMetadata`, `<html lang>`) | |

`lib/i18n/server.ts` imports `next/headers` — **never import it from client components**.

### Components

- **`HeaderWrapper`:** server component; resolves main nav, tools menu, and settings menu labels with `getServerTranslations()` and renders `Header`.
- **`Header`:** client; **Registrar presença** and **Resgatar** nav links, **Ferramentas** tools dropdown (external links with shadcn `Tooltip`), settings **gear dropdown** (Create Distribution, Configure via shadcn `DropdownMenu` + react-icons), logo links home, pathname highlighting, PT/EN toggle, RainbowKit connect button. Uses `useTranslation()` for locale toggle and `nav.settingsMenu` aria-label.
- **`TxButton`:** client; receives all label strings as props (`label`, `pendingLabel`, `successLabel`, `errorLabel`) — no i18n hook inside.

### Untranslated strings

Keep these as-is (product/brand, not locale copy):

- Logo alt text: `"Capsula"`
- RainbowKit / wagmi app name in `lib/wagmi.ts`: `"Capsule Admin"`
- ABI / contract function names in `lib/contracts.ts`

RainbowKit wallet UI strings come from its own `locale` prop (`pt-BR` / `en-US`), wired in `components/Providers.tsx`.
