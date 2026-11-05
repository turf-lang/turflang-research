# turflang-research

[research.turflang.org](https://research.turflang.org): research from the Turf Project, which builds the
[Turflang](https://turflang.org) language, its compiler and the models around it.

Next.js 16 with MDX articles and KaTeX maths, all rendered at build time, deployed on Vercel.

## Develop

```bash
pnpm install
pnpm dev
```

No environment variables are needed.

## Publishing an article

1. Write `content/articles/<slug>.mdx` and add its entry to `lib/articles.ts` (start with `draft: true`).
2. Pick a cover: `pnpm covers --sheet <slug>` renders every motif and palette into `data/`; set `cover` to the
   one you like, then `pnpm covers --only <slug>` exports it to `public/covers/`.
3. Check it under `pnpm dev`, remove `draft`, and commit the article, its entry and its two cover files.

An article can use GFM, KaTeX maths, `<Note>`, `<Figure>` and drawn diagrams (`components/article/diagram.tsx`).

## Checks

`pnpm test && pnpm typecheck && pnpm lint && pnpm build`. Conventions are in [`AGENTS.md`](AGENTS.md).
