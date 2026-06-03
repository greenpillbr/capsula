<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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

**Pattern for interactive pages:** server `page.tsx` renders static translated shell (title, descriptions); a `*PageClient.tsx` sibling handles wallet/forms with `useTranslation()`.

| Server (`getServerTranslations`) | Client (`useTranslation`) |
|----------------------------------|---------------------------|
| `app/page.tsx` | `app/*/ClaimPageClient.tsx`, etc. |
| `app/*/page.tsx` (titles, static copy) | `components/HeaderClient.tsx` |
| `components/Header.tsx` (nav labels) | `components/Providers.tsx`, `TxButton` |
| `app/layout.tsx` (`generateMetadata`, `<html lang>`) | |

`lib/i18n/server.ts` imports `next/headers` — **never import it from client components**.

### Components

- **`Header`:** server component; resolves nav labels with `getServerTranslations()`.
- **`HeaderClient`:** client; pathname highlighting, PT/EN toggle, RainbowKit connect button.
- **`TxButton`:** client; receives all label strings as props (`label`, `pendingLabel`, `successLabel`, `errorLabel`) — no i18n hook inside.

### Untranslated strings

Keep these as-is (product/brand, not locale copy):

- Logo alt text: `"Capsula"`
- RainbowKit / wagmi app name in `lib/wagmi.ts`: `"Capsule Admin"`
- ABI / contract function names in `lib/contracts.ts`

RainbowKit wallet UI strings come from its own `locale` prop (`pt-BR` / `en-US`), wired in `components/Providers.tsx`.
