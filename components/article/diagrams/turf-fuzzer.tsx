import { Box, Diagram, Edge, Ladder, Markers } from "@/components/article/diagram";

/*
 * The diagrams in content/articles/turf-fuzzer.mdx. Every name, number and route here is taken from turf-fuzz
 * itself (DESIGN.md, ci/*.sh, triage/signature.py, the committed findings), so when turf-fuzz changes how a
 * night runs, check these against it.
 */

/* ── Which compiler stages each tier reaches, and what it judges ─────────────────────────────────────────── */

const stages = [
  ["lex,", "parse"],
  ["resolve,", "types"],
  ["lint"],
  ["flow", "passes"],
  ["codegen"],
  ["LLVM", "-O"],
  ["link"],
  ["run,", "GC"],
];

type Lane = {
  name: string;
  what: string;
  /** Inclusive column range the tier drives the compiler through. */
  span: [number, number];
  /** Columns the tier's oracle is aimed at; when set, the span is drawn as a track. */
  focus?: number[];
  judge: string;
  /** Where the judge text sits when the span is a track: an inclusive column range. */
  judgeAt?: [number, number];
};

const lanes: Lane[] = [
  { name: "Tier 0", what: "mutated real programs", span: [0, 5], judge: "crashes, hangs, sanitizer reports" },
  {
    name: "Tiers 1 and 2",
    what: "generated programs",
    span: [0, 7],
    judge: "the exact output: stdout, exit status, trap and its line",
  },
  {
    name: "Tier 3",
    what: "escape soundness",
    span: [0, 7],
    focus: [3, 7],
    judge: "references that escape",
    judgeAt: [0, 2],
  },
  {
    name: "Overflow oracle",
    what: "exact integers",
    span: [0, 7],
    focus: [4, 7],
    judge: "every int and index check",
    judgeAt: [0, 3],
  },
  { name: "Tier 4", what: "libFuzzer, in process", span: [0, 3], judge: "crash, timeout, oom, exit()" },
];

export function TierCoverage() {
  const x0 = 208;
  const cw = 63;
  const top = 64;
  const pitch = 56;
  const height = top + lanes.length * pitch + 4;
  const col = (c: number) => x0 + c * cw;
  return (
    <Diagram
      label="A grid of the compiler's stages, from lexing to running the program, against the fuzzer's five tiers. Tier 0 reaches from lexing to LLVM optimisation; tiers 1 and 2 run the whole pipeline; tier 3 aims at the flow passes and the running program; the overflow oracle at codegen's check elision and the running program; tier 4 covers the front end up to the flow passes."
      height={height}
    >
      {stages.map((lines, i) => (
        <text key={i} x={col(i) + cw / 2} y={lines.length > 1 ? 30 : 37} textAnchor="middle" className="dg-sub">
          {lines.map((l, j) => (
            <tspan key={j} x={col(i) + cw / 2} dy={j === 0 ? 0 : 14}>
              {l}
            </tspan>
          ))}
        </text>
      ))}
      {Array.from({ length: stages.length + 1 }, (_, i) => (
        <line key={i} x1={col(i)} x2={col(i)} y1={54} y2={height - 6} className="dg-grid" />
      ))}
      {lanes.map((lane, r) => {
        const y = top + r * pitch;
        const cy = y + 14;
        const bx = col(lane.span[0]) + 3;
        const bw = (lane.span[1] - lane.span[0] + 1) * cw - 6;
        const at = lane.judgeAt ?? lane.span;
        const jx = (col(at[0]) + col(at[1] + 1)) / 2;
        return (
          <g key={lane.name}>
            <text x={16} y={cy - 1} className="dg-title dg-left">
              {lane.name}
            </text>
            <text x={16} y={cy + 15} className="dg-sub dg-left">
              {lane.what}
            </text>
            <rect
              x={bx}
              y={y}
              width={bw}
              height={28}
              rx={6}
              className={lane.focus ? "dg-box dg-track" : "dg-box dg-accent"}
            />
            {lane.focus?.map((c) => (
              <rect key={c} x={col(c) + 3} y={y} width={cw - 6} height={28} rx={6} className="dg-solid" />
            ))}
            <text x={jx} y={cy + 4.5} textAnchor="middle" className="dg-label">
              {lane.judge}
            </text>
          </g>
        );
      })}
    </Diagram>
  );
}

/* ── One generated program, built and run twelve ways, against the evaluator ─────────────────────────────── */

