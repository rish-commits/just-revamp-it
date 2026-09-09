# Charts

A chart is an argument about data. Every rule here is about making the argument honest and readable in about three seconds.

**One chart, one question.** If you cannot write the question in a sentence, do not build the chart. Put that sentence in the component's doc comment and in the card's subtitle; if they disagree, one of them is wrong.

---

## 1. Choose the form

Pick by the **shape of the question**, not the type of the data.

| The question | The form |
|---|---|
| How has this moved over time? | Line, zero-based, time on x |
| Which of these is biggest? | Ranked horizontal bars, descending |
| Where do people fall out? | Funnel, left-aligned bars |
| How does the mix change over time? | Stacked columns |
| Did it grow or shrink, net? | Signed stacked columns around a zero line |
| How does one cohort compare across periods? | Heat grid |
| What is the exact value for this row? | A table |
| What is this single number? | A stat tile, never a chart |

**MUST NOT:** pie or donut beyond three slices (angle is the hardest encoding to compare, ranked bars are strictly better), 3D anything, dual y-axes (they manufacture correlations), and a chart built to fill a grid cell.

**SHOULD:** order nominal categories by magnitude descending, computed from the totals in the data layer rather than by arrival order. Ordinal categories keep their natural order.

## 2. Scales and domains

- **MUST — every count and rate axis starts at zero.** A truncated baseline turns a 3% change into an apparent doubling. For series that go negative, clamp the floor at zero rather than at the data minimum, so the axis still contains the origin.
- **MUST — floor every denominator at the point of computation.** `max(...values, 1)`, `sum || 1`, `first || 1`. A zero denominator otherwise yields `NaN` or `Infinity` and renders as a blank or a broken shape rather than an honest zero.
- **SHOULD — set the domain top to the exact data maximum**, with no nice-rounding and no headroom. The peak touching the top edge is information: it says "this is the highest point". Rounding up to a pretty number wastes vertical space and flattens the series.
- **MUST — a chart refuses to draw below a stated minimum** and says so in plain language instead of rendering a degenerate shape. A line needs at least two points. State the minimum; do not silently emit an empty SVG.

## 3. Gridlines and axes

- Four horizontal gridlines at 0, ⅓, ⅔ and max. More is noise; fewer loses the reference.
- **Three distinct non-data stroke weights, never reused across jobs:** gridline 1px dashed in a light neutral, axis or baseline 1px solid, annotation or comparison 1px dashed in a mid neutral. If a reader cannot tell a gridline from a data line, the chart has failed before the data arrives.
- **Value axis on the right**, in a narrow gutter, with minimal left padding. Readers scan a trend left to right and want the current value where their eye lands, not where it started.
- Axis text at two fixed sizes and one colour: value ticks slightly larger with tabular figures, category and date labels slightly smaller. Both muted.
- **MUST NOT drop axis labels to fit.** Above about ten points, rotate every label −45° about its own anchor and grow the bottom padding. Thinning labels to every other tick makes readers misread which bar is which.
- **MUST NOT** put axis titles, units, or captions inside the plot. The card's title, subtitle and info affordance carry all of that. A chart that must explain itself inside its own frame is a chart in the wrong container.

## 4. Lines

- **One smoothing function for the whole system.** Catmull-Rom converted to cubic bezier, tension ≈ 0.18. Route every curve through it. Two smoothing functions means two visual languages for the same idea.
- Make the path generator degrade rather than throw, with an explicit contract: fewer than two points returns empty, exactly two returns a straight segment.
- **Data stroke weights are fixed at three values:** primary series ≈ 2.25, secondary or comparison ≈ 1.75, and a thinner weight for context. A new chart does not get to invent a fourth.
- Fill the area under a trend at ≈ 0.1 opacity of the line's own colour, closed to the plot baseline rather than the SVG bottom.
- Charts read oldest to newest, left to right. Tables of the same data usually read newest first. When one component renders both from one array, **reverse explicitly and comment why**, or someone will "fix" it.

## 5. Bars

**One horizontal bar row component**, used by every ranking, funnel and distribution. Label left, track centre, value cluster right.

- **MUST — clamp a non-zero bar to a minimum visible width** (≈1.5% of the track). A real value must never render as absent. **A true zero gets zero width**, plus a small neutral stub so the category is visibly present at zero. Those are different states and must look different.
- **Print a value inside a filled segment only when it exceeds ≈8% of the bar width.** Below that, leave it out and let the value cluster outside carry it.
- **MUST NOT place a numeral on a fill whose colour varies with the data.** If the fill is a gradient or a continuous ramp, the number moves outside. You cannot guarantee contrast against a colour you do not control.
- Vertical columns: inset the plot, slice the remainder into equal slots, cap bar width (≈40) so a three-bar chart does not render three billboards.
- **Signed/stacked around a zero line:** scale both directions against **one shared denominator** so the zero line floats proportionally. Positive stacks up, negative stacks down, **position carries the sign, and the printed figure carries only magnitude.** Declare direction with an explicit field on the series descriptor; never infer it from the value's sign.

