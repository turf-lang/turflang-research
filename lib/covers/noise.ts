/*
 * Seeded randomness for the cover generator. Everything is derived from a string seed (normally the article's
 * slug), so a cover is identical on every build and every machine: the exported image and the dev preview
 * never disagree.
 */

export type Rng = () => number;

export function hashString(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** mulberry32: small, fast, and good enough for picture-making. */
export function rng(seed: string): Rng {
  let a = hashString(seed) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const range = (r: Rng, lo: number, hi: number) => lo + r() * (hi - lo);
export const int = (r: Rng, lo: number, hi: number) => Math.floor(range(r, lo, hi + 1));
export const pick = <T,>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
export function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 2D value noise with smoothstep interpolation, in [0, 1]. */
export function valueNoise(seed: string) {
  const base = hashString(seed);
  const lattice = (x: number, y: number) => {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ base;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = smooth(x - xi);
    const v = smooth(y - yi);
    const a = lattice(xi, yi);
    const b = lattice(xi + 1, yi);
    const c = lattice(xi, yi + 1);
    const d = lattice(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  /** Fractal sum of octaves, normalised back to [0, 1]. */
  return (x: number, y: number, octaves = 4) => {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(x * freq, y * freq);
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  };
}
