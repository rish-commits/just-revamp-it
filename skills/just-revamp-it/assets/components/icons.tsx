/**
 * Directional glyphs are drawn, never typed.
 *
 * A text arrow renders in the font's weight and never lines up with a stroked
 * icon family. These match at 2.5 stroke on a 24 box (reference/typography.md).
 */
export function TrendArrow({ dir, size = 11 }: { dir: "up" | "down" | "flat"; size?: number }) {
  const d =
    dir === "up" ? "M12 19V5M5 12l7-7 7 7" :
    dir === "down" ? "M12 5v14M19 12l-7 7-7-7" :
    "M5 12h14";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

export function ArrowIcon({ dir, size = 13 }: { dir: "left" | "right"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d={dir === "right" ? "M5 12h14M13 5l7 7-7 7" : "M19 12H5M11 19l-7-7 7-7"} />
    </svg>
  );
}

export function InfoIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
