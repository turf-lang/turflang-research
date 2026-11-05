import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

// Public pages only. Drafts never reach a production build (lib/articles.ts), so they never reach the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = listArticles();
  const newest = articles[0]?.date;
  return [
    { url: site.url, lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/research`, lastModified: newest, changeFrequency: "weekly", priority: 0.8 },
    ...articles.map((a) => ({
      url: `${site.url}/research/${a.slug}`,
      lastModified: a.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
