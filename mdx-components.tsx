import type { MDXComponents } from "mdx/types";
import { Figure, Note } from "@/components/article/blocks";
import { CodeBlock } from "@/components/article/code-block";

/*
 * Elements MDX produces, mapped to the site's article styles. Most styling lives on `.prose-article` in
 * globals.css; components here only add structure CSS cannot (a scroll container for wide tables, external
 * link attributes).
 */
const components: MDXComponents = {
  a: ({ href = "", ...props }) =>
    /^https?:\/\//.test(href) ? (
      <a href={href} target="_blank" rel="noreferrer" {...props} />
    ) : (
      <a href={href} {...props} />
    ),
  pre: CodeBlock,
  table: (props) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
  Figure,
  Note,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
