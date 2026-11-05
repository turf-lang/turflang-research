import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/lib/site";
import { ArticleCard, FeatureCard, KindHead } from "@/components/article/card";
import { areas, kindOrder, kinds, listArticles } from "@/lib/articles";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const org = {
  "@type": "Organization",
  "@id": `${site.orgUrl}/#org`,
  name: site.org,
  url: site.orgUrl,
  logo: `${site.url}/icon.png`,
  sameAs: [site.github],
};

const rise = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function Home() {
  const [lead, ...more] = listArticles();
  // After the lead, the rest sit on one shelf per kind, newest three each, so research never mixes with notes.
  const groups = kindOrder
    .map((k) => ({ kind: k, label: kinds[k].plural, items: more.filter((a) => a.kind === k).slice(0, 3) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            org,
            {
              "@type": "WebSite",
              "@id": `${site.url}/#website`,
              name: site.name,
              url: site.url,
              description: site.description,
              inLanguage: "en",
              publisher: { "@id": org["@id"] },
            },
          ],
        }}
      />
      <section className="container-page pt-16 pb-20 sm:pt-20 md:pt-32 md:pb-28">
        <h1 className="display rise max-w-[18ch] text-[42px] sm:text-[60px] md:text-[80px]">
          Making programming <span className="squiggle">easier</span> for people, and the models that code with them.
        </h1>
        <p className="rise mt-8 max-w-[58ch] text-lg leading-relaxed text-ink-soft md:mt-10" style={rise(1)}>
          The Turf Project builds Turflang, a statically typed, ahead-of-time compiled language, along with the
          compiler, tools and models around it, and studies what they do. Because we own every layer, we can change
          one and measure what the change does: for a programmer reading an error, and for a model trying to fix it.
        </p>
      </section>

      {lead && (
        <section className="container-page" aria-labelledby="latest">
          <SectionHead id="latest" title="Latest">
            <Link href="/research" className="text-sm text-ink-soft hover:text-ink">
              All research
            </Link>
          </SectionHead>
          <div className="mt-8">
            <FeatureCard article={lead} />
          </div>
          {groups.map((g) => (
            <div key={g.kind} className="mt-16">
              <KindHead as="h3" label={g.label} count={g.items.length} />
              <ul className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((a) => (
                  <li key={a.slug}>
                    <ArticleCard article={a} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <section className={`container-page ${lead ? "mt-28 md:mt-36" : ""}`} aria-labelledby="areas">
        <SectionHead id="areas" title="What we work on" />
        <ul className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(areas).map(([key, a]) => (
            <li key={key} className="border-l border-line pl-5 lg:first:border-l-0 lg:first:pl-0">
              <h3 className="display text-[26px] leading-tight">{a.name}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{a.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-28 md:mt-36" aria-label="The language">
        <div className="grid gap-4">
          <div className="flex flex-col rounded-[20px] border border-line bg-paper-raised p-7 md:p-10">
            <p className="eyebrow">The language</p>
            <h2 className="display mt-4 text-[30px] md:text-[38px]">Turflang is public, and so is its compiler.</h2>
            <p className="mt-4 max-w-[46ch] leading-relaxed text-ink-soft">
              Every claim made here about the language can be checked against the compiler itself. The guide,
              reference and source live on the language&apos;s own site.
            </p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <a href="https://turflang.org" className="btn btn-primary">
                Visit turflang.org
              </a>
              <a href="https://github.com/turf-lang" className="btn btn-ghost">
                Source on GitHub
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

function SectionHead({ id, title, children }: { id: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line-strong pt-4">
      <h2 id={id} className="eyebrow">
        {title}
      </h2>
      {children}
    </div>
  );
}
