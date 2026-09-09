# Type, space and primitives

The tokens. This chapter is what `vocabulary.mjs` measures.

The goal is a **small vocabulary, repeated**. Dashboards people like are rarely the ones with the best individual choices; they are the ones that made few decisions and held them.

---

## 1. Type scale

**Ship about four sizes.** A dashboard needs a value size, a body size, a label size and a caption size. Everything else is an exception that must justify itself.

**MUST — size alone does not identify a role. Size *and weight together* do.** Lock the pairs:

| Role | Size | Weight |
|---|---|---|
| Page title, KPI value | large | semibold |
| Card title, section label | small | semibold |
| Table body, row label | body | medium |
| Caption, hint, axis | smallest | medium or normal |

A dashboard with four sizes and four weights has sixteen possible roles and no system. Fixing the pairs is what makes the scale legible.

- **Two weight classes only.** Medium and semibold. Never heavier. Leave body text at its inherited default rather than declaring it.
- **Apply tight tracking to everything at display size and above**, and leave everything below at default. Large type at body tracking looks loose; small type at tight tracking loses legibility.
- **MUST NOT use uppercase.** Section titles are sentence case. Uppercase in a dense data interface costs legibility for emphasis you can get from weight. The one sanctioned exception is column heads in an export artefact, where weight may be unavailable (see `broadcast.md`).
- **Set no line height on UI text.** Let the size token carry it. Declare an explicit leading only on multi-line reading copy.
- **Cap reading copy around 75 characters per line.**
- **Load at most two families as variables on the root**, and never name a font family in a component. Sans for everything, mono for identifiers only.
- **Allow at most one responsive type step in the whole system.** Type that resizes at breakpoints turns one design into three.

## 2. Numerals

**MUST — tabular figures on every number that shares a column, a row, or a repeated slot with another number.** And on nothing else: prose containing a number keeps proportional figures.

In a table primitive, apply the per-column class to **both** the header and the cell, as one string, so alignment and figure style cannot drift apart.

**Right-align any column the eye scans for magnitude or recency.** Add tabular figures only where the cell actually renders digits.

## 3. Spacing

**A 2px-based scale**: 2, 4, 6, 8, 10, 12, 16, 20, 24, 32. The half-steps are load-bearing in dense interfaces; without them people reach for arbitrary values.

**Three vertical rhythm values between page bands, not two:**

- **Continuation** (~16px) when the next band answers the same question as the one above.
- **Section** (~32px) when it starts a new one.
- **Tight** for bands inside a single extracted component.

Choosing rhythm by *relationship* rather than by position is what makes a long page read as an argument rather than a list.

**Cap card-grid gaps at 16px and never make them responsive.** Control clusters use 12px or 8px; icon-to-text uses the smallest step.

**Top-align multi-column grids of independent cards**, so a short card does not stretch to match a tall neighbour.

## 4. Shape and depth

**Assign radius by role, not by element size:** the largest radius for cards and hero surfaces, a medium radius for buttons, inputs and toggles, a small radius for bar tracks and heat cells, fully round for pills and chips.

**One border recipe per surface, and step down, never up:** a hairline as alpha over black, plus one soft shadow, on white. Borders are alpha, never a grey hex, so they composite correctly on every ground.

**Canvas is a near-white grey; cards are pure white.** Never white on white, never a tinted card. Depth comes from the hairline and the tint difference, not from shadow weight.

**A five-step neutral ink ramp and nothing else for text:** darkest for values and titles, then bar and table labels, then captions, then placeholders, then disabled. Each rung has one job.

## 5. Primitives

Specify these once. Every dashboard needs them and every team rebuilds them slightly differently.

**Card** — minimum-width override, large radius, hairline, white, one padding step, soft shadow. Optional header: title and info affordance left, controls right. Sub-sections divide with a rule that is asymmetric on purpose, more space above than below, because the rule belongs to the content beneath it.

**KpiTile** — muted label with an info slot, then the value at display size with tabular figures, then an optional delta pill, then a bordered comparison footer, then an optional sparkline. Padding one step tighter than a card.

**HeroStat** — the one sanctioned gradient. Full height so it matches its grid row, label, value at the largest size, delta, a sparkline that takes the slack so the card does not leave a void, caption anchored at the bottom.

**DeltaPill** — fully rounded, small, semibold, tabular, tone at low alpha with the tone's dark shade as ink, and a drawn arrow. Three states including neutral for flat.

**Buttons** — three weights sharing one geometry. The accent button appears **at most once per page**, on the single most important action.

**Segmented control** — two sanctioned shapes chosen by option count, not by taste. A small fixed set is a segmented pill; a longer list is a select.

**Chips and pills** — tone at low alpha with dark ink. Banners use a different alpha pair from chips so the two never read as the same object.

**Bar row** — one geometry shared by every horizontal bar chart in the product, so charts in adjacent cards share an x-scale. Fixed label column, flexible track, fixed value cluster.

**Legend** — one recipe, and only when colour encodes something not already labelled.

**Focus ring** — one recipe, one variable, on every focusable control.

**MUST — pair truncation with a native title carrying the full string, every time, without exception.** A truncated label with no way to read it is data deletion.

## 6. Z-index

**A five-step ladder in tens, and never a value between.** Sticky cells, sticky headers, chart tooltips, page tooltips, modals. Every arbitrary z-index is a future stacking bug.
