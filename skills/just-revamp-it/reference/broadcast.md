# Broadcast

The second register: a dashboard pushed to the reader as a fixed artefact. A Slack card, an email, a PDF, a deck slide, a wall display.

**MUST NOT ship a screenshot of the Explore surface.** Every affordance the screen design leans on is gone: no hover, no tooltip, no drill-down, no scroll, no info dot, no interaction to reveal a definition. A screenshot inherits a layout tuned for none of those absences, and the result is a picture of a dashboard rather than a report.

The system is the same. The register is different. Design it deliberately.

---

## 1. One result, many renderers

**MUST — define one typed object for the reporting period, and give it N renderers.** A renderer takes the object and returns markup. The screen, the image and the plain-text fallback are three renderers over one computation.

Reuse the metric functions. **Then audit what you could not reuse**: any bespoke logic the export adds is a second definition of a metric, and it will drift from the first.

**Make the reporting period an explicit parameter** and put it in the URL. Anchor every window function to that parameter, never to the wall clock. Otherwise a card refetched the next day silently reports a different period than the message that carried it, and the number under yesterday's headline changes.

## 2. Canvas

- **Fix the width, compute the height.** One width on every render; height derived from which blocks are present.
- If you sum per-block height terms, derive each term from the engine's **measured** line box, not from a guess. State the budget as named constants, bump the term in the same commit that adds a row, and assert the total. A bottom spacer that absorbs the slack **hides** height errors rather than revealing them.
- **Print-scale margins.** Roughly 6% side margins. Screen padding looks cramped at export scale.
- **Drop all card chrome. The image *is* the card.** No rounded container, no border, no shadow, no nested panels. Sections separate with rules, not boxes. Nested cards inside an exported card read as a screenshot of a webpage.
- Collapse radii to near-square. No pills.
- **Paint an opaque ground on the root.** Never inherit the host's background; chat clients differ and some are dark.

## 3. Type

- **Widen the range and raise the floor.** Roughly double the display size and raise the smallest size. The artefact is read at thumbnail scale in a feed, or projected. There is no zoom.
- **Declare the type scale as one frozen object of *roles*** at module top, and never write a numeric size anywhere else in the file.
- **Run an optical tracking ramp in em, not px:** noticeably negative above display sizes, slightly negative in the mid range, zero at body size. Large type set at body tracking looks loose and amateur.
- **Know whether font weight works in your renderer.** In some image-render engines `fontWeight` is **inert** unless every weight is registered. If it is, build hierarchy from **size, colour and case** instead, and all-caps plus positive tracking plus the faintest grey becomes your only label device. Use it for column heads and chips, never for values.
- Avoid fetching or embedding fonts inside an image route. If you rely on the renderer's bundled default, **declare that** in a comment, because the artefact's typography is then not yours.
- Set line height only on multi-line prose; leave single-line numeric rows on the engine default so row pitch stays consistent.
- **Baseline-align wherever two very different sizes share a line.**

## 4. Colour

Give the export **its own closed palette**, declared as one object at the top of the file, and expect it to be disjoint from the screen palette. This is a sanctioned exception, not drift. See `color.md` §9.

- Warm ink on a cool ground with warm greys reads as a printed document rather than a screenshot. That is usually the right instinct for a report.
- **Status is a fill swap, never a text-colour swap.** Pick status fills light enough that **one** ink clears 4.5:1 on all of them. Coloured text at small sizes in a compressed image is the first thing to become unreadable.
- **Fix the identity colour and vary only the status colour**, letting them coincide on a healthy day. The good state introduces no new colour, so colour appearing *means* something.
- **Keep the highlight device off the numbers.** A marker or fill goes behind titles and headers; values stay plain ink. The eye should land on the section, not on a random figure.
- **Thicken hairlines** roughly 2.7× versus screen, and run exactly three rule weights with three jobs: a heavy masthead rule, a section rule, a row rule.

## 5. What you drop, and what pays for it

**Drop every chart.** Zero vector charts in an exported card: no sparkline, no funnel, no stacked bars, no heat grid. At export scale they become texture. The artefact is a **ledger**, not a dashboard.

**Replace the delta pill with a paired baseline column.** Print the comparison value in a fixed slot and let the reader see both numbers. A percentage pill without the underlying values is unverifiable, and in a static artefact there is no tooltip to check it against.

**Repeat column heads at every section**, inside the section component. There is no sticky header in an image.

