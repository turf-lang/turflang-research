// Social cards (og:image, twitter:image), 1200x630: pnpm og
//
// The site's card (homepage, All research and every page without its own image): the wordmark, a serif
// headline and a footer line, type only. Articles share their cover instead (pnpm covers). Text is laid out here, not by a browser, so lines are measured with resvg
// itself (the same engine that rasterises the card) and wrapped by width rather than by character count.
//
// Fonts are TTF copies under scripts/fonts/ (resvg cannot read woff2): Newsreader and Hanken Grotesk from google/fonts,
// Commit Mono converted from @fontsource's WOFF. All three are OFL 1.1.
//
//   public/og.png                 the site card (layout metadata)
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const fontFiles = ["Newsreader.ttf", "Newsreader-Italic.ttf", "HankenGrotesk.ttf", "CommitMono-Medium.ttf"].map(
  (f) => new URL(`./fonts/${f}`, import.meta.url).pathname,
);
const fontOpts = { fontFiles, loadSystemFonts: false, defaultFontFamily: "Hanken Grotesk" };

const W = 1200;
const H = 630;
const PAD = 64;
const ink = "#1f1c18";
const paper = "#f4eee2";
const muted = "rgba(31,28,24,0.68)";
const faint = "rgba(31,28,24,0.5)";
const accent = "#34597f";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Advance width of a run of text, measured by resvg so it matches the final render exactly. */
function inkBox(text: string, family: string, size: number, tracking = 0) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="400"><text x="0" y="300" font-family="${family}" font-size="${size}" letter-spacing="${tracking}">${esc(text)}</text></svg>`;
  const box = new Resvg(svg, { font: fontOpts }).getBBox();
  return box ? { x: box.x, w: box.width } : { x: 0, w: 0 };
}

/** The right edge of the ink from the pen position: what the next item's spacing is measured from. */
function measure(text: string, family: string, size: number, tracking = 0) {
  const b = inkBox(text, family, size, tracking);
  return b.x + b.w;
}

function wrap(text: string, family: string, size: number, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, family, size) > max) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export type OgSpec = {
  title: string;
  /** A word or phrase in the title drawn with the compiler squiggle (the site card underlines "easier"). */
  squiggle?: string;
  /** Footer items, separated by a drawn dot (never a typed "·", whose spacing depends on the font). */
  footer: string[];
};

export function renderOgSvg(spec: OgSpec) {
  // Type only: a picture beside the headline competed with it at the size a feed shows the card.
  const textW = 940;

  // Largest size (down to a floor) at which the title fits in three lines.
  let size = 76;
  let lines = wrap(spec.title, "Newsreader", size, textW);
  while (lines.length > 3 && size > 44) {
    size -= 4;
    lines = wrap(spec.title, "Newsreader", size, textW);
  }
  const lead = size * 1.08;
  const blockH = lead * (lines.length - 1) + size * 0.72;
  const top = (H - blockH) / 2 + size * 0.72;

  const parts: string[] = [];
  lines.forEach((l, i) => {
    const y = top + i * lead;
    parts.push(
      `<text x="${PAD}" y="${y.toFixed(1)}" font-family="Newsreader" font-size="${size}" letter-spacing="${(-size * 0.02).toFixed(2)}" fill="${ink}">${esc(l)}</text>`,
    );
    const at = spec.squiggle ? l.indexOf(spec.squiggle) : -1;
    if (spec.squiggle && at >= 0) {
      // Locate the word by where its ink ends in the set line, then step back by its own ink width.
      const tracking = -size * 0.02;
      const end = measure(l.slice(0, at + spec.squiggle.length), "Newsreader", size, tracking);
      const w = inkBox(spec.squiggle, "Newsreader", size, tracking).w;
      const x0 = PAD + end - w;
      const sy = y + size * 0.12;
      let d = `M${x0.toFixed(1)} ${(sy + 3).toFixed(1)}`;
      for (let x = x0, k = 0; x < x0 + w; x += 4, k++) d += ` L${(x + 4).toFixed(1)} ${(sy + (k % 2 ? 3 : 0)).toFixed(1)}`;
      parts.push(`<path d="${d}" fill="none" stroke="${accent}" stroke-width="2" stroke-linejoin="round"/>`);
    }
  });

  const slashX = PAD + measure("turflang", "CommitMono", 24) + 14;
  const wordmark =
    `<text x="${PAD}" y="${PAD + 18}" font-family="CommitMono" font-size="24" fill="${ink}">turflang</text>` +
    `<text x="${slashX.toFixed(1)}" y="${PAD + 18}" font-family="Hanken Grotesk" font-size="24" fill="${faint}">/</text>` +
    `<text x="${(slashX + 22).toFixed(1)}" y="${PAD + 18}" font-family="Newsreader" font-style="italic" font-size="30" fill="${ink}">Research</text>`;

  let fx = PAD;
  const footer = spec.footer
    .map((item, i) => {
      let out = "";
      if (i > 0) {
        out += `<circle cx="${(fx + 11).toFixed(1)}" cy="${H - PAD - 2}" r="2" fill="${faint}"/>`;
        fx += 21;
      }
      out += `<text x="${fx.toFixed(1)}" y="${H - PAD + 4}" font-family="Hanken Grotesk" font-size="20" fill="${muted}">${esc(item)}</text>`;
      fx += measure(item, "Hanken Grotesk", 20);
      return out;
    })
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${paper}"/>` +
    wordmark +
    parts.join("") +
    footer +
    `</svg>`
  );
}

export function renderOgPng(spec: OgSpec) {
  return new Resvg(renderOgSvg(spec), { font: fontOpts, fitTo: { mode: "width", value: W } }).render().asPng();
}

/** The site card. Kept here so the homepage headline and the card can be compared in one place. */
export const siteCard: OgSpec = {
  title: "Making programming easier for people, and the models that code with them.",
  squiggle: "easier",
  footer: ["research.turflang.org", "The Turf Project"],
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await sharp(renderOgPng(siteCard)).png({ compressionLevel: 9 }).toFile("public/og.png");
  console.log("og: public/og.png");
}
