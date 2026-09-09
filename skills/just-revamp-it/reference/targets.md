# Targets, forecasts and thresholds

Three different objects that readers constantly confuse, and that most dashboards draw identically. The distinction is the chapter.

- **A target is a decision.** Someone owns it. It is not measured.
- **A forecast is an estimate.** Nobody owns it. It has uncertainty.
- **A threshold is a rule.** It converts a measurement into a status.

**MUST — all three render differently from measured data, and from each other.**

| Object | Renders as |
|---|---|
| Measured value | Solid mark in the data colour |
| Target | A thin solid reference rule with a label. Never a series |
| Forecast | Dashed stroke, muted, with a band, prefixed to signal approximation |
| Threshold | A reference rule in the status colour, labelled with its value |

---

## 1. Targets

**MUST — a target is a reference mark, never a second series.** Drawn as a bar beside the actual, a reader compares two bars and cannot tell which one is real.

**Actual versus target is a bullet chart or a progress meter, never two adjacent bars.**

**Bullet chart anatomy:** one measured bar, a perpendicular tick for the target, and optional quiet qualitative bands behind (poor / acceptable / good) in neutral tints. The measured bar is the only thing in the data colour. It is compact enough to stack many of them, which is why it beats a gauge.

**Progress meter:** the target is 100% of the track. Print the raw pair (`412 of 500`) alongside the percentage, because a percentage of a target is meaningless without the target.

**Pacing is a separate metric and needs its own honesty.** "40% of target" at day 12 of 30 reads as failure and is actually ahead. **MUST — a pace figure states the elapsed proportion of the period beside it**, or renders an expected-to-date marker on the track.

**Colour follows the same polarity rule as deltas.** A target you want to stay under (cost, latency, churn) inverts. See `numbers.md`.

**A target with no owner and no date is a wish.** Record both in the metric's definition.

## 2. Forecasts

**MUST — a forecast without a band is not shippable.** A single projected line reads as measurement.

- **Name what the band means in the card subtitle**, not the tooltip: confidence interval, scenario range, or model percentile range. An unnamed band is decoration.
- **Mark the boundary between actual and forecast on the axis**, not only by changing the stroke. A stroke change alone is missed at a glance and invisible in print.
- **Projected values are excluded from any automated "biggest change" or "worst" detection**, exactly like soft funnel steps in `funnel.md`. The mechanism generalises: one flag on the datum drives the visual register, the exclusion, and the note.
- Never extend a forecast further than the model supports because the chart has space.

## 3. Thresholds and alerting

A threshold turns a number into a status. That is a strong claim and needs the same discipline as any other derived value.

- **A threshold renders as a reference rule**, same treatment as a target, labelled with its value. A status with no visible threshold is unfalsifiable.
- **A breached metric gets a status chip**, using the closed status set in `color.md`.
- **MUST — compare each metric against its own baseline, never a cross-metric ratio.** "Signups are low relative to installs" is a different and usually wrong claim from "signups are low relative to their own trailing average".
- **MUST — an alert sentence states the measurement, its baseline, and the size of the gap.** "Installs 40% below the 7-day average (120 vs 200)" is checkable. "Installs down sharply" is an opinion.
- **Escalation is monotone.** Define the severity order once, rank the rules, and let the first match become the headline.
- **Where boundary values *are* the meaning, put the thresholds in the legend label**, not only in a tooltip.
- **A per-record status and the aggregate counting those records resolve through the same function.** Two implementations will disagree in a meeting.

### Alert fatigue is a design problem

**An alert that fires every day for two weeks is a threshold bug, not a persistent emergency.** State the policy:

- Every threshold has an **owner** and a **review cadence**.
- A threshold that has fired continuously beyond a stated window is automatically flagged for review.
- If the org wants muting or acknowledgement, define whether a muted alert is hidden or shown as muted. Hidden alerts get forgotten and then someone is surprised.

### On screen, not only in the pipe

Threshold logic often lives only in whatever pushes notifications, and never appears on the dashboard the same team reads every day. **If a metric has a threshold, the dashboard shows its status.** Otherwise the notification and the dashboard tell different stories, and readers trust neither.

A "needs attention" summary at the top of a surface, listing breached metrics as sentences, is usually worth more than any additional chart.
