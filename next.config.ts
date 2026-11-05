import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const dev = process.env.NODE_ENV !== "production";
// Vercel injects its comment toolbar (vercel.live) into preview deployments only; production never loads it.
const preview = process.env.VERCEL_ENV === "preview";
const live = preview ? " https://vercel.live" : "";

/*
 * The site loads nothing from another origin: fonts are self-hosted by next/font, KaTeX renders at build time,
 * covers are files in public/. So the policy is 'self' everywhere, and a new third-party embed fails loudly here
 * instead of quietly adding a tracker.
 *
 * 'unsafe-inline' for scripts is deliberate: the pages are prerendered, and a nonce would make every page dynamic
 * (Next can only add a nonce per request). The inline scripts are Next's own bootstrap and the theme script in
 * app/layout.tsx; with no user content and no third-party script, there is nothing for an injection to ride on.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}${live}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:" + live,
  "font-src 'self'" + live,
  "connect-src 'self'" + (preview ? " https://vercel.live wss://ws-us3.pusher.com" : ""),
  "frame-src " + (preview ? "https://vercel.live" : "'none'"),
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

/*
 * Articles are MDX (content/articles). Plugins are named by string because Turbopack runs the MDX loader in Rust
 * and cannot take JavaScript functions. KaTeX renders at build time, so article pages ship HTML and the
 * stylesheet, never the KaTeX runtime; `throwOnError` makes a typo in a formula fail the build instead of
 * publishing red source text.
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-math"],
    rehypePlugins: ["rehype-slug", ["rehype-katex", { throwOnError: true, strict: "ignore" }]],
  },
});

export default withMDX(nextConfig);
