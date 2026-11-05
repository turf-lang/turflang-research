import "katex/dist/katex.min.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cover } from "@/components/article/card";
import { Toc } from "@/components/article/toc";
import { JsonLd } from "@/components/json-ld";
import { Meta, Tag } from "@/components/meta";
import { areas, findArticle, formatDate, kinds, listArticles, ogSrc } from "@/lib/articles";
import { site } from "@/lib/site";

/*
 * Cache Components refuses an empty list here, and a production build with only drafts has no articles. The
 * sentinel is never an article (slugs are kebab-case, tests/articles.test.ts), so it prerenders as a 404.
 */
export function generateStaticParams() {
  const slugs = listArticles().map((a) => ({ slug: a.slug }));
  return slugs.length > 0 ? slugs : [{ slug: "_none" }];
}

export async function generateMetadata({ params }: PageProps<"/research/[slug]">): Promise<Metadata> {
  const a = findArticle((await params).slug);
  if (!a) return { title: "Not found" };
  const url = `/research/${a.slug}`;
  const image = { url: ogSrc(a), width: 1200, height: 630, alt: a.title };
  return {
    title: a.title,
    description: a.summary,
    authors: (a.authors ?? [site.org]).map((name) => ({ name })),
    keywords: ["Turflang", kinds[a.kind].label, areas[a.area].name],
    alternates: { canonical: url },
    robots: a.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      siteName: site.name,
      url,
      title: a.title,
      description: a.summary,
      publishedTime: a.date,
      authors: a.authors,
      section: areas[a.area].name,
      tags: [kinds[a.kind].label, areas[a.area].name],
      images: [image],
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.summary, images: [image] },
  };
}

/*
 * Opted out of Next 16's instant-navigation check, which flags reading `params` outside Suspense. Moving the read
 * into Suspense silenced it but turned unknown slugs into 200 responses with a 404 body (notFound() after the
 * stream had started). Nothing here blocks in practice: every published slug is prerendered by
 * generateStaticParams, so a navigation to one is a static page either way.
 */
export const instant = false;

export default async function ArticlePage({ params }: PageProps<"/research/[slug]">) {
  const { slug } = await params;
  const a = findArticle(slug);
  if (!a) notFound();
  const { default: Body } = await import(`@/content/articles/${slug}.mdx`);
  const rise = (i: number) => ({ "--i": i }) as React.CSSProperties;

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": a.kind === "research" ? "ScholarlyArticle" : a.kind === "engineering" ? "TechArticle" : "Article",
          headline: a.title,
          description: a.summary,
          datePublished: a.date,
          url: `${site.url}/research/${a.slug}`,
          mainEntityOfPage: `${site.url}/research/${a.slug}`,
          image: `${site.url}${ogSrc(a)}`,
          inLanguage: "en",
          articleSection: areas[a.area].name,
          author: (a.authors ?? [site.org]).map((name) => ({ "@type": "Person", name })),
          publisher: { "@type": "Organization", name: site.org, url: site.orgUrl, logo: `${site.url}/icon.png` },
          isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
        }}
      />
      <header className="container-page pt-14 pb-10 md:pt-24 md:pb-14">
        <div className="mx-auto max-w-[880px] text-center">
          <div className="rise flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {a.draft && <Tag tone="warn">Draft</Tag>}
            <Meta
              className="justify-center text-sm text-ink-muted"
              items={[
                <Link key="k" href="/research" className="hover:text-ink">
                  {kinds[a.kind].label}
                </Link>,
                areas[a.area].name,
              ]}
            />
          </div>
          <h1 className="display rise mt-6 text-[38px] sm:text-[48px] md:text-[64px]" style={rise(1)}>
            {a.title}
          </h1>
          <p className="font-text rise mx-auto mt-6 max-w-[56ch] text-lg leading-relaxed text-ink-soft" style={rise(2)}>
            {a.summary}
          </p>
        </div>
      </header>

      <div className="container-page">
        <Cover article={a} eager className="rise mx-auto rounded-[18px]" />
      </div>

      <div className="container-page mt-12 md:mt-16">
        {/* Details on the left, the body, then its sections on the right from xl up (below that they would
            squeeze the measure, and the details column already carries the page). */}
        <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[168px_minmax(0,1fr)_184px] xl:gap-x-20">
          <aside className="text-sm lg:sticky lg:top-24 lg:self-start">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-5 sm:grid-cols-4 lg:grid-cols-1 lg:border-y-0 lg:py-0">
              <Detail label="Published">{formatDate(a.date)}</Detail>
              <Detail label="Type">{kinds[a.kind].label}</Detail>
              <Detail label="Area">{areas[a.area].name}</Detail>
              {a.authors && a.authors.length > 0 && <Detail label="Written by">{a.authors.join(", ")}</Detail>}
            </dl>
            {a.links && a.links.length > 0 && (
              <div className="mt-6 flex flex-col gap-2">
                {a.links.map((l) => (
                  <a key={l.href} href={l.href} className="btn btn-ghost w-full">
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </aside>

          <div id="article-body" className="prose-article min-w-0 xl:mx-auto">
            <Body />
          </div>

          <aside className="hidden xl:sticky xl:top-24 xl:block xl:max-h-[calc(100dvh-8rem)] xl:self-start xl:overflow-y-auto">
            <Toc bodyId="article-body" />
          </aside>
        </div>
      </div>
    </article>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 text-ink-soft">{children}</dd>
    </div>
  );
}
