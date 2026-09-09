import { TrendArrow } from "./icons";
import { fillWidth, rampAt } from "./geometry";
import { EmptyState } from "./Card";

export type FunnelStep = {
  label: string;
  /** null = the source is unavailable. Renders a dash and NO bar, never a zero-length one. */
  value: number | null;
  /** One line stating the step's meaning and its source. */
  note?: string;
  /** Not a true per-user rate (cross-source, aggregate). Marked, and excluded from leak detection. */
  soft?: boolean;
  /** An interstitial or non-measured step: same hue, reduced opacity, never grey. */
  break?: boolean;
};

const DARK: [number, number, number] = [76, 29, 149];
const LIGHT: [number, number, number] = [167, 139, 250];

/**
 * The canonical funnel. Left-aligned rows, never a pyramid.
 *
 * Encoded here so a team cannot get them wrong:
 *  - length is share of the FIRST step, not the max
 *  - non-zero fills floor at a visible minimum; a true zero draws nothing
 *  - the step number is the CHANGE vs the step above, not survivor conversion
 *  - exactly 0% prints "0%", never blank: a silent blank reads as missing data
 *  - steps above 100% are shown, not clamped
 *  - exactly one step is flagged, by largest ABSOLUTE drop, in the TEXT only
 *  - soft steps are excluded from that detection entirely
 */
export function FunnelBars({ steps, showNotes = false }: { steps: FunnelStep[]; showNotes?: boolean }) {
  if (!steps.length) return <EmptyState>No funnel data available.</EmptyState>;

  const base = steps[0].value || 1;
  const n = steps.length;

  let worst = -1;
  let worstDrop = 0;
  for (let i = 1; i < n; i++) {
    const prev = steps[i - 1].value;
    const cur = steps[i].value;
    if (prev == null || cur == null || steps[i].soft) continue;   // never flag an approximate transition
    const drop = prev - cur;
    if (drop > worstDrop) { worstDrop = drop; worst = i; }
  }

  return (
    <div className="jr-bars">
      {steps.map((s, i) => {
        const pct = s.value == null ? 0 : (s.value / base) * 100;
        const prev = i > 0 ? steps[i - 1].value : null;
        const change =
          s.value != null && prev != null && prev > 0
            ? Math.round((s.value / prev) * 100) - 100
            : null;
        const tone = rampAt(n > 1 ? i / (n - 1) : 0, DARK, LIGHT);
        return (
          <div className="jr-bar" key={`${s.label}-${i}`}>
            <div className="jr-bar__label" title={s.label}>{s.label}</div>
            <div className="jr-bar__track"
              title={`${s.label}: ${s.value?.toLocaleString() ?? "not measured"}${s.note ? ` · ${s.note}` : ""}`}>
              {s.value != null && (
                <div className="jr-bar__fill"
                  style={{ width: `${fillWidth(pct, s.value)}%`, background: tone, opacity: s.break ? 0.4 : 1 }} />
              )}
            </div>
            <div className="jr-bar__values">
              <span className="jr-bar__count">{s.value?.toLocaleString() ?? "-"}</span>
              {change != null && (
                <span className={`jr-bar__change${i === worst ? " jr-bar__change--worst" : ""}`}
                  title={`${change < 0 ? "Dropped" : change > 0 ? "Grew" : "Unchanged"} ${Math.abs(change)}% vs the step above`}>
                  {change !== 0 && <TrendArrow dir={change > 0 ? "up" : "down"} size={9} />}
                  {s.soft ? "≈" : ""}{Math.abs(change)}%
                </span>
              )}
            </div>
            {showNotes && <div className="jr-bar__note" title={s.note}>{s.note}</div>}
          </div>
        );
      })}
    </div>
  );
}
