<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# AGENTS.md

Guidance for AI coding agents working on research.turflang.org, the Turf Project's public research site.
Conventions follow the compiler repository's `AGENTS.md` (`turf-lang/turf-lang`), adapted to a web app.

## What this repo is

- **Next.js 16** (App Router, `cacheComponents: true`, Turbopack), Tailwind v4, deployed on **Vercel**.
- A static site: articles are MDX rendered at build time, covers are files in `public/`. No database, no sign-in,
  no secrets, and no third-party scripts (the CSP in `next.config.ts` enforces that last one).
- This repository is **public**. Anything committed here is published, history included.

## Commands

```bash
pnpm dev                                   # no env needed
pnpm test                                  # every listed article has a body and exported covers
pnpm typecheck && pnpm lint && pnpm build
pnpm covers [--only <slug>]                # export article covers to public/covers/
pnpm covers --sheet <seed> [palette]       # every motif x palette for a seed, into data/, to choose from
```

All four of `test`, `typecheck`, `lint` and `build` must pass before a change is done.

## Repo map

- `app/(site)/` public pages. `lib/articles.ts` is the research index (title, summary, date, type, area, cover);
  each article's body is `content/articles/<slug>.mdx` (MDX with GFM and KaTeX maths, rendered at build time).
  `mdx-components.tsx` and `components/article/` hold what an article can use.
- `lib/covers/` the cover generator: (motif, palette, seed) to SVG, framework-free. `scripts/covers.ts` exports it
  to `public/covers/<slug>.webp` and `-og.jpg`; the site serves those files and never renders covers live.
- `proxy.ts` gives unknown article slugs a real 404 before the prerendered shell is sent.
- `next.config.ts` security headers (CSP, HSTS, framing, referrer, permissions) on every response.
- `tests/` `node --test`. `tests/articles.test.ts` fails when a listed article has no body or no exported cover.

## Conventions this project holds firmly to

- **No unpublished research content in this repository or on the site.** A paper under review does not appear
  at all: no entry, no placeholder, no title, authors, methods, numbers or study details. It gets an article on
  the day it is public. Engineering articles and explainers about the public language and compiler are fine.
  Anything about how a study is run lives in private repositories, never here.
- **Doc comments explain WHY, not what.** A hidden invariant, a past bug this code prevents, a non-obvious
  constraint; not a restatement of the code.
- **No typed arrows or dots as UI.** Separators are `<Meta>` (a drawn dot in a flex gap), icons come from
  `components/icons.tsx`, labels are `<Tag>` in flex rows, never pills inside running text. Buttons use the `.btn`
  sizes (`btn-sm`, default, `btn-lg`, `btn-icon`) rather than ad-hoc heights, with even horizontal padding.
- **Small, scoped commits.** One logical change per commit, with a message that explains the why and the
  failure it prevents.
  - Title format is `type(scope): summary (@username)`: Conventional Commits (`feat`/`fix`/`test`/`docs`/
    `refactor`/`misc`, optional scope) with the committer's `git config user.name` in parens at the end.
  - No `Co-Authored-By` trailer or other AI-attribution text in the message body.
- **Verify claims live, don't assume.** Before writing that something is enforced, try the input that would
  break it. The guide's worked examples were run through `turfc`; keep doing that when they change (a first draft
  used `double`, a type keyword, as a function name).
- **Design.** Warm cream paper palette in light mode (the default for everyone), turflang.org's palette in dark
  (opt-in through the header toggle), one set of tokens in `app/globals.css`. Diagnostic colours mean what the
  compiler means: red removed/wrong, green added/fixed. Motion follows the design-engineering skill in
  `.claude/skills/`: one entrance per page; respect `prefers-reduced-motion`.
