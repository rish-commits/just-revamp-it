# Other output surfaces

A dashboard reaches more places than its own URL. Each destination removes affordances the design leans on. See `broadcast.md` for the pushed-artefact register; this chapter covers the rest.

---

## Print and PDF

**MUST — background colours are stripped by default when printing.** Every encoding in this system is a background fill, so an unprepared dashboard prints as a page of empty outlines with the data gone.

- Set an explicit colour-adjust on data marks, or carry a redundant non-background encoding.
- **Declare page breaks:** avoid breaking inside a card, break after a section.
- **Everything hover-dependent is lost.** Sticky headers, scroll containers, tooltips and info affordances are all no-ops on paper. That makes "put the methodology in the info dot" a print hazard: **render info content as footnotes at print time.**
- **MUST — the freshness stamp and the reporting period appear on the printed page.** A printed dashboard has no other provenance, and it will outlive the meeting it was printed for.

## Presentation and projection

Dashboards get projected and screenshared constantly, and screenshots leave the building.

Two options. Pick one and write it down.

1. **A presentation mode:** a root-level type bump, a raised minimum ink step, chrome hidden.
2. **A projection floor** applied always: no text below 12px, no ink below 4.5:1 including captions and axis labels, no information carried by an element under about 8px.

**The floor is cheaper and usually right.** It also forces a ruling on the muted-grey rung that most systems use for captions, which commonly sits near 2.5:1 and fails in a room.

## TV and always-on displays

Out of scope as a build, in scope as a principle. What changes:

- **Nothing may be hover-only.** There is no pointer.
- **Nothing auto-refreshes without a visible freshness stamp.** There is no reader present at update time to notice a stale screen.
- **Type is set by viewing distance**, not by screen size. Roughly 1px of cap height per 10cm of distance as a floor.
- The "card carries the context" rule fails here, because a small subtitle is unreadable at three metres. A wall surface carries **fewer cards with larger numbers.**

## Email

Most of the pushed-artefact rules transfer: its own palette, fixed width, no charts that cannot be inspected, a baseline column rather than a delta pill, the period stamped rather than the render time. Add the email-specific constraints:

- Table-based layout, inline styles, no web fonts.
- **The client may invert your colours and you cannot stop it.** Do not rely on a specific ground.
- **Images are blocked by default**, so the message must be complete without them. This makes the degrade-to-a-full-text-rendering rule mandatory rather than defensive.

## CSV and data export

**Analysts will re-derive your numbers in a spreadsheet whether or not you let them. Letting them is how you find out you were wrong.**

- **Any table a reader might re-derive gets an export.**
- **The export carries raw values, not formatted strings.** No currency symbols, no thousands separators, ISO dates, one row per record. A formatted export is a screenshot with extra steps.
- **The filename encodes the metric, the filter state and the period.** An export called `download.csv` is unattributable within a day.
- **MUST — the export names its population and exclusions**, as a header comment or companion row. The rule that a number without its population is a wrong number survives the export, or the export undoes the whole trust layer.
