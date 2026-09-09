import { TrendArrow } from "./icons";

/**
 * Direction and sentiment are decoupled: the arrow follows the sign, the colour
 * follows `goodWhenUp`. Falling cost is good; sign-based colour gets that wrong.
 *
 * Three states, not two. Exactly flat is neutral: green for flat claims an
 * improvement that did not happen.
 *
 * `pct == null` renders nothing at all, which is correct when the prior period was
 * zero or absent. There is no meaningful percentage change from nothing.
 *
 * Direction is never carried by colour alone: the arrow is drawn AND the direction
 * is in the accessible name, because a coloured magnitude says nothing to a reader
 * with red-green colour blindness (reference/accessibility.md).
 */
export function DeltaPill({
  pct, goodWhenUp = true, suffix = "",
}: { pct: number | null; goodWhenUp?: boolean; suffix?: string }) {
  if (pct == null || Number.isNaN(pct)) return null;
  const flat = pct === 0;
  const up = pct > 0;
  const tone = flat ? "flat" : up === goodWhenUp ? "good" : "bad";
  const word = flat ? "unchanged" : up ? "up" : "down";
  return (
    <span className={`jr-delta jr-delta--${tone}`}>
      <TrendArrow dir={flat ? "flat" : up ? "up" : "down"} />
      <span className="jr-sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {word}{" "}
      </span>
      {Math.abs(pct)}%{suffix}
    </span>
  );
}
