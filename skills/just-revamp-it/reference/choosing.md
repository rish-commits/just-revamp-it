# Choosing a form

The first decision, and the one most often skipped. Load this before `charts.md`.

**Key on the question, not the data type.** "I have a time series" does not tell you what to draw. "Is this growing?" does.

---

## The table

| The question the reader has | The form |
|---|---|
| How much / how many? | Ranked horizontal bars |
| How has it changed over time? | Line |
| What is it made of? | Stacked bar, or a single share bar |
| How does the mix change over time? | Stacked columns |
| Did it grow or shrink, net? | Signed columns around a zero line |
| Where do people fall out? | Funnel |
| Are we on track? | Bullet / target chart, or a progress meter (`targets.md`) |
| How is it spread? | Histogram or box plot (`chart-types.md`) |
| How do two things relate? | Scatter (`chart-types.md`) |
| Where is it? | Map, with a ranked table beside it (`chart-types.md`) |
| How does this cohort age? | Heat grid / retention triangle |
| What is the exact value for this row? | Table |
| What is this one number? | A stat tile. Not a chart |
| Is anything wrong right now? | A status list, not a wall of charts (`targets.md`) |

If two rows fit, the reader has two questions, and that is two charts or one chart and a table.

## Forms this system does not ship, and why

Write the reason down, because "no pie charts" without one gets re-litigated every quarter.

- **Pie or donut beyond two slices.** Angle is the least accurate visual encoding. Three slices are already hard to rank; a ranked bar is strictly better and takes less space.
- **A donut with a number in the hole.** That is a stat tile wearing a chart. Ship the stat tile.
- **3D anything.** Perspective makes near values look larger. It adds no dimension of information.
- **Dual y-axes.** Two scales on one plot manufacture correlations by choosing the scales. Use two stacked charts sharing an x-axis.
- **Radar / spider.** Area scales with the square of the values, the shape depends on category order, and nobody can read a value off it.
- **Word clouds.** Size encodes frequency, position encodes nothing, and long words look more important.
- **Sankey**, unless flow is genuinely conserved (what enters a node leaves it). For drop-off, use a funnel.
- **Gauges and speedometers.** They spend a lot of space on one number and usually hide the comparison that makes it meaningful. Use a bullet chart.
- **Decorative funnels and pyramids.** A tapering shape encodes the same number twice and makes adjacent steps incomparable.

## Before you draw anything

Four questions. If you cannot answer all four, the chart is not ready.

1. **What question does this answer?** One sentence. It becomes the card title.
2. **What would make the reader act differently?** If nothing, cut the chart.
3. **What is the comparison?** A number with no comparison is trivia. Previous period, target, baseline, or peer.
4. **What population?** See `trust.md`.

## Escalation

- **One number** → stat tile.
- **A number and its trend** → stat tile with a sparkline.
- **A number, its trend, and its parts** → stat tile plus one chart.
- **More than that** → you have more than one question. Split the card.

## Provenance of these rules

This system was extracted from one product-analytics dashboard. The forms above that it actually shipped (bars, lines, funnels, stacked columns, heat grids, sparklines) carry validated detail in `charts.md` and `funnel.md`. The forms it never shipped (distributions, scatter, maps, targets, forecasts, financial tables) are specified from first principles in `chart-types.md` and `targets.md`, consistent with the same grammar. Treat the second group as sound but unproven, and tell the system owner when you find a rule that does not survive contact with your data.
