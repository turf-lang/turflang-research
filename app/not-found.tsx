import type { Metadata } from "next";
import { NotFoundBody } from "@/components/not-found-body";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

/* Unmatched URLs. No layout wraps this boundary, so it brings the site header and footer itself. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container-page">
        <NotFoundBody />
      </main>
      <SiteFooter />
    </>
  );
}
