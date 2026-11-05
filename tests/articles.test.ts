// The research index against the files it promises: a listed article without a body 404s at build, and one
// without an exported cover shows a broken image on the live site, so both fail here first.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { articles } from "../lib/articles.ts";
import { motifs, palettes, renderCover } from "../lib/covers/index.ts";

test("every article has a body, a valid date and a unique slug", () => {
  const seen = new Set<string>();
  for (const a of articles) {
    assert.ok(!seen.has(a.slug), `duplicate slug ${a.slug}`);
    seen.add(a.slug);
    assert.match(a.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `slug ${a.slug} is not kebab-case`);
    assert.match(a.date, /^\d{4}-\d{2}-\d{2}$/, `${a.slug}: date must be YYYY-MM-DD`);
    assert.ok(existsSync(`content/articles/${a.slug}.mdx`), `${a.slug}: missing content/articles/${a.slug}.mdx`);
  }
});

test("every article's cover exists: run `pnpm covers` after adding or changing one", () => {
  for (const a of articles) {
    if ("src" in a.cover) {
      assert.ok(existsSync(`public${a.cover.src}`), `${a.slug}: supplied cover public${a.cover.src} is missing`);
      continue;
    }
    assert.ok(motifs.includes(a.cover.motif), `${a.slug}: unknown motif ${a.cover.motif}`);
    assert.ok(a.cover.palette in palettes, `${a.slug}: unknown palette ${a.cover.palette}`);
    for (const f of [`public/covers/${a.slug}.webp`, `public/covers/${a.slug}-og.jpg`])
      assert.ok(existsSync(f), `${a.slug}: ${f} is missing; run pnpm covers --only ${a.slug}`);
  }
});

test("covers are deterministic, so re-exporting an unchanged article changes no file", () => {
  for (const motif of motifs) {
    const a = renderCover({ motif, palette: "clay", seed: "same" }, { width: 400, height: 250 });
    const b = renderCover({ motif, palette: "clay", seed: "same" }, { width: 400, height: 250 });
    const c = renderCover({ motif, palette: "clay", seed: "other" }, { width: 400, height: 250 });
    assert.equal(a, b, `${motif} is not deterministic`);
    assert.notEqual(a, c, `${motif} ignores its seed`);
  }
});
