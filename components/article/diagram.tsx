import type { ReactNode } from "react";

/*
 * Drawn diagrams for articles: inline SVG styled by the `.dg-*` classes in globals.css, so one drawing follows
 * the light and dark themes without a second copy. SVG presentation attributes cannot read CSS variables in
 * every browser, which is why every colour comes from a class rather than a `fill=` here.
 *
 * Text sizes are set in viewBox units against a 720-wide canvas, the prose column's width, so a diagram reads at
 * the body's scale on a desktop. On a phone the drawing keeps a minimum width and scrolls sideways inside its
 * frame, like a wide table, instead of shrinking its labels below legibility.
 */

export type Tone = "plain" | "accent" | "err" | "warn" | "hint" | "muted";

/** The frame and the <svg>. `label` is the accessible description; the caption goes on the <Figure>. */
export function Diagram({
  label,
  width = 720,
  height,
  minWidth = 600,
  children,
}: {
  label: string;
  width?: number;
  height: number;
  minWidth?: number;
  children: ReactNode;
}) {
  return (
    <div className="diagram" style={{ "--dg-min": `${minWidth}px` } as React.CSSProperties}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        {children}
      </svg>
    </div>
  );
}

/**
 * Arrowheads, one marker per ink. Marker ids are document-wide, and an article can hold several diagrams, so
 * each diagram passes its own prefix.
 */
export function Markers({ id }: { id: string }) {
  const head = (name: string, cls: string) => (
    <marker
      id={`${id}-${name}`}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6.5"
      markerHeight="6.5"
      orient="auto-start-reverse"
    >
      <path d="M1 1.5 L9 5 L1 8.5 Z" className={cls} />
    </marker>
  );
  return (
    <defs>
      {head("a", "dg-head")}
      {head("acc", "dg-head-accent")}
      {head("err", "dg-head-err")}
      {head("hint", "dg-head-hint")}
    </defs>
  );
}

/*
 * A marker is aimed along the path's direction at its last point, so a curve must not still be bending under its
 * arrowhead: end a curved edge with a straight stub longer than the head (about 8px, e.g. `... H x`), or the head
 * sits square while the line meets it off-centre.
 */
export function Edge({
  d,
  id,
  accent = false,
  tone,
}: {
  d: string;
  id: string;
  accent?: boolean;
  /** An edge that carries a verdict: red for rejected, green for allowed. */
  tone?: "err" | "hint";
}) {
  const t = tone ?? (accent ? "accent" : undefined);
  const head = t === "accent" ? "acc" : (t ?? "a");
  return <path d={d} className={t ? `dg-edge dg-edge-${t}` : "dg-edge"} markerEnd={`url(#${id}-${head})`} />;
}

/** A box with a title and an optional second line, centred. */
export function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
  tone = "plain",
  mono = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  mono?: boolean;
}) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} className={`dg-box dg-${tone}`} />
      <text x={cx} y={sub ? cy - 3 : cy + 4.5} textAnchor="middle" className={mono ? "dg-mono dg-strong" : "dg-title"}>
        {title}
      </text>
      {sub && (
        <text x={cx} y={cy + 13} textAnchor="middle" className="dg-sub">
          {sub}
        </text>
      )}
    </g>
  );
}

type Outcome = { title: string; sub?: string; tone: Tone };

/**
 * An ordered list of checks, the first "yes" wins: the shape of every triage decision in a fuzzer, where the
 * order is the policy (a sanitizer report outranks a disagreement, which outranks a wrong answer).
 */
export function Ladder({
  id,
  label,
  rows,
  end,
}: {
  id: string;
  label: string;
  rows: { q: string; yes: Outcome }[];
  end: Outcome;
}) {
  const pitch = 64;
  const qx = 16;
  const qw = 440;
  const bh = 44;
  const vx = 512;
  const vw = 192;
  const height = 16 + rows.length * pitch + bh + 16;
  return (
    <Diagram label={label} height={height} minWidth={580}>
      <Markers id={id} />
      {rows.map((r, i) => {
        const y = 16 + i * pitch;
        const cy = y + bh / 2;
        return (
          <g key={r.q}>
            <rect x={qx} y={y} width={qw} height={bh} rx={8} className="dg-box dg-plain" />
            <text x={qx + 16} y={cy + 4.5} className="dg-title dg-left">
              {r.q}
            </text>
            <Edge id={id} d={`M${qx + qw} ${cy} H${vx - 2}`} />
            <text x={(qx + qw + vx) / 2} y={cy - 7} textAnchor="middle" className="dg-sub">
              yes
            </text>
            <rect x={vx} y={y} width={vw} height={bh} rx={8} className={`dg-box dg-${r.yes.tone}`} />
            <text x={vx + vw / 2} y={r.yes.sub ? cy - 3 : cy + 4.5} textAnchor="middle" className="dg-mono dg-strong">
              {r.yes.title}
            </text>
            {r.yes.sub && (
              <text x={vx + vw / 2} y={cy + 13} textAnchor="middle" className="dg-sub">
                {r.yes.sub}
              </text>
            )}
            <Edge id={id} d={`M${qx + 40} ${y + bh} V${y + pitch - 2}`} />
            <text x={qx + 50} y={y + bh + 14} className="dg-sub dg-left">
              no
            </text>
          </g>
        );
      })}
      <Box
        x={qx}
        y={16 + rows.length * pitch}
        w={qw}
        h={bh}
        title={end.title}
        sub={end.sub}
        tone={end.tone}
        mono
      />
    </Diagram>
  );
}
