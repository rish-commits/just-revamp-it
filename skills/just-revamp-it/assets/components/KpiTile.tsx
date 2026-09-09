import type { ReactNode } from "react";
import { DeltaPill } from "./DeltaPill";
import { InfoDot } from "./Tooltip";
import { Sparkline } from "./Sparkline";

/**
 * Muted label, big number, delta, comparison footer, optional sparkline.
 *
 * `goodWhenUp` is declared even when there is no delta yet, where it sits inert.
 * Polarity is a property of the metric, not of this render; the alternative is
 * discovering it is missing the day the delta appears.
 */
export function KpiTile({
  label, value, deltaPct = null, goodWhenUp = true, spark, hint, info, compare,
}: {
  label: string;
  value: ReactNode;
  deltaPct?: number | null;
  goodWhenUp?: boolean;
  spark?: number[];
  hint?: ReactNode;
  info?: ReactNode;
  compare?: { label?: string; value: ReactNode } | null;
}) {
  const footer = compare
    ? <>Vs {compare.label ?? "prev"}: <strong className="jr-num">{compare.value}</strong></>
    : hint;
  return (
    <div className="jr-kpi">
      <div className="jr-kpi__head">
        <span className="jr-kpi__label">{label}</span>
        {info && <InfoDot text={info} about={label} />}
      </div>
      <div className="jr-kpi__row">
        <span className="jr-kpi__value">{value}</span>
        <DeltaPill pct={deltaPct} goodWhenUp={goodWhenUp} />
      </div>
      {footer != null && footer !== "" && <div className="jr-kpi__footer">{footer}</div>}
      {spark && spark.length > 1 && <div style={{ marginTop: 8 }}><Sparkline values={spark} /></div>}
    </div>
  );
}
