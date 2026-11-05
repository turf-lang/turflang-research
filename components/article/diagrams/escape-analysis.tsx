import { Box, Diagram, Edge, Markers } from "@/components/article/diagram";

/*
 * The diagrams in content/articles/escape-analysis.mdx. The sinks, the merge rule and the loop fix are
 * turflang's (FREEZE.md §6.13, src/analysis/Analysis.cpp mergeProv() and EscapePass::runOnCFG, commit 9398f38);
 * the oracle's counts are turf-fuzz oracles/soundness.py's. Check them against those when either changes.
 */

/* ── A frame reference and the six places it may never reach ─────────────────────────────────────────────── */

const sinks = [
  { code: "return p;", what: "a return" },
  { code: "dst.next = p;", what: "a field the caller owns" },
  { code: "l.push(p);", what: "a collection mutator, or []=" },
  { code: "m.next = p; heap(m)", what: "heap()'s operand, or inside it" },
  { code: "return E1::P(p);", what: "an error payload" },
  { code: "xs[0] = p;", what: "an element of a (&N)[] parameter" },
];

export function EscapeSinks() {
  const id = "dg-sinks";
  const top = 16;
  const pitch = 52;
  const safeY = top + sinks.length * pitch + 12;
  return (
    <Diagram
      label="Inside make()'s frame, p = &n has Stack provenance. Six sinks reject it with E086: a return, a field the caller owns, a collection mutator or []=, heap()'s operand or a value inside it, an error payload, and an element of a (&N)[] parameter. Below, heap(n) makes a GC copy whose reference may be returned."
      height={safeY + 56}
    >
      <Markers id={id} />
      <rect x={16} y={88} width={220} height={150} rx={10} className="dg-frame" />
      <text x={32} y={110} className="dg-sub dg-left">
        make()&apos;s frame
      </text>
      <Box x={40} y={122} w={172} h={40} title="mut n: N" mono />
      <Box x={40} y={176} w={172} h={48} title="p = &n;" sub="Stack" mono tone="err" />
      {sinks.map((s, i) => {
        const y = top + i * pitch;
        const cy = y + 20;
        return (
          <g key={s.code}>
            <Edge id={id} tone="err" d={`M212 200 C268 200 282 ${cy} 312 ${cy} H326`} />
            <Box x={328} y={y} w={262} h={40} title={s.code} sub={s.what} mono />
            <Edge id={id} tone="err" d={`M590 ${cy} H614`} />
            <Box x={616} y={y} w={88} h={40} title="E086" mono tone="err" />
          </g>
        );
      })}
      <Box x={40} y={safeY} w={172} h={40} title="heap(n)" mono tone="hint" />
      <Edge id={id} tone="hint" d={`M212 ${safeY + 20} H326`} />
      <Box x={328} y={safeY} w={262} h={40} title="return heap(n);" sub="a fresh GC copy: Heap" mono />
      <Edge id={id} tone="hint" d={`M590 ${safeY + 20} H614`} />
      <Box x={616} y={safeY} w={88} h={40} title="allowed" mono tone="hint" />
    </Diagram>
  );
}

/* ── What two paths' provenances become where they meet ──────────────────────────────────────────────────── */

const provs = ["Stack", "MayStack", "Param", "Heap", "Unknown"] as const;
type Prov = (typeof provs)[number];

/* turflang's mergeProv(): equal stays, a Stack on either side makes MayStack, any other disagreement is Unknown. */
function merge(a: Prov, b: Prov): Prov {
  if (a === b) return a;
  const stackish = (p: Prov) => p === "Stack" || p === "MayStack";
  if (stackish(a) || stackish(b)) return "MayStack";
  return "Unknown";
}

const provTone: Record<Prov, string> = {
  Stack: "dg-err",
  MayStack: "dg-err",
  Param: "dg-plain",
  Heap: "dg-plain",
  Unknown: "dg-muted",
};

