# Tables

A table is the right answer more often than dashboard designers admit. It is also where the most data hides, so most of these rules are about not hiding it.

**Use a table when the reader needs an exact value** to read, compare or copy: a roster, a per-day metric grid, a log. Use a chart when the reader needs a **shape**. When the same data is wanted both ways, put the shape on the parent page and the grid on a child route rather than stacking both.

---

## 1. Two chassis, no more

- **In-card list** — no container border, no header fill, no edge padding. It borrows the card's chrome.
- **Standalone grid** — its own bordered, horizontally scrollable container. It is the page.

**MUST NOT wrap a full-page roster in a card.** A card inside a page whose entire body is the table is a box drawn around the page.

## 2. Structure

- **Border ladder, three steps and nothing else:** a header rule, a row hairline, and a totals rule. All as alpha over black, not grey hex.
- **The only vertical rule permitted separates column *groups*.** Vertical rules between every column turn a table into a spreadsheet and slow reading down.
- **Headers are small, medium weight, sentence case.** Never uppercase, never bold, never body size. A header that competes with the data is a header in the way.
- Grouped headers use two tiers with one step of weight and darkness between them.
- **Alignment is not a preference:** the identity column left, every numeric or rate column right **and** tabular, matrix cells centred. A right-aligned cell whose content is prose is a mistake.
- **Three density tiers chosen by table type, not by page.** A roster breathes; a dense metric grid does not.
- Format dates with a fixed-width pattern so the column does not reflow between rows.

## 3. Overflow, which is where trust is lost

**MUST — never let a table hide data silently.**

- **Freeze the first *column*, not the header row.** In a wide metric grid the row identity is what a reader loses, not the column names.
- **A sticky cell must paint a fully opaque background**, overriding any translucent header tint, or data slides visibly underneath it.
- **Force a permanently visible horizontal scrollbar** with `overflow-x: scroll`, not `auto`. Overlay scrollbars auto-hide on some platforms, removing the only cue that more columns exist.
- **Pair it with a cue that names the hidden dimension**: "Scroll horizontally for all 14 days" beats an arrow.
- A right-edge fade must inset its bottom by the scrollbar height, or it veils the scrollbar it is advertising.
- Control wrapping **per cell**, not per table.
- Put a minimum-width override of zero on any card that can contain a table, and the scroll container on the table's own wrapper.

## 4. Density without pagination

**SHOULD — for datasets in the low thousands, fetch once and filter on the client.** Instant filtering is worth more than pagination, and the round trip is the cost readers actually feel.

- **Cap the render, never the query.** Filter and count over the **full** set, render the first N, and offer more.
- **Every control that changes the result set resets the render limit**, in the same handler. No exceptions, or a filtered view silently shows a stale page.
- **State the result count unconditionally**, and name what is hidden: "Showing 50 of 214". A silent cap makes a filtered view look complete.
- The "show more" button **names the number it will reveal**, clamped to what remains.
- **MUST NOT** use numbered pagination in a dashboard table. It hides the shape of the data and nobody clicks past page two.

## 5. Cells

- **Four distinct absence glyphs, never interchanged:** a hyphen for missing or not-applicable, a true minus for negative, an em-width dash for a structural gap, and a de-emphasised zero for a measured zero. See `numbers.md`.
- **Distinguish a measured zero from an unmeasurable value at cell level.** A greyed `0` still says "we looked".
- **In a cohort grid, a cell that has not happened yet is a blank box of the correct height.** Not zero, not the lightest shade.
- **Encode a delta with a glyph *and* a colour, never colour alone.**
- Render IDs **in full**, in mono, muted, with a copy control. Never truncate an identifier a reader might need to paste.
- A compound identity cell is a two-line stack: primary label, then a muted secondary.
- **Express a share as one compound cell** ("142 · 34%") rather than two columns.
- Low-cardinality enums become badge pills, title-cased. High-cardinality values stay text.
- **Emphasise the important column with weight and darkness, never hue.**
- A totals row sits at the bottom with its own rule and heavier ink, and is **aggregated from summed inputs, never by averaging per-row rates.** State the method in the card's info text.

## 6. Provenance inside a table

**Tint the background of any column run whose data comes from a different source or trust level**, at a low accent alpha, and say so in the header or the card's info. A table that silently interleaves two sources invites deltas between adjacent columns that mean nothing.

**Attach the definition of a derived column to the column itself** with an info affordance in the header, positioned so an overflow container cannot clip it.

## 7. Interaction

- **Drill-through lives on exactly one cell — the identity column — as a real link.** Never a whole-row click handler: it breaks middle-click, copy, text selection, and keyboard use, and it makes every cell feel like a trap.
- Parameterise the destination with a prop so one roster serves several mounts.
- With a sticky column, move row hover to the row with a group selector applied to **every** cell including the sticky one, or the frozen column will not highlight with its row.
- Position header tooltips fixed from the trigger's rect, never absolutely inside the cell.
- **Filtering a reader might want to link or bookmark goes in the URL.** Ephemeral refinement can stay in component state.
- Every interactive control in and around the table shares one focus ring.

## 8. Matrices and heat grids

- **Drop all row hairlines and the header rule.** The cell gutter does the separating; hairlines plus fills is two grids fighting.
- Cells print their own value on the fill, centred and tabular.
- **Cap the ramp so one constant ink stays legible across the whole scale** (`palette.mjs` computes the ceiling for your hue). Where a fill is categorical rather than a capped ramp, pick the ink per fill by luminance.
- A two-line metric cell carries the count then its change, top-aligned.
- Sort rows by magnitude and drop all-zero rows **at the call site**, not inside the component.
- **State the row order in the card's info.** Newest-first everywhere except a cohort triangle, which runs oldest-first.

## 9. Empty

Two strategies, chosen by whether the column set itself carries information:

- **Wide metric grid:** keep the header, show the empty message in the body. The columns tell the reader what would have been there.
- **Roster:** drop the whole table, show a sentence.

**Empty copy names the missing thing and the filter context that produced it.** "No users match Gender: Female · Active" is actionable; "No data" is not.

## 10. Streams

A chronological single-stream view is a **list, not a table**: a fixed right-aligned time gutter, an event line, and no column headers. When rows are records rather than comparable values, drop the header row entirely and use the table only for column alignment.

---

## Checklist

- [ ] Table only where an exact value is needed
- [ ] Numeric columns right-aligned and tabular
- [ ] Headers quiet, sentence case
- [ ] First column frozen, opaque, with a visible scrollbar and a named cue
- [ ] Render capped, query not; count stated; controls reset the cap
- [ ] Absence glyphs distinct; measured zero visible
- [ ] Drill-through on the identity cell as a real link
- [ ] Different-source columns tinted and disclosed
- [ ] Totals summed, not averaged, with the method stated
- [ ] Empty copy names the filter context
