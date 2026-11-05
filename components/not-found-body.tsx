import Link from "next/link";
import { MissingPath } from "@/components/missing-path";

/*
 * The 404 content, shared by two boundaries: app/not-found.tsx (unmatched URLs, which get no layout and so add
 * the site chrome themselves), and the (site) boundary for notFound() calls, which renders inside a layout that
 * already has a header. Callers supply the page container. Set the way turfc prints an error, the voice of the whole site.
 */
export function NotFoundBody() {
  return (
    <div className="pt-16 pb-8 sm:pt-20 md:pt-28">
      <p className="eyebrow rise">404</p>
      <h1
        className="display rise mt-5 max-w-[16ch] text-[44px] sm:text-[56px] md:text-[72px]"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        Nothing compiles at this address.
      </h1>
      <div className="rise mt-10 max-w-[720px]" style={{ "--i": 2 } as React.CSSProperties}>
        <MissingPath />
      </div>
      <div className="rise mt-10 flex flex-wrap gap-3" style={{ "--i": 3 } as React.CSSProperties}>
        <Link href="/" className="btn btn-primary">
          Back to the homepage
        </Link>
        <Link href="/research" className="btn btn-ghost">
          All research
        </Link>
      </div>
    </div>
  );
}
