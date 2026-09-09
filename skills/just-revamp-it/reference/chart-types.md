# Chart types beyond the core

Forms the core system did not need. Specified from first principles, consistent with the grammar in `charts.md`. Sound, but less battle-tested than the core chapters. See the provenance note in `choosing.md`.

---

## Distributions

A category bar chart with hand-authored buckets is not a distribution. It hides the shape.

- **A histogram's bars touch.** Zero gap. That is the only visual signal that the x-axis is continuous rather than categorical, and losing it turns a histogram into a category chart that lies about its axis.
- **MUST — print the bin count and bin edges in the card subtitle.** Bin choice changes the apparent shape more than any other decision. An implicit binning is an unfalsifiable chart.
- **MUST — on a skewed distribution, print the median and the mean, labelled.** A dashboard that shows only a mean over a long tail is lying by omission. If they differ materially, that difference is the finding.
- **Percentiles get their own recipe:** one line per percentile, the median at full stroke, higher percentiles in the comparison treatment (same hue, dashed, reduced opacity). Label each line directly at its right edge.
- A box plot is right when you need to compare spread across many categories. It needs a legend explaining the box, because most readers cannot recall what the whiskers mean.

## Correlation and scatter

Scatter breaks two core assumptions, deliberately.

- **The one family exempt from the zero-baseline rule.** Both axes may be data-bounded, and **must then print their bounds**.
- **Overplotting needs a stated policy.** Below a few hundred points, reduce opacity. Above that, switch to hexbin or a density surface. Solid overlapping dots hide the density that is the entire point of the chart.
- **MUST NOT ship a trend line without stating what was fitted.** A smoothed line implies a model; name it in the subtitle.
- Point size as a third encoding is allowed only when **area**, not radius, is proportional to value, and the legend shows three reference sizes.
- Correlation is not causation, and a dashboard makes the claim implicitly by putting two things on one plot. If the pairing is suggestive rather than established, say so beside the chart, in prose (see `trust.md` §9).

## Geography

The org does not maintain a map component. A team that needs one adopts a library and inherits its projection. Three rules survive regardless:

- **MUST — a choropleth encodes rates, never raw counts.** Population is the confound: a count map is always a population map wearing your metric's name. This is the single most common error in dashboard maps.
- **The sequential ramp rules transfer unchanged**, including the per-hue alpha ceiling from `palette.mjs`.
- **MUST — the ramp is classed (quantile or natural breaks) and the class breaks are printed.** An unclassed continuous fill with no printed breaks is unfalsifiable.
- **A map without a ranked table or small multiple beside it is decoration.** Nobody reads a value off a shape. The map shows where; the table says how much.

## Big-N categorical

The core rules assume a small number of categories. Past roughly a dozen they break.

- **Top-N plus Other.** Rank by magnitude, show the top five to ten, aggregate the tail into one `Other (N categories)` row.
- **MUST — render Other in the neutral track colour, not the accent**, so it reads as a residual rather than a category. Make it expandable, or at minimum give it a tooltip listing its constituents.
- **Past about 12 rows, a bar chart is a table.** The bar-row geometry in `charts.md` already *is* a table with a bar in the middle column, so the transition is natural: add sort, add search, keep the bar as a column.
- **Where categories number in the hundreds, ship a searchable sortable table with an inline bar column.** Not a chart.
- Never assign categorical hues to solve this. Twelve hues is not a palette, it is a failure to aggregate.

## Financial and hierarchical tables

A profit-and-loss view needs things a metrics grid does not.

- **Indentation encodes depth.** One consistent step per level, applied to the label column only. Never indent the numeric columns.
- **Subtotals get a rule at the group's weight; the grand total gets the heavier rule** reserved for it. Depth is carried by rule weight plus indentation, never by colour.
- **MUST — one negative-value convention org-wide.** Parentheses or a true minus sign. Pick one and apply it everywhere, including exports.
- **Currency symbol on the first row of a column and the total row only**, never on every cell. Repeating it adds noise to exactly the column the reader is scanning.
- **Variance columns follow the polarity rule** in `numbers.md`. Under budget on cost is good; the colour must reflect that.
- Expand and collapse state belongs in the URL if the reader might share the view.

## Real-time and streaming

Draw the line explicitly by update frequency.

**Below roughly one update per minute: use the pull model.** Server-render, an explicit refresh control, and a load stamp in a named timezone. It is cheaper, it cannot desync, and it is what most "real-time" dashboards actually need.

**Above that, three rules:**

- **MUST — a value that updates under the reader's eye must never move layout.** Tabular figures, fixed-width slots, reserved space. A number that reflows while being read is unreadable.
- **A live view needs a visible live/paused state and a way to freeze it.** A reader who spots something needs to stop the world to look at it.
- **MUST NOT animate an auto-updating chart's transition.** The reader may be mid-read, and a transition destroys the value they were looking at. This is the one place where the no-animation rule in `interaction.md` matters most.

Also state the freshness taxonomy on any live surface: when the data was produced, when it was fetched, and when the view last updated. Those are three different times and readers assume they are one.
