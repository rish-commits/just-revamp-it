import { smoothPath } from "./geometry";
import { EmptyState } from "./Card";

export type Series = { label: string; values: (number | null)[]; comparison?: boolean };

/**
 * Zero-based, four gridlines, value axis on the right, labels rotated rather than
 * dropped. Comparison series are the same hue dashed, never a second colour.
 *
 * Refuses to draw below two points rather than emitting a degenerate axis.
 */
export function LineTrend({
  series, labels, height = 200, ariaLabel,
}: { series: Series[]; labels: string[]; height?: number; ariaLabel?: string }) {
  const points = labels.length;
  if (points < 2) return <EmptyState>Not enough data to draw a trend yet.</EmptyState>;

  const W = 600, padL = 6, padR = 38, padB = labels.length > 10 ? 50 : 26, padT = 8;
  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  const max = Math.max(...all, 1);                 // floor at 1 so an all-zero series still has an axis
  const plotW = W - padL - padR, plotH = height - padT - padB;
  const x = (i: number) => padL + (i / (points - 1)) * plotW;
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const rotate = labels.length > 10;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${height}`} style={{ display: "block" }}
      role="img" aria-label={ariaLabel ?? `${series.map((s) => s.label).join(" and ")}. ${points} points from ${labels[0]} to ${labels[points - 1]}. Peak ${max.toLocaleString()}.`}>
      {[0, 1, 2, 3].map((k) => {
        const v = (max * k) / 3;
        return (
          <g key={k}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)}
              stroke="var(--gridline, rgba(0,0,0,0.08))" strokeWidth={1} strokeDasharray="3 4" />
            <text x={W - padR + 7} y={y(v) + 3} fontSize={11} fill="var(--muted)"
              style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(v).toLocaleString()}</text>
          </g>
        );
      })}
      {series.map((s) => {
        const pts = s.values.map((v, i) => (v == null ? null : { x: x(i), y: y(v) }))
          .filter((p): p is { x: number; y: number } => p != null);
        if (pts.length < 2) return null;
        const d = smoothPath(pts);
        return (
          <g key={s.label}>
            {!s.comparison && <path d={`${d} L ${pts[pts.length - 1].x} ${padT + plotH} L ${pts[0].x} ${padT + plotH} Z`}
              fill="var(--accent-ui)" opacity={0.1} />}
            <path d={d} fill="none" stroke="var(--accent-ui)"
              strokeWidth={s.comparison ? 1.75 : 2.25} strokeLinecap="round"
              strokeDasharray={s.comparison ? "4 4" : undefined} opacity={s.comparison ? 0.45 : 1} />
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={height - padB + 14} fontSize={10} fill="var(--muted)"
          textAnchor={rotate ? "end" : "middle"}
          transform={rotate ? `rotate(-45 ${x(i)} ${height - padB + 14})` : undefined}>{l}</text>
      ))}
    </svg>
  );
}
