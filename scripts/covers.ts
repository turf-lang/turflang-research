// Exports article covers to static images: pnpm covers [--only <slug>] | pnpm covers --sheet <seed> [palette]
//
// Covers are generated from (motif, palette, seed) in lib/covers. The site serves the exported files instead of
// rendering SVG live, because the grain and displacement filters are slow in browsers and unsupported by the
// social-card crawlers that read og:image. Re-run after adding an article or changing its `cover`; the output is
// deterministic, so an unchanged article produces a byte-identical file.
//
//   public/covers/<slug>.webp     1600x1000, used on the site (cards, article header)
//   public/covers/<slug>-og.jpg   1200x630, the og:image / twitter:image: the same cover, recomposed for the card shape
//
// --sheet renders every motif in every palette for one seed into data/ (git-ignored) to choose from.
import { mkdirSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { motifs, palettes, renderCover, type CoverSpec, type PaletteName } from "../lib/covers/index.ts";
import { articles, type Article } from "../lib/articles.ts";

const args = process.argv.slice(2);

function raster(svg: string, width: number) {
  return new Resvg(svg, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: false } }).render().asPng();
}

async function exportCover(a: Article, spec: CoverSpec) {
  const slug = a.slug;
  const seed = spec.seed ?? slug;
  const page = raster(renderCover({ ...spec, seed }, { width: 1600, height: 1000 }), 1600);
  // The share image is the cover itself, composed again at 1200x630 rather than cropped from the 16:10 one.
  const og = raster(renderCover({ ...spec, seed }, { width: 1200, height: 630 }), 1200);
  mkdirSync("public/covers", { recursive: true });
  await sharp(page).webp({ quality: 84 }).toFile(`public/covers/${slug}.webp`);
  await sharp(og).jpeg({ quality: 86, mozjpeg: true }).toFile(`public/covers/${slug}-og.jpg`);
  console.log(`covers: ${slug} (${spec.motif}, ${spec.palette})`);
}

async function sheet(seed: string, only?: PaletteName) {
  const names = only ? [only] : (Object.keys(palettes) as PaletteName[]);
  const tw = 480;
  const th = 300;
  const gap = 12;
  const tiles: { input: Buffer; left: number; top: number }[] = [];
  names.forEach((palette, row) =>
    motifs.forEach((motif, col) => {
      const svg = renderCover({ motif, palette, seed }, { width: 1600, height: 1000 });
      tiles.push({ input: raster(svg, tw), left: gap + col * (tw + gap), top: gap + row * (th + gap) });
    }),
  );
  mkdirSync("data", { recursive: true });
  const out = `data/cover-sheet-${seed}${only ? `-${only}` : ""}.png`;
  await sharp({
    create: {
      width: gap + motifs.length * (tw + gap),
      height: gap + names.length * (th + gap),
      channels: 3,
      background: "#808080",
    },
  })
    .composite(tiles)
    .png()
    .toFile(out);
  console.log(`sheet: ${out} (rows: ${names.join(", ")}; columns: ${motifs.join(", ")})`);
}

if (args[0] === "--sheet") {
  await sheet(args[1] ?? "turflang", args[2] as PaletteName | undefined);
} else {
  const only = args[0] === "--only" ? args[1] : undefined;
  const list = articles.filter((a) => !only || a.slug === only);
  if (only && list.length === 0) {
    console.error(`covers: no article with slug "${only}"`);
    process.exit(2);
  }
  for (const a of list) {
    if ("src" in a.cover) {
      console.log(`covers: ${a.slug} uses a supplied image (${a.cover.src}), skipped`);
      continue;
    }
    await exportCover(a, a.cover);
  }
}
