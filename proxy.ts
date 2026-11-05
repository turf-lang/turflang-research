import { NextResponse, type NextRequest } from "next/server";
import { findArticle } from "@/lib/articles";

/*
 * Unknown article slugs get a real 404 here, before rendering. The page calls notFound() too, but with partial
 * prerendering the static shell has already been sent with a 200 by then, so search engines would see a "soft
 * 404" and the client has to re-render the document. Rewriting to a path no route matches renders
 * app/not-found.tsx with status 404; the browser keeps the address the reader typed.
 */
export function proxy(req: NextRequest) {
  const slug = /^\/research\/([^/]+)\/?$/.exec(req.nextUrl.pathname)?.[1];
  if (!slug || findArticle(decodeURIComponent(slug))) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_missing", req.url), { status: 404 });
}

export const config = {
  // Article pages only; everything else on the site is static and never runs this.
  matcher: ["/research/:slug"],
};