**Every tooltip, definition and info affordance is gone.** Be explicit about what pays for that. Usually the answer is: a link back to the live surface, and metric labels expanded to carry more meaning than their screen equivalents. If nothing pays for it, you have shipped numbers nobody can interpret.

## 6. The ledger

**One row shape, repeated:** label left, current value right-aligned in a fixed-width box, baseline value right-aligned in a second fixed-width box.

- **Define the numeric columns once as width constants** and use them in both the column head and every row.
- **Get numeric alignment from layout, not from a font feature.** Right-align inside a fixed box. Do not assume tabular figures survive into the render engine.
- **A compound value shares one cell** rather than spawning a second row. A count and its percentage are one fact.
- **When a row's baseline is not what the column head says, annotate it inline in the cell.** Never a footnote; there is nowhere to put one and nobody follows it.
- **A metric with no meaningful comparison gets an empty baseline cell.** Never a fabricated zero, never a dash borrowed from the absence vocabulary.

## 7. Editorial

An artefact has an editor's job that a dashboard does not: something must be chosen.

- **Choose the headline metric for the artefact's cadence, not by inheriting the product's north star.** A daily card needs a number that moves daily. A weekly north star on a daily card is flat noise.
- **The hero is one number and its baseline.** No delta chip, no sparkline, no gradient, no caption.
- **Stamp the reporting period, never the render time.** This is the inverse of the live dashboard, which stamps freshness. A report is *about* a period; a dashboard is *as of* a moment.
- **Set a slot budget and hold it.** A fixed number of rows across a fixed number of sections. Adding a metric means removing one. Without this the artefact grows every quarter until nobody reads it.
- Order sections by the product's existing information architecture, truncated to what the period supports.
- **Inverted pyramid with exactly one repeat:** quote the single most severe exception at the top as a plain sentence, then list all exceptions in their own block.
- **Rank exception rules in source order**, because the first becomes the headline, and test every metric against **its own** baseline.
- **An exception states the measurement, its baseline and the gap.** Never a bare adjective. "Installs 40% below the 7-day average (120 vs 200)" beats "installs down sharply".
- **When a source is unavailable, remove its section, raise it as an exception, and shrink the canvas.** A silently missing section reads as a metric that went to zero.

## 8. Voice

- **Say a thing once per canvas.** If a status chip carries the word, strip that word from the sentence beside it, at display time rather than at authoring time.
- Sentence case for labels. All caps only for column heads and chips.
- One separator character, used everywhere.
- **No em dashes.**
- **Emoji belong to the text medium, not the image.**
- **The carrier message says nothing the artefact already says.** One fixed sentence, the artefact, one link.
- Choose locale **per field** for output shape: currency in the audience's grouping convention, dates in the report's own timezone.

## 9. Delivery

- **Content-address the render, cache-bust the delivery, freeze the response.** The content key identifies the period; delivery parameters vary per send.
- **Sign only the content key**, so delivery parameters can change without invalidating the signature.
- **Choose cache headers by how the request was authorised, not by how cacheable the bytes are.** A signed, self-authorising URL may be public and immutable. A session-authorised fetch of the same URL must never enter a shared cache.
- The export endpoint sits outside the app's auth gate and authorises itself, because the chat client fetches it from its own servers with no cookies.
- Build the URL from a stable public host constant, never from the incoming request's origin.
- **Make the render idempotent and cheap**, because it will run several times per delivery.
- **Probe your own render before sending and check the content type**, not just the status code. An error page returns 200 with the wrong body.
- **Degrade to a full alternative rendering of the same data, never to a placeholder or an error.** Build the text renderer as a first-class renderer, not a stub.
- **Every degradation costs a feature, never the delivery.** No signing secret means no picture but the message still sends.
- **Ship a dry-run mode, a recipient override and a format override** on anything that pushes outward. You will need all three the first time it misfires.
- Adapt to the channel's restrictions in the message builder, not in the artefact.

---

## Checklist

- [ ] One data object, several renderers, no second metric definition
- [ ] Period parameterised, never the wall clock
- [ ] Chrome dropped, margins widened, ground painted
- [ ] Type range widened, floor raised, tracking ramped
- [ ] Weight verified as working, or hierarchy built without it
- [ ] Own closed palette, one ink over all status fills
- [ ] Charts dropped, deltas replaced by a baseline column
- [ ] Slot budget fixed, headline matched to cadence
- [ ] Exceptions state measurement, baseline and gap
- [ ] Reporting period stamped, not render time
- [ ] Degrades to a full text rendering, never an error
