import type { ReactNode } from "react";
import { TrendArrow } from "./icons";
import { Sparkline } from "./Sparkline";

/**
 * The one sanctioned gradient in the system, for the single headline number.
 * Fills its grid cell so the row reads as one block, with the sparkline taking
 * the slack rather than leaving a void.
 */
export function HeroStat({
  label, value, deltaPct = null, deltaAbs, spark, caption, comparison = "vs prev period",
}: {
  label: string; value: ReactNode; deltaPct?: number | null; deltaAbs?: number;
  spark?: number[]; caption?: string; comparison?: string;
}) {
  const up = (deltaAbs ?? deltaPct ?? 0) >= 0;
  return (
    <div className="jr-hero">
      <div className="jr-hero__label">{label}</div>
      <div className="jr-hero__value">{value}</div>
      {deltaPct != null && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 6px", marginTop: 4, fontSize: "var(--text-body)" }}>
          <span className="jr-num" style={{ display: "inline-flex", alignItems: "center", gap: 4,
            borderRadius: "var(--radius-pill)", background: "rgb(255 255 255 / .2)", padding: "2px 6px",
            fontWeight: "var(--weight-semibold)" }}>
            <TrendArrow dir={up ? "up" : "down"} />
            {Math.abs(deltaPct)}%
          </span>
          <span style={{ color: "rgb(255 255 255 / .85)" }}>
            {deltaAbs != null ? `${up ? "+" : ""}${deltaAbs} ${comparison}` : comparison}
          </span>
        </div>
      )}
      {spark && spark.length > 1 && (
        <div className="jr-hero__spark"><Sparkline values={spark} color="#fff" width={320} height={56} /></div>
      )}
      {caption && <div className="jr-hero__caption">{caption}</div>}
    </div>
  );
}
