/*
 * The few icons the site uses, drawn on a 16px grid with a 1.5px stroke. They replace typed arrows ("←", "→"):
 * a glyph's position in its em box depends on the font, so typed arrows sat off-centre inside round buttons.
 */
type Props = { className?: string };

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ChevronLeft({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </svg>
  );
}

export function ChevronRight({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

/* Keycap glyphs for the arrow keys, drawn so they centre in a .kbd the way the letters do. */
export function ArrowLeft({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12.5 8h-9M7 4.5 3.5 8 7 11.5" />
    </svg>
  );
}

export function ArrowRight({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
    </svg>
  );
}

export function Sun({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.5v1.25M8 13.25v1.25M1.5 8h1.25M13.25 8h1.25M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" />
    </svg>
  );
}

export function Moon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />
    </svg>
  );
}