const runs = [
  "-O0",
  "-O1",
  "-O2",
  "-O3",
  "-Os",
  "-g",
  "-O0 gc stress",
  "-O0 gc validate",
  "-O0 both",
  "asan -O0",
  "asan -O0 stress",
  "asan -O2 stress",
];

export function DifferentialFanOut() {
  const id = "dg-fan";
  return (
    <Diagram
      label="generate.py turns one seed into a program. The program, prog.tr, is built eight ways and run twelve: at -O0, -O1, -O2, -O3, -Os and -g; the -O0 binary again under GC stress, GC validation and both; and against the ASan runtime at -O0 and -O2. Separately, evaluate.py runs the same program's syntax tree and predicts its exact output. Every run is compared with every other and with the prediction."
      height={284}
    >
      <Markers id={id} />
      <Box x={16} y={117} w={132} h={66} title="generate.py" sub="one seed" />
      <Edge id={id} d="M148 150 C162 150 154 62 164 62 H174" />
      <Edge id={id} d="M148 150 C162 150 154 240 164 240 H174" />
      <Box x={176} y={40} w={140} h={44} title="prog.tr" sub="rendered Turf" mono />
      <Box x={176} y={214} w={176} h={52} title="evaluate.py" sub="predicts the exact output" mono />
      <Edge id={id} d="M316 62 H338" />
      <rect x={340} y={16} width={364} height={170} rx={10} className="dg-frame" />
      <text x={522} y={38} textAnchor="middle" className="dg-title">
        turfc: 8 builds, 12 runs
      </text>
      {runs.map((r, i) => {
        const x = 354 + (i % 3) * 116;
        const y = 52 + Math.floor(i / 3) * 32;
        return (
          <g key={r}>
            <rect x={x} y={y} width={108} height={24} rx={6} className="dg-chip" />
            <text x={x + 54} y={y + 16} textAnchor="middle" className="dg-mono dg-small">
              {r}
            </text>
          </g>
        );
      })}
      <Edge id={id} d="M552 186 V212" />
      <Edge id={id} d="M352 240 H398" />
      <Box x={400} y={214} w={304} h={52} title="compare" sub="every run with every other, and with the prediction" tone="accent" />
    </Diagram>
  );
}

export function DifferentialVerdict() {
  return (
    <Ladder
      id="dg-verdict"
      label="The differential oracle's verdict, checked in order. Did turfc crash or time out at any level: a crash. Did it refuse the program: rejected-valid. Did the ASan runtime report: sanitizer. Do any two runs disagree: miscompile. Did every run die, hang or fail GC validation: a crash. Do the runs agree with each other but not with the evaluator: wrong-answer, and the generator is suspected first. Otherwise the program passes and the next seed runs."
      rows={[
        { q: "Did turfc crash or time out at any level?", yes: { title: "crash", sub: "the compiler itself", tone: "err" } },
        { q: "Did turfc refuse the program?", yes: { title: "rejected-valid", sub: "valid by the generator's rules", tone: "warn" } },
        { q: "Did the ASan runtime report anything?", yes: { title: "sanitizer", sub: "bad memory in the runtime", tone: "err" } },
        { q: "Do any two of the twelve runs disagree?", yes: { title: "miscompile", sub: "a level changed the answer", tone: "err" } },
        { q: "Did every run die, hang or fail GC validation?", yes: { title: "crash", sub: "the program, every way", tone: "err" } },
        {
          q: "Do the runs agree, but not with the evaluator?",
          yes: { title: "wrong-answer", sub: "suspect the generator first", tone: "warn" },
        },
      ]}
      end={{ title: "pass", sub: "on to the next seed", tone: "hint" }}
    />
  );
}

/* ── From a crash's stack to a findings directory ────────────────────────────────────────────────────────── */

const frames: { text: string; tag: string; kept: boolean }[] = [
  { text: "#0 0x000055d0a17023a1 llvm::APInt::equalSlowCase(llvm::APInt const&)", tag: "LLVM: not ours", kept: false },
  { text: "#1 0x000055d0a0f1c2b8 CollectChangedNodeIDsInternal(ExprAST*, ExprAST*)", tag: "kept", kept: true },
  { text: "#2 0x000055d0a0f1d0e4 LintIf(IfExprAST*)", tag: "kept", kept: true },
  { text: "#3 0x000055d0a0f1e9a2 LintExpression(ExprAST*)", tag: "kept", kept: true },
  { text: "#4 0x000055d0a0e3b7c0 FuncDefExprAST::codegen()", tag: "past the top three", kept: false },
];

