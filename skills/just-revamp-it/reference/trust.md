# Trust

The chapter that matters most, and the one most dashboards skip.

A dashboard's output is not a number, it is a **belief in someone's head**. Every rule here exists to make that belief correct. A surface that is beautiful, fast, consistent and quietly wrong is worse than an ugly one, because nobody checks it.

Trust is not added at the end. It is the only property that cannot be retrofitted: a dashboard caught overstating once is never fully believed again.

---

## 1. Name the population

**MUST — an unlabelled metric is a defect.**

Every number counts *some* set of things, and readers who assume different sets reach different conclusions from the same figure. "Active users" is meaningless until you say active out of whom: everyone in the database, everyone real, or everyone who finished onboarding.

- Define your populations once, name them in a shared vocabulary, and use those exact words everywhere. Three is usually enough. Whatever you pick, they are nouns in your product's language, not `filtered_v2`.
- Open every page by naming the population its numbers count. One sentence under the page title.
- Bake the population into metric labels themselves where ambiguity is likely.
- The denominator of a rate is a population too, and it is usually the one people get wrong. State it.

A percentage without a denominator is not a metric, it is a rumour. If a helper renders shares for several distributions, make the denominator a **required argument** so no call site can omit it.

## 2. Define it on the surface

**MUST — a definition that lives in a deck does not exist.**

- Publish **one canonical wording per metric as a single frozen constant**, and import it at every render site, including the on-page glossary. A definition retyped by hand in a second place will drift, and then the dashboard disagrees with itself.
- Keep definition metadata in a module that imports nothing server-only, so a client component can render it without pulling the query layer.
- State each definition in **two registers from the same constant**: a terse tooltip, and an expanded on-page glossary block.
- A definition states three things: **the counting unit, the denominator, and a worked counter-example of the misreading it prevents.** "Distinct people, not visits: one person returning ten times is one returning user, not ten" prevents an error that "unique returning users" does not.
- List exclusions **by name, not by category**. "Excludes automated syncs, background imports and seeded records" is checkable; "excludes non-genuine activity" is not.
- Close a definition with a falsifiable test a non-engineer can apply to a new metric.

**Glossary block anatomy** — title stating its job ("How these numbers are defined"), a subtitle naming its scope, a two-column definition list, and a closing limitation note in a tonally distinct container stating what the metric is **not**. That last part is the one people skip and the one that prevents the most misreadings.

**Tooltip budget: about 200 characters.** Longer belongs in the glossary. Compose long info text as a card-specific sentence followed by the shared definition appended verbatim. Concatenate, never paraphrase; a paraphrase is a second definition.

## 3. Missing, zero, and not-measured are three different things

**MUST — never render them the same way.**

This is the most common trust bug in dashboards and almost nobody has a rule for it.

| State | Meaning | Render |
|---|---|---|
| `null` | not measured, or the source failed | `-`, and say which source is down |
| `0` | measured, and the answer is none | a de-emphasised zero, plus a minimum-visible stub in charts |
| absent row | the thing does not exist yet | an empty state in a full sentence |

- In a bar chart, three states need three marks: null draws **no bar** and prints `-`; a real zero draws a **fixed small stub in neutral** so the category is visibly present at zero; a value draws its bar.
- When a source fails, blank the number **and** rewrite that tile's hint to name the failed source. Never substitute zero. A zero reads as a real, catastrophic result.
- A ratio with no denominator prints `n/a`, never `0` in the unit. Type it as nullable so the compiler enforces it.
- Route every nullable scalar through one shared formatter family, so no component invents its own placeholder.
- Give "has not happened yet" different words from "we do not know".

## 4. Mark what you cannot measure

**MUST — never fabricate a shape.**

The temptation is always to smooth: a funnel with a flat step looks broken, so someone invents a slope. That is falsification with a chart library.

- Where a step is under-captured by instrumentation, **render it flat and state in the note what measurement would be needed to know the truth.**
- Mark any step whose conversion is not a true per-user rate with a **`soft` flag**, and let that one flag drive every downstream behaviour: it renders differently, it is excluded from "biggest drop" detection, and its note says why. A cross-source ratio flagged as the biggest leak sends a team to fix a problem that does not exist.
- Never compute a delta between two adjacent figures from different sources without marking it.
- Label aggregate or device-level data in more than one place: the page intro, the tile hint, and the card's info text. Readers arrive at different entry points.
- Show impossible-looking values rather than clamping them. A conversion above 100% means the population is not a subset of the one above it; render it, arrow it upward, and explain the mechanism. Hiding it looks like a bug and destroys confidence in every other number.
- A step-to-step change of exactly zero renders as `0%`, not blank. **A silent blank reads as missing data.**
- Make funnels monotonic **by construction** — count each subject at the furthest step it reached — rather than by clamping the output. Clamping hides a data bug; construction prevents one.

