# Funnels

The most valuable chart in a dashboard and the easiest to get quietly wrong. A funnel makes a causal-looking claim — *people fell out here* — so every rule below exists to make sure the place it points at is the place that is actually leaking.

---

## 1. Form

**MUST — a vertical stack of left-aligned rows. Never a tapering pyramid, never a centred ribbon.**

A pyramid encodes the same number twice (width and area), makes adjacent steps impossible to compare, and wastes the horizontal space where the numbers should go. Analysis funnels are bars.

Each row is three slots: **label left · track centre · value cluster right.**

Fix the geometry once and share it with every horizontal bar chart in the product: a consistent track height, a consistent row gap, one radius, one empty-track treatment. A funnel and a category chart that disagree about row height look like two products.

## 2. Scale

**MUST — bar length is share of the *first* step**, not share of the maximum. Share-of-max is for category bars. A funnel's entire subject is decay from a starting cohort, and normalising to the max hides it whenever a later step exceeds an earlier one.

Guard the denominator so an empty first step cannot divide by zero.

**MUST — floor every non-zero fill at ~1.5% of track width, inside a clipped track.** On a typical track that is a 4-6px sliver: small, but present. A real value must never render as absent. A true zero gets no bar at all, which is a different statement.

**Support steps that exceed the step above.** Render an upward arrow and a positive change, and let the bar clip at the track. Do **not** clamp the value. A step above 100% means the population is not a strict subset of the one above it, which is real information about your instrumentation or your definitions.

## 3. What each row prints

**Exactly two numbers.** The absolute count, and the step-to-step change. More than two and the row stops being scannable; fewer and the reader cannot act.

**Express the step number as a signed change versus the step above**, not as survivor conversion. "Dropped 43%" is what a reader wants to know; "57% converted" makes them do the subtraction. Render it as a directional icon plus magnitude.

**MUST — show the change even when it is exactly 100% or above.** Suppress it **only** when the change is exactly zero... and even then, print `0%` rather than blank. **A silent blank reads as missing data**, and a reader cannot distinguish "flat by design" from "we failed to compute this".

## 4. Finding the leak

**MUST — the biggest leak is the largest *absolute* headcount drop between consecutive steps**, not the largest percentage drop.

Percentage drop picks a trivial step off a tiny base and sends the team to fix a problem affecting nine people while ten thousand leak elsewhere. Initialise the running maximum at zero so an all-flat funnel flags nothing.

**MUST — flag exactly one step, and flag it by recolouring the *change text only*.** Never recolour the bar.

Bar length and fill encode the data. Recolouring one bar makes it look like a different series, and it collides with the ramp. One dark red, on the text, once per funnel. Every other decline stays neutral, because declining is what a funnel does.

**MUST — exclude soft steps from leak detection entirely.** See §6.

## 5. Colour

**MUST — bar colour encodes *position*, not category or value.** A two-stop ramp indexed by step index: darkest at the top, lightest at the bottom, matching the decline. Guard the single-step case so the index maths cannot divide by zero.

Because the ramp is normalised to step **count**, the same colour means a different position in funnels of different lengths. That is acceptable within one funnel and misleading across two side by side; if you show paired funnels, either match their step counts or state that colour is positional.

Always draw a **full-width empty track** behind the fill in a light neutral, so the reader can see the space a step did not fill.

Interstitial or break steps use **the same hue at reduced opacity, never grey.** Grey reads as a different data type; the dimmed accent reads as "this step, but not measured the same way".

## 6. Honesty

This is where funnels earn or lose trust.

**Enforce monotonicity in the query, not the renderer.** Compute each subject's *furthest step reached* and let anyone who got further count through every earlier step. Clamping the output hides a data bug; construction prevents one.

**Define step 0 as the cohort size**, not as a measured reach. Otherwise the first step is itself a measurement with its own drop-off, and every share below it is wrong.

**Define "reached step k" explicitly** as an OR over independent signals, and state which signals you deliberately refused to count, with the reason, in the module header. The refusals are the interesting part and they are what someone will re-litigate in six months.

**Mark any step whose conversion is not a true per-user rate as `soft`.** One flag drives three coordinated behaviours:

1. Its change is prefixed to signal approximation.
2. It is **excluded from leak detection**.
3. Its note states why it is soft.

A cross-source ratio flagged as the biggest leak sends a team to fix a drop that does not exist.

**A step whose source is unavailable renders a dash and no bar** — never a zero-length bar — and the next step's conversion skips it rather than computing against zero.

**Where a step is under-captured by instrumentation, render it flat and say in the note what measurement would be needed to know the truth.** Never fabricate a slope to make the shape look natural. That is falsification.

**When the product flow changes**, resolve step order per cohort by their start date rather than re-cutting history, and record the cutover date in the module.

## 7. Labels and methodology

- Author step labels to a character budget set by the label column width, and truncate with the full label available on hover.
- **Give every step a one-line note** stating its meaning and its source, in a persistent column where width allows, and fold the same note into the hover text where it does not.
- **Put the funnel's whole methodology in the card's info affordance**, and define each shared term once in a dependency-free module interpolated into every place that mentions it.
- **Declare the funnel's population and exclusions in visible prose above the chart**, not only in a tooltip. A tooltip is for the reader who is already suspicious; the prose is for the one who is not.
- On a dedicated drill-down page, pull the methodology **out** of the tooltip into a visible paragraph and lead with it.

## 8. Composition

- Paired funnels go in a two-column grid aligned to the top. This is not cosmetic: unequal step counts otherwise centre against each other and imply a correspondence between steps that does not exist.
- A flagship funnel pairs well with a headline stat beside it, with the funnel carrying the stage counts so the two do not restate each other.
- Segment with a control that lives **inside** the funnel component, above the bars, so it cannot be mistaken for a page-level filter.
- Offer time drill-down as a single link in the card's control slot, not as a second chart.
- **Put explicit minimum-width overrides on the track, the label wrapper and the card**, or a long label will blow the row out of its container.

## 9. Empty

Own the empty state inside the component, and make the message a sentence that names the missing source. "No acquisition data available" tells the reader what to chase; a blank card does not.

---

## Checklist

- [ ] Left-aligned bars, not a pyramid
- [ ] Scaled to the first step, denominator guarded
- [ ] Non-zero fills floored to a visible minimum
- [ ] Steps above 100% shown, not clamped
- [ ] Change vs the step above, never blank at zero
- [ ] One flagged step, by absolute drop, in the text only
- [ ] Soft steps marked and excluded from detection
- [ ] Monotonic by construction, step 0 is the cohort
- [ ] Under-captured steps flat with a note, never smoothed
- [ ] Population and exclusions in visible prose