export function SignatureFlow() {
  const id = "dg-sig";
  return (
    <Diagram
      label="A compiler crash's stack trace, killed by SIGSEGV. The first frame is in LLVM and is dropped; the next three, CollectChangedNodeIDsInternal, LintIf and LintExpression, are the compiler's own and are kept; the fifth is past the top three. Addresses and argument lists are discarded. The signature text is: signal: SIGSEGV @ CollectChangedNodeIDsInternal,LintIf,LintExpression. Its SHA-1, cut to twelve hex digits, names the directory findings/signal/79ba09a65670."
      height={344}
    >
      <Markers id={id} />
      <rect x={16} y={16} width={688} height={160} rx={10} className="dg-term" />
      <text x={32} y={40} className="dg-mono dg-small dg-dim">
        turfc prog.tr -O0 --emit-obj: killed by signal 11 (SIGSEGV)
      </text>
      <rect x={24} y={73} width={672} height={64} rx={6} className="dg-keep" />
      {frames.map((f, i) => {
        const y = 66 + i * 21;
        return (
          <g key={f.text}>
            <text x={32} y={y} className={f.kept ? "dg-mono dg-small dg-strong" : "dg-mono dg-small dg-dim"}>
              {f.text}
            </text>
            <text x={688} y={y} textAnchor="end" className={f.kept ? "dg-sub dg-accent-ink" : "dg-sub"}>
              {f.tag}
            </text>
          </g>
        );
      })}
      <Edge id={id} d="M360 176 V204" />
      <Box
        x={16}
        y={206}
        w={688}
        h={44}
        title="signal: SIGSEGV @ CollectChangedNodeIDsInternal,LintIf,LintExpression"
        mono
        tone="accent"
      />
      <Edge id={id} d="M166 250 V284" />
      <Box x={16} y={286} w={300} h={44} title="sha1(kind, text), first 12 hex" />
      <Edge id={id} d="M316 308 H364" accent />
      <Box x={366} y={286} w={338} h={44} title="findings/signal/79ba09a65670/" mono tone="hint" />
    </Diagram>
  );
}

/* ── How far reduction takes a finding ───────────────────────────────────────────────────────────────────── */

/* Line counts of the committed files: the generated or mutated input, and the reproducer under findings/. */
const reductions: { name: string; cls: string; before: number; after: number }[] = [
  { name: "84e0cb6e67", cls: "crash", before: 309, after: 12 },
  { name: "target-layout-after-codegen", cls: "miscompile", before: 273, after: 11 },
  { name: "give-in-array-literal", cls: "crash", before: 264, after: 7 },
  { name: "astdiff-method-arg-count", cls: "crash", before: 263, after: 30 },
  { name: "char-signed-compare", cls: "miscompile", before: 198, after: 14 },
  { name: "length-in-array-literal", cls: "crash", before: 144, after: 8 },
  { name: "generic-only-in-signature", cls: "llvm-error", before: 143, after: 11 },
  { name: "lint-branch-compare-int-min-literal", cls: "crash", before: 124, after: 12 },
  { name: "lex-error-after-top-level-semicolon", cls: "target-exited", before: 72, after: 2 },
];

export function Reductions() {
  const x0 = 262;
  const span = 330;
  const max = 320;
  const top = 52;
  const pitch = 28;
  const height = top + reductions.length * pitch + 6;
  const w = (n: number) => Math.max(3, (n / max) * span);
  return (
    <Diagram
      label={
        "Lines in each finding's input against lines in its committed reproducer. " +
        reductions.map((r) => `${r.cls}/${r.name}: ${r.before} to ${r.after}`).join("; ") +
        "."
      }
      height={height}
    >
      <rect x={x0} y={14} width={12} height={12} rx={3} className="dg-bar-before" />
      <text x={x0 + 18} y={24} className="dg-sub dg-left">
        input (generated or mutated)
      </text>
      <rect x={x0 + 196} y={14} width={12} height={12} rx={3} className="dg-bar-after" />
      <text x={x0 + 214} y={24} className="dg-sub dg-left">
        reproducer
      </text>
      <text x={652} y={44} textAnchor="end" className="dg-sub">
        input
      </text>
      <text x={704} y={44} textAnchor="end" className="dg-sub">
        kept
      </text>
      {reductions.map((r, i) => {
        const y = top + i * pitch;
        return (
          <g key={r.name} className="dg-row">
            <title>{`${r.cls}/${r.name}: ${r.before} lines in, ${r.after} kept`}</title>
            <rect x={0} y={y - 2} width={720} height={pitch} className="dg-hit" />
            <text x={16} y={y + 15} className="dg-mono dg-small">
              {r.name}
            </text>
            <rect x={x0} y={y + 5} width={w(r.before)} height={12} rx={3} className="dg-bar-before" />
            <rect x={x0} y={y + 5} width={w(r.after)} height={12} rx={3} className="dg-bar-after" />
            <text x={652} y={y + 15} textAnchor="end" className="dg-mono dg-small dg-dim">
              {r.before}
            </text>
            <text x={704} y={y + 15} textAnchor="end" className="dg-mono dg-small dg-strong">
              {r.after}
            </text>
          </g>
        );
      })}
    </Diagram>
  );
}

