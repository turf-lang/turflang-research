import type { ReactNode } from "react";

/*
 * Blocks an article can use beyond plain Markdown. Kept few on purpose: an article should read as prose, and
 * every new block is one more thing every future article has to look right next to.
 */

/** An image or diagram with a caption. `wide` lets it break out of the text column on large screens. */
export function Figure({
  src,
  alt,
  caption,
  wide = false,
  children,
}: {
  src?: string;
  alt?: string;
  caption?: ReactNode;
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <figure className={wide ? "figure figure-wide" : "figure"}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static files on Workers; there is no optimiser */}
      {src ? <img src={src} alt={alt ?? ""} loading="lazy" /> : children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

const noteLabel = { note: "note", help: "help", warning: "warning" } as const;

/**
 * An aside, labelled the way the compiler labels its own notes. The label is a word, not a colour alone, so it
 * reads the same to anyone who cannot tell the colours apart.
 */
export function Note({ kind = "note", children }: { kind?: keyof typeof noteLabel; children: ReactNode }) {
  return (
    <aside className="note" data-kind={kind}>
      <span className="note-label">{noteLabel[kind]}</span>
      <div className="note-body">{children}</div>
    </aside>
  );
}