## 6. Funnels

See `funnel.md` for the full spec. The rules that belong here:

- Normalise bar length against the **first step**, not the maximum, and clip overflow so a step that legitimately exceeds the first does not break the track.
- **Flag exactly one step per funnel**, defined as the largest **absolute** decline between consecutive steps. Largest percentage decline picks a trivial step off a tiny base.
- **Flag it in the delta text, never by recolouring the bar.** Bar length and fill encode the data; recolouring one bar makes it look like a different series.
- Render break, interstitial or non-measured steps in the **same hue at reduced opacity, never grey**. Grey reads as a different kind of data.
- Exclude soft steps (cross-source, aggregate, not a true per-user rate) from worst-step detection entirely.

## 7. Sparklines

Fix the spec and stop parameterising it: a small fixed viewBox, a light stroke with round caps, area fill at ≈0.1, an end-point dot, no axes, no labels, no gridlines. A sparkline shows *shape*, and any addition dilutes that.

Gate on "more than one point" **at the call site**, so the tile never reserves space for a sparkline that will not render.

## 8. Heat grids

- Express a sequential ramp as **one hue at varying alpha over the surface**, and cap the alpha where your chosen ink still clears 4.5:1. `palette.mjs` computes that ceiling per hue; do not reuse another brand's number.
- **Three cell states, not two:** no data renders as an empty cell with no fill at all; a measured zero renders flat neutral; a value renders on the ramp.
- Choose the domain by unit: a percentage grid maps to an absolute 0–100 domain, a count grid to the observed maximum. Same ramp function, different domain.
- **Print the number in every cell and ship no colour legend.** Colour is the scan layer, the numeral is the answer layer. If the numbers do not fit, the grid is too dense, and a legend will not fix that.
- Wide matrices scroll inside their own container with the first column pinned and given an explicit opaque background, or it will show data sliding underneath it.

## 9. Labels and legends

- **Ship a legend only when colour encodes a category not already written next to the mark.** Per-row charts label directly and need none. A legend is a lookup table the reader has to hold in memory.
- A hover panel on a multi-series chart repeats the legend **with values**, in the same order and with the same swatches.
- Carry a secondary figure (share, unit cost, rate) as a quiet note beside the value, not as another column.
- An optional muted sub-label under a row label, glossing what the row means, is usually worth more than any additional chart.

## 10. Empty and degenerate data

- **Guard emptiness twice:** once at the call site, so the surrounding card can be suppressed or reworded, and once inside the component, so it can never render a broken axis.
- One fixed empty treatment across every chart: a short muted sentence in domain language. Not a spinner, not a zero-line chart, not blank space.

## 11. Interaction and accessibility

- **Hover targets are full-height transparent bands one slot wide**, laid over the plot, not the marks themselves. Hitting a 2px line with a mouse is not a design.
- Position HTML tooltips over SVG by converting viewBox coordinates to percentages of a positioned wrapper.
- **MUST — every informative chart carries `role="img"` and an `aria-label` built from a fixed sentence template**: series name, point count, first and last labelled values, and the peak or total. This is the only way a hand-built SVG chart is readable at all by a screen reader, and it costs one line.
- Native `title` elements give a zero-JS detail layer on HTML charts. Write them as complete sentences.
- **Every numeral in a column, beside another numeral, or updating on hover gets tabular figures.** Non-optional.

## 12. Sizing

Fix a viewBox per chart type, let the element scale to full width, cap it with a max height, and do not touch `preserveAspectRatio`. Put a minimum-width override of zero on any card that can contain a chart or table, or a wide child will refuse to shrink and push the card out of its grid track.

## 13. On charting libraries

This system was extracted from a dashboard that ships **zero** charting libraries: every visualisation is raw SVG or flex/HTML. That is a legitimate and often superior choice for dashboards, because a complete primitive set is a few hundred lines, it removes a large dependency, and it gives exact control over every rule above, most of which libraries fight you on.

**MAY** — use a library if your team prefers. But the rules above are the contract either way, and a library that cannot honour the zero-baseline, minimum-bar-width, three-absence-states and per-fill-contrast rules is the wrong library for a dashboard.

**MUST NOT** — ship a picture of a chart into a channel that cannot render one. See `broadcast.md`.