export function MergeGrid() {
  const x0 = 140;
  const cw = 112;
  const y0 = 52;
  const ch = 40;
  return (
    <Diagram
      label={
        "The merge of two paths' provenance for one place. " +
        provs.map((a) => `${a} with: ${provs.map((b) => `${b} gives ${merge(a, b)}`).join(", ")}`).join(". ") +
        ". Stack on either path gives MayStack, which is flagged; any other disagreement gives Unknown, which never is."
      }
      height={y0 + provs.length * ch + 12}
    >
      <text x={16} y={30} className="dg-sub dg-left">
        path A (rows)
      </text>
      <text x={16} y={46} className="dg-sub dg-left">
        path B (columns)
      </text>
      {provs.map((p, i) => (
        <text key={p} x={x0 + i * cw + cw / 2} y={38} textAnchor="middle" className="dg-mono dg-strong">
          {p}
        </text>
      ))}
      {provs.map((a, r) => (
        <g key={a}>
          <text x={16} y={y0 + r * ch + 25} className="dg-mono dg-strong">
            {a}
          </text>
          {provs.map((b, c) => {
            const m = merge(a, b);
            return (
              <g key={b}>
                <rect
                  x={x0 + c * cw + 3}
                  y={y0 + r * ch + 3}
                  width={cw - 6}
                  height={ch - 6}
                  rx={6}
                  className={`dg-box ${provTone[m]}`}
                />
                <text x={x0 + c * cw + cw / 2} y={y0 + r * ch + 24.5} textAnchor="middle" className="dg-mono dg-small">
                  {m}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </Diagram>
  );
}

/* ── The loop bug: an uncomputed back edge met as an empty map ───────────────────────────────────────────── */

function LoopPanel({ id, px, before }: { id: string; px: number; before: boolean }) {
  return (
    <g>
      <text x={px + 16} y={28} className="dg-title dg-left">
        {before ? "Before: the back edge met as empty" : "After: an unreached edge is skipped"}
      </text>
      <Box x={px + 16} y={48} w={190} h={36} title="mut p: &N = &n;" mono />
      <Edge id={id} d={`M${px + 111} 84 V110`} />
      <Box x={px + 16} y={112} w={190} h={36} title="while i < k" mono />
      <Edge id={id} d={`M${px + 206} 130 H${px + 234}`} />
      <Box x={px + 236} y={112} w={92} h={36} title="i = i + 1" mono />
      <Edge id={id} d={`M${px + 282} 112 V98 H${px + 176} V110`} />
      <text x={px + 230} y={92} textAnchor="middle" className="dg-sub">
        back edge
      </text>
      <Edge id={id} d={`M${px + 111} 148 V182`} />
      <Box x={px + 16} y={184} w={190} h={36} title="return p;" mono />
      <text x={px + 16} y={246} className="dg-mono dg-small dg-left">
        {before ? "IN(while) = meet({p: Stack}, {})" : "IN(while) = {p: Stack}"}
      </text>
      <text x={px + 16} y={264} className="dg-mono dg-small dg-left dg-dim">
        {before ? "result {}, so p is Unknown" : "back edge not reached yet: skipped"}
      </text>
      <Box
        x={px + 16}
        y={280}
        w={312}
        h={40}
        title={before ? "compiles: the caller reads a dead frame" : "E086 at return p;"}
        tone={before ? "err" : "hint"}
      />
    </g>
  );
}

export function LoopBug() {
  const id = "dg-loop";
  return (
    <Diagram
      label="Two copies of the same control-flow graph: p = &n, then a while loop whose body i = i + 1 has a back edge to the loop header, then return p. Before the fix, the loop header's input met the entry's {p: Stack} with the back edge's not-yet-computed empty map, giving an empty map, so p was Unknown and the function compiled while returning a reference into its own dead frame. After the fix, a predecessor not yet reached is skipped, the header keeps {p: Stack}, and return p is E086."
      height={336}
    >
      <Markers id={id} />
      <LoopPanel id={id} px={0} before />
      <line x1={360} x2={360} y1={16} y2={320} className="dg-grid" />
      <LoopPanel id={id} px={376} before={false} />
    </Diagram>
  );
}

/* ── How the soundness oracle builds and judges its programs ─────────────────────────────────────────────── */

export function OracleProduct() {
  const id = "dg-oracle";
  const inputs = [
    { title: "13 sources", sub: "&n, id(&n), &a[0], heap(n), a parameter" },
    { title: "20 sinks", sub: "returns, fields, collections, heap()" },
    { title: "11 wrappers", sub: "loops, if and else, compare, nesting" },
  ];
  return (
    <Diagram
      label="The soundness oracle combines 13 sources, 20 sinks and 11 control-flow wrappers into 2,662 programs that type-check, plus 5 pinned shapes. 1,441 must be rejected with E086 and the sink's own wording; 1,221 must compile and print exactly 42 at -O0, -O2 and under the ASan runtime with GC stress. Every program calls clobber() between the escape and the read, so a dangling read prints garbage instead of a lucky 42."
      height={252}
    >
      <Markers id={id} />
      {inputs.map((b, i) => {
        const y = 16 + i * 64;
        return (
          <g key={b.title}>
            <Box x={16} y={y} w={244} h={52} title={b.title} sub={b.sub} />
            <Edge id={id} d={`M260 ${y + 26} C278 ${y + 26} 270 106 286 106 H296`} />
          </g>
        );
      })}
      <Box x={298} y={70} w={176} h={72} title="2,662 programs" sub="plus 5 pinned shapes" tone="accent" />
      <Edge id={id} tone="err" d="M474 106 C494 106 486 68 504 68 H514" />
      <Edge id={id} tone="hint" d="M474 106 C494 106 486 156 504 156 H514" />
      <Box x={516} y={40} w={188} h={56} title="1,441: E086" sub="with the sink's own wording" tone="err" />
      <Box x={516} y={128} w={188} h={56} title="1,221: print 42" sub="-O0, -O2, ASan + GC stress" tone="hint" />
      <text x={360} y={232} textAnchor="middle" className="dg-sub">
        Every program calls clobber() between the escape and the read, so a dangling read prints garbage.
      </text>
    </Diagram>
  );
}
