import { isValidElement, type ReactElement, type ReactNode } from "react";
import { highlight } from "@/lib/highlight";

/*
 * MDX renders a fenced block as <pre><code className="language-x">source</code></pre>. This replaces it with the
 * same markup, coloured at build time. Anything unexpected (no code child, an unknown language) falls back to
 * the plain block rather than failing the page.
 */
export async function CodeBlock({ children, ...props }: React.ComponentProps<"pre">) {
  const code = isValidElement(children) ? (children as ReactElement<{ className?: string; children?: ReactNode }>) : null;
  const source = typeof code?.props.children === "string" ? code.props.children.replace(/\n$/, "") : null;
  if (!code || source === null) return <pre {...props}>{children}</pre>;

  const lang = /language-([\w-]+)/.exec(code.props.className ?? "")?.[1];
  const lines = await highlight(source, lang);
  return (
    <pre {...props} data-lang={lang}>
      <code className={code.props.className}>
        {lines
          ? lines.map((line, i) => (
              <span key={i} className="line">
                {line.map((t, j) => (
                  <span key={j} style={{ color: t.color, fontStyle: t.italic ? "italic" : undefined }}>
                    {t.text}
                  </span>
                ))}
                {i < lines.length - 1 && "\n"}
              </span>
            ))
          : source}
      </code>
    </pre>
  );
}
