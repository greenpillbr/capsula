import type { NextConfig } from "next";

// Kept in sync with `DEFAULT_COMMUNITY_SLUG` in lib/communities.ts by hand: this file is
// transpiled without the `@/*` path aliases, so it cannot import that module.
const DEFAULT_COMMUNITY_SLUG = "greenpillbr";

const nextConfig: NextConfig = {
  transpilePackages: ["@rainbow-me/rainbowkit"],
  // Routes gained a `/[community]/` prefix. The un-prefixed paths are configured
  // outside this repo (MiniPay Site Tester URLs, shared links), so keep them working
  // by pointing them at the original community. Temporary, hence not permanent.
  async redirects() {
    const to = `/${DEFAULT_COMMUNITY_SLUG}`;
    return [
      {
        source: "/registrar-presenca",
        destination: `${to}/registrar-presenca`,
        permanent: false,
      },
      { source: "/resgatar", destination: `${to}/resgatar`, permanent: false },
      {
        source: "/gpbrv-swap/:path*",
        destination: `${to}/gpbrv-swap/:path*`,
        permanent: false,
      },
      {
        source: "/configure/:path*",
        destination: `${to}/registrar-presenca/configurar`,
        permanent: false,
      },
      {
        source: "/create-distribution/:path*",
        destination: `${to}/registrar-presenca/configurar`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
