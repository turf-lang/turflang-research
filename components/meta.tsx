import { Fragment, type ReactNode } from "react";

/*
 * A row of metadata ("Engineering · Compilers and analysis · November 5, 2026"). The separator is a drawn 3px
 * dot in a flex gap rather than a "·" typed between words: the glyph's side bearings differ per font, so typed
 * dots sat closer to one word than the other, and wrapped rows could start with an orphaned dot.
 */
export function Meta({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  const shown = items.filter((x) => x !== null && x !== undefined && x !== false && x !== "");
  return (
    <p className={`meta ${className}`}>
      {shown.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="meta-sep" aria-hidden />}
          <span>{item}</span>
        </Fragment>
      ))}
    </p>
  );
}

/** A small label. Sits in flex rows only, never inside running text, so it cannot push lines apart. */
export function Tag({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "accent" | "warn" }) {
  return (
    <span className="tag" data-tone={tone}>
      {children}
    </span>
  );
}
