# Numbers

Formatting is not cosmetic. A number formatted inconsistently is a number the reader has to re-parse, and a delta framed wrongly is a conclusion drawn wrongly.

---

## 1. Formatting, by kind

Decide these once per product and never per component.

- **Counts** print in full with thousand separators, **zero decimals**.
- **MUST NOT use compact notation** (`1.2k`, `3.4M`) in a dashboard. It destroys precision exactly where readers are comparing, and `1.2k` versus `1.3k` hides 99 people. Make full numbers survivable with tabular figures and right alignment instead. Compact notation is acceptable only in a space-constrained broadcast artefact, and then consistently.
- **Percentages: precision is set by the surface, not the value.** Rates over a population take 0 decimals. Rates where fractions of a percent are decision-relevant take 1. Pick per surface and apply to every percentage on it. A page mixing `43%` and `42.7%` looks like two systems.
- **Ratios** that are not percentages take one decimal and print bare with no unit.
- **Physical measurements** take at most one fraction digit. A signed physical delta gets an explicit leading `+` for positive.
- **Money** has one display form per magnitude class, and you must declare which classes exist. Two forms with no rule is the most common formatting drift in a dashboard.
- **MUST — pin one locale explicitly at every call site.** Never rely on the runtime default: it differs between a developer's machine, a server, and a reader's browser, so the same number renders differently in three places. Grouping conventions differ by locale in ways that change how a number reads.

## 2. Absence has four kinds

**MUST — name a token for each and never let them blur.**

| Kind | Meaning | Renders |
|---|---|---|
| Not measured | no source, or the source failed | `-` plus a hint naming the failed source |
| Measured zero | it happened zero times | a de-emphasised `0`, visible |
| Not applicable | this cannot have a value | `n/a` |
| Not yet reached | the period has not happened | empty space, not `0` |

- A ratio with no denominator prints `n/a`, never `0` in the unit. `₹0 cost per install` reads as free.
- When a source fails, blank the number **and** name the source in the hint. Never substitute zero.
- Cohort cells a cohort has not lived long enough to reach render as an **empty box of the same height as a filled cell**, never `0%`.
- Guard a zero denominator differently by what it feeds: a displayed rate yields `null`, a scale denominator floors at 1.
- **SHOULD** — reserve the ASCII hyphen for the absence token, and use a true minus sign (U+2212) if you print signs. They are different widths and different meanings.

## 3. Tabular figures

**MUST — apply per element, on the number itself.** Never globally via a stylesheet rule, because prose containing a number should keep proportional figures.

Gets tabular figures: every KPI value, hero value, delta pill, table numeric cell, axis tick, in-row count. Does **not**: hint lines, captions and prose beneath a value, even when they contain numbers.

A numeric table cell gets right alignment **and** tabular figures together, as one decision. A right-aligned cell whose content is prose is a different case and keeps normal alignment.

## 4. Deltas

**Compute once, in the data layer**, as a rounded integer percent, and hand the component a plain nullable number. A component that derives its own delta will derive it differently from the next one.

**Three states, not two:**

| State | Arrow | Colour |
|---|---|---|
| Up | ↑ | by polarity |
| Down | ↓ | by polarity |
| Exactly flat | horizontal bar | **neutral, never green** |

Colouring a flat delta green claims an improvement that did not happen.

**MUST — decouple direction from sentiment.** The arrow follows the sign. The colour follows a per-metric polarity flag. Falling cost, falling churn, falling time-to-first-action are *good*; rising churn is *bad*. Sign-based colour gets every one of those wrong.

Declare the polarity flag on a tile **even when it currently has no delta**, where it sits visually inert. Polarity is a property of the metric, not of this render. The alternative is discovering it is missing the day the delta appears.

**A delta is null, and the badge simply does not render, whenever the prior period is zero or absent.** Never show `0%`, `∞`, `new`, or `+100%` for growth from nothing. There is no meaningful percentage change from zero, and inventing one is the most common way a dashboard reports spectacular fake growth.

