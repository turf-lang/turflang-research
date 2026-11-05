"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: 2 | 3 };

/*
 * The article's sections, read from the rendered body rather than the MDX source: rehype-slug assigns the ids,
 * and reading them back from the DOM means this list can never disagree with the anchors it links to.
 * The current section is the last heading that has scrolled past the top quarter of the viewport.
 */
export function Toc({ bodyId }: { bodyId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const body = document.getElementById(bodyId);
    if (!body) return;
    const els = [...body.querySelectorAll<HTMLHeadingElement>(":scope > h2[id], :scope > h3[id]")];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the headings exist only once the body has rendered
    setHeadings(els.map((el) => ({ id: el.id, text: el.textContent ?? "", level: el.tagName === "H2" ? 2 : 3 })));

    const update = () => {
      const line = window.innerHeight * 0.25;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [bodyId]);

  if (headings.length < 2) return null;
  return (
    <nav aria-labelledby="toc-title" className="text-[13px]">
      <p id="toc-title" className="eyebrow">
        Sections
      </p>
      <ol className="mt-4 space-y-2.5 border-l border-line">
        {headings.map((h) => {
          const on = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px block border-l py-0.5 leading-snug transition-colors duration-150 ${
                  h.level === 3 ? "pl-7" : "pl-4"
                } ${on ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
