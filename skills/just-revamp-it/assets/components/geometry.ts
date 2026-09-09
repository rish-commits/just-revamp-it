/** Shared chart geometry. One smoothing function for the whole system. */

export type Pt = { x: number; y: number };

/** Catmull-Rom to cubic bezier at tension 0.18. Degrades rather than throwing. */
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  const t = 0.18;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += ` C ${(p1.x + (p2.x - p0.x) * t).toFixed(1)} ${(p1.y + (p2.y - p0.y) * t).toFixed(1)}` +
         ` ${(p2.x - (p3.x - p1.x) * t).toFixed(1)} ${(p2.y - (p3.y - p1.y) * t).toFixed(1)}` +
         ` ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Minimum visible fill, applied only to non-zero values. A true zero draws nothing. */
export const MIN_FILL_PCT = 1.5;
export const fillWidth = (pct: number, value: number): number =>
  value ? Math.max(pct, MIN_FILL_PCT) : 0;

/** Print a label inside a segment only above this share of the bar. */
export const IN_FILL_LABEL_PCT = 8;

/** Two-anchor positional ramp. Handles any N; an enumerated palette breaks at N+1. */
export function rampAt(t: number, from: [number, number, number], to: [number, number, number]): string {
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * t));
  return `rgb(${c.join(",")})`;
}