In an interactive surface the pill shows **magnitude only**; the sign is carried by the arrow and the colour. Redundant signs read as clutter.

**Arrows are drawn**, not typed. An inline SVG path at the icon family's stroke weight. Text glyphs (`↑ ↓ →`) render in the font's weight and never line up with the real icons.

## 5. Comparison windows

**MUST — declare one comparison window per surface and disclose it in the copy.** "vs previous 7 days" is a different claim from "vs the same week last year", and an unlabelled delta is uninterpretable.

- **Average the daily values of a count** to get its baseline. **Never average the daily values of a ratio** — recompute the ratio from summed numerator and denominator. Averaging ratios weights small days equally with large ones and produces a number that is not the ratio of anything.
- Compare each metric to **its own** trailing baseline with a named multiplier threshold. Never a cross-metric ratio.
- Where one row's baseline differs from the table's column header, annotate that row inline rather than adding a column or silently mislabelling it.
- **MUST — the current period is usually incomplete.** Either exclude it, or draw it distinctly and say so. A partial day plotted against complete days always looks like a collapse.

## 6. Percentages and denominators

- **A percentage never appears without its denominator somewhere in the same tile** — hint line, comparison footer, or info text.
- Where the naive form of a rate is unbounded or misleading, substitute a bounded definition and **explain the substitution** in the metric's own definition, including why the naive version fails.
- A count and its rate ship as a pair, in **one** rendering used everywhere. Three competing forms for "12 of 40 (30%)" is drift.
- **Small samples:** name the base size and the word "directional" in the interface copy, not only in a code comment.

## 7. Time

- **MUST — define every calendar day in one named timezone** and produce it identically everywhere. A day boundary that moves with the reader makes two people disagree about yesterday.
- **Format a date-only bucket key in UTC; format an instant in a named timezone.** Getting this backwards shifts labels by a day near midnight, which is the hardest dashboard bug to notice and the easiest to disbelieve once found.
- Derive week keys explicitly (ISO Monday-anchored) and comment the derivation.
- **Model granularity as a closed set** — day, week, month — with one shared module supplying bucket key, label and gap-fill, and one shared control. Type the label by granularity so the unit is never guessed: `08 Sep`, `wk 08 Sep`, `Sep 2026`.
- **Gap-fill every time axis** to a contiguous range before rendering, so a zero-activity period occupies a slot instead of being skipped. A skipped period compresses the axis and hides the outage.
- Put the granularity control on the drill-down page, not the summary card. A summary card states one window.
- **A reproducible report pins the period it is about in its own URL or payload** and re-derives everything from that, never from the wall clock.

## 8. Thresholds

When a status or flag is derived from a threshold, **write the threshold, the current value and the baseline into the sentence.** "Installs 40% below the 7-day average (120 vs 200)" is checkable. "Installs down sharply" is an opinion.

Where a metric's boundary values *are* its meaning, put the thresholds in the legend label itself, not only in a tooltip.

A per-record status and the aggregate counting those records **must resolve through the same function**, with the same boundaries. Two implementations will disagree, and the disagreement will surface in a meeting.

## 9. Colour

**MUST — green and red are reserved exclusively for change against a comparison.** Not for categories, not for chrome, not for active states. See `color.md`.

---

## Checklist

- [ ] One locale, pinned at every call site
- [ ] No compact notation
- [ ] Percentage precision fixed per surface
- [ ] Four absence tokens, distinct
- [ ] Tabular figures on values, not on prose
- [ ] Delta computed once, three states, polarity flag declared
- [ ] No delta from a zero baseline
- [ ] Comparison window disclosed
- [ ] Ratio baselines recomputed, not averaged
- [ ] Incomplete current period excluded or marked
- [ ] Every percentage has its denominator
- [ ] One named timezone, gap-filled axes
