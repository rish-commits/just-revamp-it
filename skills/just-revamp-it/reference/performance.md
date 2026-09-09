# Performance

The hand-built approach in `charts.md` is a good default and it has a real ceiling. State it, so teams know when they have crossed it.

**The limit is node count, not code size.** A complete primitive set is a few hundred lines and will never be your problem. Ten thousand rects will.

---

## Budgets

- **Roughly 1,000 DOM nodes per chart** as a soft ceiling. A 30-day stacked bar with four series is 120 marks and entirely fine. A 365-day one with eight series is not.
- **Above that, aggregate the data before rendering rather than optimising the chart.** A reader cannot perceive 2,920 individual bars, so rendering them is work spent on something nobody sees. Roll up to weeks.
- **Above roughly 5,000 marks, canvas is the correct answer**, and it **costs you the accessibility tree**. So a canvas chart ships with a mandatory table equivalent, which `accessibility.md` requires anyway.
- **Page weight:** set a number and check it. Server-rendering thirty charts of two hundred points each ships a very large HTML document, and that cost is invisible in development on a fast machine.

## Where the work belongs

- **Interactivity is a thin shell over pre-rendered data.** Render on the server; hydrate only what needs a pointer.
- **A toggle that refetches is a design failure at dashboard data sizes.** Render every view and swap them, or ship the raw rows once and compute in the client.
- **A native title beats a scripted tooltip whenever the payload is one line.** It costs nothing, it survives inside scroll containers, and it works before hydration.
- **Filtering runs over the full set; only the render is capped.** See `scale.md`.
- Above roughly 10,000 rows, aggregation moves server-side and client filtering stops being permitted.

## What not to optimise

Dashboards are read for tens of seconds by a handful of internal people. Before optimising, check the request actually matters. The two things that reliably do:

1. **Time to the first correct number.** A reader who sees a skeleton for four seconds does not care that the bundle is small.
2. **Not moving under the reader.** Layout shift after load is worse than a slower load, because it destroys a number someone was already reading.

Everything else is usually noise at this scale.
