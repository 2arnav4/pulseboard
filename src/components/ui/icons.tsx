import type { SVGProps } from "react";

/**
 * The few functional glyphs the UI needs (search, menu, close, reorder). Drawn as thin
 * strokes in currentColor so they read as typography, not decoration. Always decorative:
 * the surrounding control carries the accessible name.
 */
function Glyph({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const SearchGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </Glyph>
);

export const MenuGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <path d="M4 8h16M4 16h16" />
  </Glyph>
);

export const CloseGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Glyph>
);

export const UpGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <path d="M7 14l5-5 5 5" />
  </Glyph>
);

export const DownGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <path d="M7 10l5 5 5-5" />
  </Glyph>
);

/** Three short rules: the conventional "grab here" reorder mark. */
export const GripGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <path d="M7 9h10M7 12h10M7 15h10" />
  </Glyph>
);
