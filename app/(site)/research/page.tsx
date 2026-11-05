import type { Metadata } from "next";
import { ArticleCard } from "@/components/article/card";
import { KindFilter } from "@/components/article/kind-filter";
import { kindOrder, kinds, listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

const description = "Research, experiments, engineering notes and explainers from the Turf Project.";

export const metadata: Metadata = {
  title: "All research",
  description,
  alternates: { canonical: "/research" },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: "/research",
    title: `All research · ${site.name}`,
    description,
    images: [site.ogImage],
  },
  twitter: { card: "summary_large_image", title: `All research · ${site.name}`, description, images: [site.ogImage] },
};

export default function Research() {
  const all = listArticles();
  const groups = kindOrder
    .map((k) => ({
      kind: k,
      label: kinds[k].plural,
      items: all.filter((a) => a.kind === k).map((a) => ({ key: a.slug, node: <ArticleCard article={a} /> })),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="container-page">
      <header className="pt-16 pb-12 sm:pt-20 md:pt-28 md:pb-16">
        <p className="eyebrow rise">Research</p>
        <h1 className="display rise mt-5 text-[48px] md:text-[72px]" style={{ "--i": 1 } as React.CSSProperties}>
          All research
        </h1>
        <p
          className="rise mt-5 max-w-[56ch] text-lg leading-relaxed text-ink-soft"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          Papers when they are published, the experiments behind them, and the engineering of the language, its
          compiler and the models that run inside it.
        </p>
      </header>

      {groups.length === 0 ? (
        <p className="border-t border-line-strong pt-10 text-ink-muted">Nothing is published yet.</p>
      ) : (
        <KindFilter groups={groups} />
      )}
    </div>
  );
}
