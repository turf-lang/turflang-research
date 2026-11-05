/*
 * The research index: every article on the site, newest first. An article's body is
 * `content/articles/<slug>.mdx`; this file holds what lists, cards and metadata need, so the index never has to
 * load a body.
 *
 * Papers under review do not appear here at all, not even as an empty entry. A paper gets an article (and a
 * place in this list) on the day it is public.
 *
 * Kept free of framework imports so `scripts/covers.ts` and the tests can read it under plain Node.
 */

import type { CoverSpec } from "./covers/index.ts";

/* Listed in the order the site shows them: published research first, then the work around it. */
export type Kind = "research" | "experiment" | "engineering" | "explainer";

export const kinds: Record<Kind, { label: string; plural: string }> = {
  research: { label: "Research", plural: "Research" },
  experiment: { label: "Experiment", plural: "Experiments" },
  engineering: { label: "Engineering", plural: "Engineering" },
  explainer: { label: "Explainer", plural: "Explainers" },
};

export const kindOrder = Object.keys(kinds) as Kind[];

export type Area = "language" | "compiler" | "models" | "measurement";

export const areas: Record<Area, { name: string; blurb: string }> = {
  language: {
    name: "Language design",
    blurb:
      "Turflang itself: syntax, types and semantics chosen so a program says what it means, to the person reading it and to the model writing it.",
  },
  compiler: {
    name: "Compilers and analysis",
    blurb:
      "How the compiler checks a program, from monomorphization to control flow and the sandbox, and how it explains what it found.",
  },
  models: {
    name: "Models in the toolchain",
    blurb:
      "Small models that run inside the compiler on the programmer's machine, and what a language can do to make model-written code correct.",
  },
  measurement: {
    name: "Measurement",
    blurb: "Benchmarks, oracles and human studies: telling help that looks right from help that is right.",
  },
};

/** A generated cover (see lib/covers), or an image supplied by hand under public/covers/. */
export type Cover = CoverSpec | { src: string; og?: string };

export type Article = {
  slug: string;
  title: string;
  /** One or two sentences for cards and the meta description. */
  summary: string;
  /** ISO date, e.g. "2026-11-05". */
  date: string;
  kind: Kind;
  area: Area;
  authors?: string[];
  cover: Cover;
  /** Research articles link the paper and its artefacts. */
  links?: { label: string; href: string }[];
  /** Drafts render under `next dev` only; production builds leave them out entirely. */
  draft?: boolean;
};

export const articles: Article[] = [
  {
    slug: "escape-analysis",
    title: "References that can't outlive their frame: escape analysis in Turflang",
    summary:
      "How the compiler stops a reference to a local from escaping its function without lifetime syntax, and the sixteen shapes a fuzzer found that it got wrong.",
    date: "2026-11-06",
    kind: "engineering",
    area: "compiler",
    authors: ["Turflang Research"],
    cover: { motif: "sketch", palette: "tide" },
  },
  {
    slug: "turf-fuzzer",
    title: "Inside the Turf Fuzzer: how Turflang finds its crashes first",
    summary:
      "Every night, four jobs try to break the Turflang compiler. How turf-fuzz knows the right answer, names each bug once, cuts it to a dozen lines, and files it before anyone else hits it.",
    date: "2026-11-05",
    kind: "engineering",
    area: "compiler",
    authors: ["Turflang Research"],
    cover: { motif: "terrain", palette: "dusk" },
  },
];

const showDrafts = process.env.NODE_ENV !== "production";

/** Articles visible in this build, newest first. */
export function listArticles(filter?: { kind?: Kind }) {
  return articles
    .filter((a) => showDrafts || !a.draft)
    .filter((a) => !filter?.kind || a.kind === filter.kind)
    .toSorted((a, b) => b.date.localeCompare(a.date));
}

export function findArticle(slug: string) {
  return listArticles().find((a) => a.slug === slug);
}

export function coverSrc(a: Article) {
  return "src" in a.cover ? a.cover.src : `/covers/${a.slug}.webp`;
}

export function ogSrc(a: Article) {
  return "src" in a.cover ? (a.cover.og ?? a.cover.src) : `/covers/${a.slug}-og.jpg`;
}

export function formatDate(iso: string, style: "long" | "short" = "long") {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d ?? 1)).toLocaleDateString("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
