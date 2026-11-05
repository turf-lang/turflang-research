"use client";

import { useState, type ReactNode } from "react";
import { KindHead } from "./card";

export type KindGroup = { kind: string; label: string; items: { key: string; node: ReactNode }[] };

/*
 * The research index, split by kind. "All" keeps every kind in its own labelled section so the kinds read as
 * separate shelves; picking one narrows to that shelf. The cards are rendered on the server and passed in, so
 * filtering is a client-side show/hide with no refetch. Filtering is instant on purpose: it is a click that
 * changes a list, and a transition would only delay the answer.
 */
export function KindFilter({ groups }: { groups: KindGroup[] }) {
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? groups.filter((g) => g.kind === active) : groups;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      {groups.length > 1 && (
        <div role="group" aria-label="Filter by kind" className="mb-12 flex flex-wrap gap-2">
          <FilterButton on={active === null} onClick={() => setActive(null)} label="All" count={total} />
          {groups.map((g) => (
            <FilterButton
              key={g.kind}
              on={active === g.kind}
              onClick={() => setActive(g.kind)}
              label={g.label}
              count={g.items.length}
            />
          ))}
        </div>
      )}
      {shown.map((g) => (
        <section key={g.kind} aria-labelledby={`kind-${g.kind}`} className="mb-20 last:mb-0">
          <KindHead id={`kind-${g.kind}`} label={g.label} count={g.items.length} />
          <ul className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((it) => (
              <li key={it.key}>{it.node}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function FilterButton({ on, onClick, label, count }: { on: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`btn btn-sm ${on ? "btn-primary" : "btn-ghost"}`}
    >
      {label}
      <span className={`font-mono text-[11px] tabular-nums ${on ? "opacity-60" : "text-ink-faint"}`}>{count}</span>
    </button>
  );
}
