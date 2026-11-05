import Link from "next/link";
import { Meta, Tag } from "@/components/meta";
import { areas, coverSrc, formatDate, kinds, type Article } from "@/lib/articles";

/* Covers are exported at 1600x1000; stating the size reserves the box before the image arrives. */
export function Cover({ article, className = "", eager = false }: { article: Article; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static files on Workers; there is no optimiser
    <img
      src={coverSrc(article)}
      alt=""
      width={1600}
      height={1000}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className={`block aspect-[16/10] w-full rounded-[14px] bg-paper-sunk object-cover ${className}`}
    />
  );
}

/** The lead article: cover and text side by side from md up, stacked below. */
export function FeatureCard({ article }: { article: Article }) {
  return (
    <Link href={`/research/${article.slug}`} className="group grid gap-6 md:grid-cols-[1.25fr_1fr] md:items-center md:gap-12">
      <div className="overflow-hidden rounded-[14px]">
        <Cover article={article} eager className="transition-transform duration-500 ease-out md:group-hover:scale-[1.015]" />
      </div>
      <div>
        <CardMeta article={article} />
        <h3 className="display mt-4 text-[32px] transition-colors duration-150 group-hover:text-accent md:text-[44px]">
          {article.title}
        </h3>
        <p className="font-text mt-4 max-w-[48ch] text-[17px] leading-relaxed text-ink-soft">{article.summary}</p>
      </div>
    </Link>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/research/${article.slug}`} className="group block">
      <div className="overflow-hidden rounded-[14px]">
        <Cover article={article} className="transition-transform duration-500 ease-out md:group-hover:scale-[1.02]" />
      </div>
      <CardMeta article={article} className="mt-5" />
      <h3 className="display mt-3 text-[24px] leading-tight transition-colors duration-150 group-hover:text-accent">
        {article.title}
      </h3>
      <p className="font-text mt-2 line-clamp-3 text-[16px] leading-relaxed text-ink-muted">{article.summary}</p>
    </Link>
  );
}

function CardMeta({ article, className = "" }: { article: Article; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      {article.draft && <Tag tone="warn">Draft</Tag>}
      <Meta
        className="text-[13px] text-ink-muted"
        items={[kinds[article.kind].label, areas[article.area].name, formatDate(article.date, "short")]}
      />
    </div>
  );
}

/* A kind's heading: its name and how many articles it holds, on a rule. Used by the index and the homepage. */
export function KindHead({
  id,
  label,
  count,
  as: H = "h2",
}: {
  id?: string;
  label: string;
  count: number;
  as?: "h2" | "h3";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line-strong pt-4">
      <H id={id} className="eyebrow">
        {label}
      </H>
      <span className="font-mono text-xs text-ink-faint tabular-nums">{count}</span>
    </div>
  );
}
