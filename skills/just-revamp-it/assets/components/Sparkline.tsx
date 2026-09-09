import { smoothPath } from "./geometry";

/**
 * Shape only. No axes, no labels, no gridlines: every addition dilutes what a
 * sparkline is for. The spec is fixed rather than parameterised.
 *
 * Decorative by default (it repeats a number already printed beside it), so it is
 * hidden from assistive technology unless given a label.
 */
export function Sparkline({
  values, color = "var(--accent-ui)", width = 120, height = 34, label,
}: { values: number[]; color?: string; width?: number; height?: number; label?: string }) {
  if (values.length < 2) return null;          // gate at the call site too, so no space is reserved
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (width - pad * 2),
    y: height - pad - ((v - min) / span) * (height - pad * 2),
  }));
  const d = smoothPath(pts);
  const last = pts[pts.length - 1];
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block", maxHeight: height }}
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d={`${d} L ${width - pad} ${height} L ${pad} ${height} Z`} fill={color} opacity={0.1} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r={2.25} fill={color} />
    </svg>
  );
}
