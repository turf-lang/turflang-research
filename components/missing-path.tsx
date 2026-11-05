"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};
const host = "research.turflang.org";

/*
 * The missing address, reported the way turfc reports an unknown name (copied from a real `turfc` run: the
 * "── error at" header with its code and category, the "I can't find" sentence, Hint, the │ gutter with
 * "^~~~ Here!", then Fix with the corrected line). Terminal colours map to the site's diagnostic tokens: red
 * err, green hint, cyan note, grey faint.
 *
 * The page is prerendered once for every missing URL, so the server cannot know the path: the server snapshot
 * is empty and the browser fills in the real one after hydration, without a mismatch.
 */
export function MissingPath() {
  const path = useSyncExternalStore(noop, () => decodeURI(window.location.pathname), () => "");
  const shown = path || "/";
  const gutter = " ".repeat(host.length);
  const bar = <span className="text-ink-faint">{"  1 │ "}</span>;
  const blank = <span className="text-ink-faint">{"    │ "}</span>;

  return (
    <pre className="overflow-x-auto rounded-[14px] border border-line bg-paper-raised px-5 py-4 font-mono text-[13px] leading-[1.7] text-ink-soft md:text-[14px]">
      <span className="font-semibold text-err">── error </span>
      <span className="text-ink-faint">at {shown} [E404 · page not found]</span>
      {"\n\n"}
      <span className="text-err">
        {"  I can't find anything at '"}
        <span className="text-note">{shown}</span>
        {"'."}
      </span>
      {"\n\n"}
      <span className="text-hint">{"  Hint: It may have moved, or the link may have a typo."}</span>
      {"\n\n"}
      {bar}
      {host}
      {shown}
      {"\n"}
      {blank}
      {gutter}
      <span className="font-semibold text-err">{"^" + "~".repeat(Math.max(0, shown.length - 1))} Here!</span>
      {"\n\n"}
      <span className="font-semibold text-hint">{"  Fix: "}</span>
      <span className="text-hint">replace &apos;{shown}&apos; with &apos;/&apos;</span>
      {"\n"}
      {bar}
      {host}/{"\n"}
      {blank}
      <span className="text-hint">
        {gutter}~
      </span>
    </pre>
  );
}
