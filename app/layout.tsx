import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader, Source_Serif_4 } from "next/font/google";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

// Commit Mono is not on Google Fonts; the latin woff2 files are vendored from @fontsource/commit-mono (OFL 1.1).
const commitMono = localFont({
  variable: "--font-commit-mono",
  src: [
    { path: "./fonts/commit-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/commit-mono-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/commit-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/commit-mono-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});
// Interface and general copy (--font-ui), and deep reading (--font-text); see globals.css.
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"], style: ["normal", "italic"] });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], style: ["normal", "italic"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

/*
 * Defaults for every page. Next replaces nested objects (openGraph, twitter) rather than merging them, so a page
 * that changes its title also sets its own openGraph and twitter; canonical URLs are per page for the same
 * reason (one set here would point every page at the homepage).
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.org, url: site.orgUrl }],
  creator: site.org,
  publisher: site.org,
  keywords: [
    "Turflang",
    "Turf Project",
    "programming languages",
    "compilers",
    "compiler diagnostics",
    "error messages",
    "language design",
    "LLM code generation",
    "program repair",
    "human studies",
  ],
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: site.name,
    description: site.description,
    images: [site.ogImage],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: [site.ogImage] },
};

export const viewport: Viewport = {
  // Light is the default whatever the system prefers; dark is opt-in through the toggle.
  themeColor: "#f4eee2",
};

/*
 * Runs before first paint so a reader who chose dark never sees a flash of the light default. It only sets an attribute; the tokens in
 * globals.css follow it. Kept tiny and inline because an external script would arrive after the first paint.
 */
const themeScript = `try{var d=document.documentElement;if(localStorage.getItem("turf-theme")==="dark")d.dataset.theme="dark";}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script sets data-theme before React hydrates, so the attribute legitimately differs.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${commitMono.variable} ${newsreader.variable} ${sourceSerif.variable} ${hanken.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        {children}
      </body>
    </html>
  );
}