/* ── The night, end to end ───────────────────────────────────────────────────────────────────────────────── */

const jobs = [
  { title: "process (pinned)", sub: "compiler.lock, tiers 0 to 3" },
  { title: "process (master)", sub: "turflang master, tiers 0 to 3" },
  { title: "sanitized", sub: "tier 0, ASan + UBSan turfc" },
  { title: "engine", sub: "tier 4, last night's corpus" },
];

export function NightlyLoop() {
  const id = "dg-night";
  return (
    <Diagram
      label="The nightly loop. At 00:00 IST, nightly.yml starts four jobs side by side: process against the pinned compiler, process against turflang master, the sanitized crash fuzz, and the libFuzzer engine. Their failures are reduced to signatures and deduplicated against findings/. The organisation's bot files an issue or comments on an open one. We triage it, the bug is fixed in turflang with a pinned test in the same change, the finding's directory is committed and compiler.lock is bumped, and the next night treats it as known."
      height={340}
    >
      <Markers id={id} />
      <Box x={16} y={128} w={148} h={64} title="nightly.yml" sub="00:00 IST, every night" mono />
      {jobs.map((j, i) => {
        const y = 24 + i * 60;
        const cy = y + 24;
        return (
          <g key={j.title}>
            <Edge id={id} d={`M164 160 C182 160 174 ${cy} 190 ${cy} H202`} />
            <Box x={204} y={y} w={196} h={48} title={j.title} sub={j.sub} />
            <Edge id={id} d={`M400 ${cy} C418 ${cy} 410 ${136 + i * 16} 426 ${136 + i * 16} H438`} />
          </g>
        );
      })}
      <Box x={440} y={120} w={124} h={80} title="signature" sub="new, or known?" tone="accent" />
      <Edge id={id} d="M564 160 H594" />
      <Box x={596} y={120} w={108} h={80} title="the bot" sub="issue or comment" />
      <Edge id={id} d="M650 200 V258" />
      <Box x={548} y={260} w={156} h={56} title="triage" sub="trace.py, reduce.py" />
      <Edge id={id} d="M548 288 H530" accent />
      <Box x={332} y={260} w={196} h={56} title="fix in turflang" sub="pinned test, same change" tone="hint" />
      <Edge id={id} d="M332 288 H306" accent />
      <Box x={108} y={260} w={196} h={56} title="findings/ committed" sub="compiler.lock bumped" />
      <Edge id={id} d="M108 288 H90 V194" accent />
      <text x={80} y={232} textAnchor="end" className="dg-sub">
        known
      </text>
      <text x={80} y={246} textAnchor="end" className="dg-sub">
        from now
      </text>
    </Diagram>
  );
}

/* ── What the bot does with one new signature ────────────────────────────────────────────────────────────── */

export function IssueRouting() {
  return (
    <Ladder
      id="dg-issue"
      label="What the bot does with one signature from a night's run. If its directory is already committed under findings/, it is known: the counter goes up and no issue is touched. Otherwise, if an issue titled Nightly fuzz followed by the signature is open, it gets a Seen again comment and the job's compiler label. Otherwise, if the job has opened fewer than ten issues tonight, a new issue is opened with three labels and the reproducer inline. Otherwise the signature goes into one overflow issue that lists the rest."
      rows={[
        { q: "Is findings/<class>/<sig>/ committed?", yes: { title: "known", sub: "a counter goes up, nothing else", tone: "muted" } },
        { q: "Is “Nightly fuzz: <sig>” an open issue?", yes: { title: "comment", sub: "“Seen again”, plus a label", tone: "accent" } },
        { q: "Fewer than 10 new issues from this job tonight?", yes: { title: "new issue", sub: "labelled, reproducer inline", tone: "accent" } },
      ]}
      end={{ title: "overflow issue", sub: "one issue lists the rest", tone: "warn" }}
    />
  );
}
