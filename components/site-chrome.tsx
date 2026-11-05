import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Wordmark({ suffix = "Research" }: { suffix?: string }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-mono text-[15px] font-medium tracking-tight">turflang</span>
      <span className="text-ink-faint">/</span>
      <span className="display text-[19px] italic">{suffix}</span>
    </span>
  );
}

/*
 * The header breadcrumb: turflang (the language site) / Research (this site's home). It stays the same on every
 * page; the page itself says where you are, and the navigation beside it links within.
 */
export function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="inline-flex items-baseline gap-2">
      <a href="https://turflang.org" className="font-mono text-[15px] font-medium tracking-tight hover:text-accent">
        turflang
      </a>
      <span className="text-ink-faint" aria-hidden>
        /
      </span>
      <Link href="/" className="display text-[19px] italic hover:text-accent">
        Research
      </Link>
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="container-page flex h-14 items-center justify-between gap-6">
        <Breadcrumb />
        <nav aria-label="Site" className="flex items-center gap-3 text-sm text-ink-soft">
          <Link href="/research" className="rounded-md px-2 py-1.5 hover:text-ink">
            All research
          </Link>
          <ThemeToggle className="-mr-2" />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-line md:mt-36">
      <div className="container-page grid gap-10 py-14 text-sm text-ink-muted sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3 sm:col-span-2 md:col-span-1">
          <Wordmark />
          <p className="max-w-sm leading-relaxed">
            Research from the Turf Project, which builds the Turflang language, its compiler and the models around
            it, on making programming easier for people and for the models that code with them.
          </p>
        </div>
        <FooterColumn
          title="Research"
          links={[
            { label: "All research", href: "/research" },
          ]}
        />
        <FooterColumn
          title="The Turf Project"
          links={[
            { label: "The language", href: "https://turflang.org" },
            { label: "GitHub", href: "https://github.com/turf-lang" },
          ]}
        />
      </div>
      <div className="container-page pb-10 font-mono text-xs text-ink-faint">
        <span className="text-hint">ok</span>: 0 errors, 0 warnings
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            {l.href.startsWith("http") ? (
              <a href={l.href} className="hover:text-ink">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="hover:text-ink">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
