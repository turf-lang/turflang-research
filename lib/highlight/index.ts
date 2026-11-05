/*
 * Syntax highlighting for article code blocks, run while the page is built: readers get coloured HTML and never
 * download a highlighter.
 *
 * Turflang is highlighted with turf-lsp's own TextMate grammar (turf.tmLanguage.json, copied from
 * turf-lsp/editors/vscode/syntaxes/, the same file turflang.org uses), so the site colours code the way the
 * editor does. Re-copy it when the grammar changes.
 *
 * Colours are CSS variables (--code-* in globals.css) rather than hex values, so one highlighted block follows
 * the light and dark themes without being highlighted twice. The JavaScript regex engine avoids shipping
 * Oniguruma's WebAssembly to the Worker.
 */
import { createHighlighterCore, type HighlighterCore, type LanguageRegistration, type ThemeRegistration } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import json from "shiki/langs/json.mjs";
import shell from "shiki/langs/shellscript.mjs";
import typescript from "shiki/langs/typescript.mjs";
import grammar from "./turf.tmLanguage.json";

const v = (name: string) => `var(--code-${name})`;

const theme: ThemeRegistration = {
  name: "turf-vars",
  type: "light",
  colors: { "editor.background": "transparent", "editor.foreground": v("fg") },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: v("comment"), fontStyle: "italic" } },
    { scope: ["punctuation", "keyword.operator", "meta.brace"], settings: { foreground: v("punct") } },
    { scope: ["keyword", "storage", "storage.modifier"], settings: { foreground: v("keyword") } },
    { scope: ["string", "constant.character", "punctuation.definition.string"], settings: { foreground: v("string") } },
    { scope: ["constant.numeric", "constant.language", "variable.language"], settings: { foreground: v("number") } },
    { scope: ["entity.name.type", "support.type", "storage.type", "entity.name.class"], settings: { foreground: v("type") } },
    { scope: ["entity.name.function", "support.function", "variable.function"], settings: { foreground: v("fn") } },
    { scope: ["entity.name.namespace", "entity.name.module"], settings: { foreground: v("type") } },
    { scope: ["invalid"], settings: { foreground: v("invalid") } },
  ],
};

const turf = { ...grammar, name: "turf", aliases: ["turflang", "tr"] } as unknown as LanguageRegistration;

let highlighter: Promise<HighlighterCore> | undefined;
const get = () =>
  (highlighter ??= createHighlighterCore({
    themes: [theme],
    langs: [turf, shell, json, typescript],
    engine: createJavaScriptRegexEngine(),
  }));

export type CodeToken = { text: string; color?: string; italic?: boolean };

/** Lines of coloured tokens, or null for a language the site does not know (the block then renders plain). */
export async function highlight(code: string, lang: string | undefined): Promise<CodeToken[][] | null> {
  // The tokenizer reads Date.now() for its time limits, which Cache Components rejects while prerendering. A
  // cached scope captures the result into the static page instead, which is what a build-time highlighter is.
  "use cache";
  const hl = await get();
  // getLanguage() throws for a language that is not loaded rather than returning nothing, so ask the loaded
  // list: a ```text block (a diagnostic, a log) must render plain, not fail the page.
  const id = lang && hl.getLoadedLanguages().includes(lang) ? lang : null;
  if (!id) return null;
  const { tokens } = hl.codeToTokens(code, { lang: id, theme: "turf-vars" });
  return tokens.map((line) =>
    line.map((t) => ({ text: t.content, color: t.color, italic: ((t.fontStyle ?? 0) & 1) === 1 })),
  );
}
