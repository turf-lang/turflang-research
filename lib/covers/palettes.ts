/*
 * Cover palettes. Each one is a small, printed-matter set: a paper, an ink, four pigments and a night/glow pair
 * for the lit motifs. They are deliberately natural (earth, water, dusk) rather than UI colours, so a cover
 * reads as an illustration and never as a status.
 */

export type Palette = {
  label: string;
  paper: string;
  ink: string;
  /** Four pigments, most saturated first. */
  colors: [string, string, string, string];
  night: string;
  glow: string;
};

export const palettes = {
  clay: {
    label: "Clay",
    paper: "#ecdfc8",
    ink: "#1e1a17",
    colors: ["#c4532f", "#e3a857", "#7f9c86", "#a8c5d6"],
    night: "#170f0c",
    glow: "#ff8a4c",
  },
  signal: {
    label: "Signal",
    paper: "#efe7d6",
    ink: "#141414",
    colors: ["#d8382c", "#3d6fa6", "#e9c46a", "#9fb8cf"],
    night: "#0b1420",
    glow: "#ff5a3c",
  },
  moss: {
    label: "Moss",
    paper: "#e6e2cf",
    ink: "#20261c",
    colors: ["#5d7b48", "#c7a75a", "#3f6b6a", "#d9825b"],
    night: "#0e140d",
    glow: "#e9d36a",
  },
  tide: {
    label: "Tide",
    paper: "#e4ece8",
    ink: "#0f2233",
    colors: ["#1f5c8f", "#6db6c8", "#f0bd4f", "#cfe3dc"],
    night: "#06121f",
    glow: "#57d5ff",
  },
  dusk: {
    label: "Dusk",
    paper: "#f1e2d2",
    ink: "#22182e",
    colors: ["#e56b4e", "#f3a95f", "#b98ad6", "#4a3f78"],
    night: "#140d22",
    glow: "#ff7a59",
  },
  lagoon: {
    label: "Lagoon",
    paper: "#e9e6f3",
    ink: "#1b1d3a",
    colors: ["#4c6ef0", "#8fd6c8", "#c5a3f2", "#2fae8f"],
    night: "#0a0e28",
    glow: "#9a86ff",
  },
  // Quieter, earthier sets for the sketch and cutout motifs: a flat ground, dark ink, one warm accent.
  oat: {
    label: "Oat",
    paper: "#f0eee6",
    ink: "#191915",
    colors: ["#d97757", "#e3dacc", "#bcd1ca", "#cbcadb"],
    night: "#1d1c18",
    glow: "#e8a07f",
  },
  kraft: {
    label: "Kraft",
    paper: "#f2ebdf",
    ink: "#1d1814",
    colors: ["#d4a27f", "#788c5d", "#ebdbbc", "#c46686"],
    night: "#1b1611",
    glow: "#e9b98e",
  },
  sage: {
    label: "Sage",
    paper: "#eef0e8",
    ink: "#17201b",
    colors: ["#9fbbb0", "#5f8a6f", "#e6dfc8", "#d97757"],
    night: "#101712",
    glow: "#d9e5a6",
  },
  heather: {
    label: "Heather",
    paper: "#f1eff4",
    ink: "#1c1a24",
    colors: ["#b9b6d3", "#6c6aa0", "#ecdcc0", "#d98a6c"],
    night: "#14121e",
    glow: "#c9b8ff",
  },
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof palettes;

function parse(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function format([r, g, b]: number[]) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/** Linear mix in sRGB; good enough at the saturations these palettes use. */
export function mix(a: string, b: string, t: number) {
  const pa = parse(a);
  const pb = parse(b);
  return format(pa.map((v, i) => v + (pb[i] - v) * t));
}

export const shade = (c: string, t: number) => mix(c, "#000000", t);
export const tint = (c: string, t: number) => mix(c, "#ffffff", t);
