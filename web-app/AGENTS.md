<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Documentation

**Always read `AGENTS.md` and `README.md` at the start of a task** that touches structure, naming, pages, or setup. When you rename files, add pages, or change conventions, **update both files** so they stay accurate.

## GPBRV Swap section

`app/gpbrv-swap/` hosts the `GPBRVSwapper` UI. It uses a client `layout.tsx` that renders sub-navigation tabs and five routes (each a server `page.tsx` plus a client component):

- **Single-wallet (simpler) flow** — `swap-deposit`, `swap-withdraw`. Both use the shared `DirectSwapForm.tsx` and call the contract's `deposit` / `withdraw` (caller spends one token and receives the other in the same wallet). **No `configure` step is required.**
- **MiniPay-linked flow** — `configure`, `withdraw`, `deposit`. Withdraw/Deposit use the shared `SwapForm.tsx` and call `withdrawWithMinipay` / `depositWithMinipay`, which require a prior `configure` link.

`Panel.tsx` is the shared section card.

- The top-level nav link lives in `components/HeaderWrapper.tsx` (`navLinks`) and points at `/gpbrv-swap/configure`.
- Contract bindings, token addresses, the `getGpbrvSwapperAddress()` env helper, and the `isGpbrvSwapEnabled()` feature flag helper are in `lib/contracts.ts`. The ABI exposes both `deposit`/`withdraw` (single wallet) and `depositWithMinipay`/`withdrawWithMinipay` (MiniPay).
- Feature flag: `NEXT_PUBLIC_ENABLE_GPBRV_SWAP=true` reveals all swap tabs except Configure (sub-layout) and unblocks those routes (server `page.tsx`). Configure is always available.
- `NEXT_PUBLIC_GPBRV_SWAPPER_ADDRESS` supplies the deployed contract address; pages show a notice when it is unset.
- The MiniPay Withdraw/Deposit pages show an amber warning and disable inputs when the connected wallet is not linked (`userToMinipay` for withdraw, `minipayToUser` for deposit). The single-wallet pages have no such gate. Both pre-fill the minimum-received field from a live on-chain Mento router quote, adjusted for the 5% Sarafu pool fee and 6% slippage buffer (editable). Quote logic lives in `app/gpbrv-swap/useEstimatedMin.ts`; Mento/BRLM addresses and ABIs are in `lib/contracts.ts`.

## UI libraries

### shadcn/ui

**Always read and follow the shadcn skill before creating, adding, composing, styling, or fixing UI components.** In Cursor, load the `shadcn` skill (`SKILL.md`) at the start of any UI task — do not hand-roll primitives or copy registry files from memory. Use the skill's workflow: check installed components (`bunx shadcn@latest info`), fetch docs (`bunx shadcn@latest docs <component>`), add via CLI, then compose using the documented patterns and critical rules.

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

**Pattern for interactive pages:** server `page.tsx` renders static translated shell (title, descriptions); a client sibling (e.g. `Claim.tsx`, `Configure.tsx`) handles wallet/forms with `useTranslation()`.

| Server (`getServerTranslations`) | Client (`useTranslation`) |
|----------------------------------|---------------------------|
| `app/page.tsx` | `app/claim/Claim.tsx`, `app/configure/Configure.tsx`, etc. |
| `app/*/page.tsx` (titles, static copy) | `components/Header.tsx` |
| `components/HeaderWrapper.tsx` (nav labels) | `components/Providers.tsx`, `TxButton` |
| `app/layout.tsx` (`generateMetadata`, `<html lang>`) | |

`lib/i18n/server.ts` imports `next/headers` — **never import it from client components**.

### Components

- **`HeaderWrapper`:** server component; resolves main nav, tools menu, and settings menu labels with `getServerTranslations()` and renders `Header`.
- **`Header`:** client; Claim link, **Ferramentas** tools dropdown (external links with shadcn `Tooltip`), settings **gear dropdown** (Create Distribution, Configure via shadcn `DropdownMenu` + react-icons), logo links home, pathname highlighting, PT/EN toggle, RainbowKit connect button. Uses `useTranslation()` for locale toggle and `nav.settingsMenu` aria-label.
- **`TxButton`:** client; receives all label strings as props (`label`, `pendingLabel`, `successLabel`, `errorLabel`) — no i18n hook inside.

### Untranslated strings

Keep these as-is (product/brand, not locale copy):

- Logo alt text: `"Capsula"`
- RainbowKit / wagmi app name in `lib/wagmi.ts`: `"Capsule Admin"`
- ABI / contract function names in `lib/contracts.ts`

RainbowKit wallet UI strings come from its own `locale` prop (`pt-BR` / `en-US`), wired in `components/Providers.tsx`.