## 5. Disclose exclusions, and make them inspectable

**MUST** if anything is filtered out of the numbers.

- Keep the exclusion rule in **one named module** with a documented matching rule and a worked example of the false positive it prevents.
- Disclose it on every page whose numbers it changes, as the same fixed closing phrase, **derived from the filter itself** so it cannot drift from the code.
- Where the filter does **not** apply, say so more loudly than where it does, and visually mark the affected columns.
- **SHOULD** — make it inspectable rather than asserted: a segmented control with live counts per population lets a sceptical reader verify the filter instead of trusting it. This converts a claim into evidence and is the single highest-leverage trust feature available.
- Carry the classification down to individual records with a badge, so a drilled-in row cannot be mistaken for a real one in a screenshot.

## 6. Provenance and freshness

**MUST — a cached page under an "updated just now" header is a lie the UI cannot detect.**

- Mark data pages as dynamic. If you cache, the freshness stamp must reflect the cache, not the request.
- Stamp freshness as the moment the page loaded, computed client-side, so it cannot be baked into a server render.
- Render the stamp in **the report's own fixed timezone**, not the viewer's locale. Pass the timezone explicitly to every formatter. A day boundary that moves with the reader makes two people disagree about yesterday.
- Print the data window beside any windowed metric: "last 28 days", "trailing 7-day windows". A number without its window is not comparable to anything.
- **SHOULD** — badge live versus fallback sources with a two-state chip, and print the covered date range. When a third-party fetch degrades to a committed export, degrade to the export rather than an error, but **make the substitution visible**. Silent fallback is the failure mode that erodes trust fastest, because the number looks fine.
- A dated report renders from the date in its own URL or payload, **never from the wall clock**. Otherwise a card refetched the next day silently reports a different day than the message that carried it.

## 7. Small numbers

**SHOULD** — disclose small-N in two places: the page intro with the actual base printed, and the card subtitle with the word "directional".

A percentage over a base of 7 is not wrong, it is unstable, and readers treat it identically to one over a base of 7,000 unless told.

In a cohort grid, a period a cohort **has not reached yet** renders as literal empty space. Not `0%`, not the lightest shade. An unreached cell shaded like a measured zero says retention collapsed when it says nothing at all.

## 8. States

**MUST — empty, loading, error and zero are four different messages.**

**Empty.** Use a three-tier vocabulary and let the tier pick the wording: *no data* (the query ran, nothing exists), *not enough data* (some exists, below the threshold to be meaningful), *not applicable* (this cannot have data). Every empty state a reader can reach is a **full sentence in domain language**. Make the shared primitive's default unreachable so a page author cannot ship a bare "No data". When an empty state is good news, write it in the affirmative: report the achieved state, not the absence of rows.

Pick **one** empty-state treatment per surface: one vertical rhythm, one grey, one alignment.

**Loading.** A skeleton mirrors the real grid — same width, padding, column spans, block heights — so nothing jumps at hydration. A jump reads as a broken page. Every pulsing element respects reduced motion. The container announces itself once to screen readers, not once per block.

**Error.** Exactly four parts: a plain-language headline naming what failed, two or three sentences naming the mechanism and the blast radius, one primary action, and a correlation id **only if one exists**. Never a stack trace. Never "Something went wrong". Dress it in the product's own card chrome and cap the prose around 65 characters per line — an error page that abandons the design system reads as a crash even when it is handled.

Say "no data was changed" **only when the architecture structurally guarantees it.** An unverifiable reassurance is worse than none.

A job that renders a report must never fall back to returning its own exception. Catch, log, and return the medium's failure representation.

## 9. Say diagnoses in words

**SHOULD.** When a number is a *diagnosis* rather than a measurement, write it in prose beside the chart rather than encoding it in colour or shape. Encodings imply the same confidence as a measurement.

Give hand-authored qualitative conclusions a container a queried number never gets, so a reader can always tell which is which.

## 10. Never hide data silently

**MUST.** If a table extends beyond the viewport, say so with a visible cue and a permanently visible scrollbar. Overlay scrollbars auto-hide on some platforms, which removes the only signal that more columns exist.

If you cap rendered rows, run every filter and count **over the full set**, and print "showing N of M". A silent cap makes a filtered view look complete.

---

## Checklist

- [ ] Every metric names its population
- [ ] Every rate states its denominator
- [ ] One canonical definition per metric, imported everywhere
- [ ] `null`, `0` and absent render differently
- [ ] Unreliable steps marked, not smoothed
- [ ] Exclusions disclosed, and inspectable
- [ ] Freshness stamped in a fixed timezone, with the data window
- [ ] Fallback sources visibly badged
- [ ] Empty, loading and error states distinguishable and in domain language
- [ ] Small-N labelled directional
- [ ] Truncation and overflow disclosed
