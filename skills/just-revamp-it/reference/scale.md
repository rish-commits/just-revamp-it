# Data volume

What happens at both ends. Most dashboards are designed against a convenient middle and break at the extremes they will actually meet.

---

## 1. Small N

**MUST — the small-sample policy is a number in the data layer, not an adjective in a subtitle.**

A hand-typed "directional" in a card subtitle never gets removed when the base grows, so it either stays forever and is ignored, or is deleted and never returns when a filter shrinks the base again.

**The rule:** below a stated threshold (30 is a defensible default) in any cell, cohort or segment, the surface either

- suppresses the percentage and shows the raw fraction (`4 / 11`), or
- prints the rate with an explicit low-base marker.

Because the threshold is a constant in the data layer, the caveat appears and disappears on its own as the data changes. That is the entire point.

**A percentage over a base of 7 is not wrong, it is unstable.** Readers treat it identically to one over 7,000 unless the interface stops them.

## 2. Large N

State three numbers and enforce them.

- **The render cap.** Filter and count over the full set; render the first N. This is correct and must be kept. State the count and what is hidden (`tables.md`).
- **The virtualisation threshold.** The row count at which your table implementation must virtualise. Evidence from the source system: 50 rendered rows already pushed a page past 7,600 pixels. Long before rendering slows down, the page becomes unnavigable.
- **The server-side threshold.** Above roughly 10,000 rows, aggregation moves server-side and client-side filtering is no longer permitted. Shipping 10,000 rows to a browser to filter three of them is a data-transfer bug wearing an interaction pattern.

## 3. Degenerate geometry

**Publish a range table per chart type:** minimum viable N, maximum before the form breaks, and the fallback at each end.

| Form | Minimum | Maximum before it breaks | Fallback |
|---|---|---|---|
| Line | 2 points | ~120 points | Below: a stat tile. Above: downsample or aggregate the bucket |
| Funnel | 2 steps | ~8 steps | Above: group steps into phases, or drop the positional ramp to a single fill |
| Ranked bars | 1 row | ~12 rows | Above: top-N plus Other, then a table |
| Heat grid | 2×2 | ~20 columns | Above: sticky first column plus scroll affordance, or aggregate the period |
| Stacked columns | 2 series | ~6 series | Above: aggregate the tail into Other |
| Sparkline | 2 points | any | Below: render nothing, and do not reserve the space |

**The funnel ceiling has a specific cause worth knowing.** A two-anchor positional ramp divides its range by step count, so past about eight steps adjacent stops differ by only a few values per channel and stop being distinguishable. Colour then encodes nothing. Either group into phases or drop to one fill.

**MUST — every chart enforces its own minimum at the component boundary** and degrades to a sentence, never to an empty axis or a broken shape. A chart that cannot be drawn says so in domain language.

## 4. The other extreme: one

Single-row and single-point cases are where systems look unfinished.

- A one-row bar chart is a stat tile.
- A single-cohort retention triangle is a line.
- A one-step funnel is a count.
- A chart with one series needs no legend.

Handle these deliberately rather than letting a general renderer produce something technically correct and visibly wrong.
