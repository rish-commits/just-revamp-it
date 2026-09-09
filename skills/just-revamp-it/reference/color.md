# Colour

Colour in a dashboard is not decoration, it is **encoding**. Every hue a reader sees is a claim about meaning, and the fastest way to make a dashboard untrustworthy is to make the same colour mean two things.

Run `palette.mjs` before writing any of this by hand. It derives and validates the whole system from one accent, computes the legibility ceilings for *your* hue rather than reusing someone else's, and refuses combinations that cannot work.

---

## 1. Brand slots versus structural constants

**MUST — separate them, label them, and export every brand-derived value from one module.**

A re-skin should be a bounded edit to one file. The usual failure is that only the two obvious values get exported (the accent and a soft variant) while the ramp anchors, the gradient endpoint and the heat-fill triple live as literals scattered across components. Then swapping a brand means finding six copies of one hue by grep, and missing one.

**Brand slots** (a new brand replaces these): accent, accent-soft, accent-deep, the two ramp anchors, the heat hue.

**Structural constants** (identical in every brand): neutrals, delta green and red, status tones, caveat amber, border alphas.

`palette.mjs --css` emits both, correctly separated. Do not hand-write a ramp.

## 2. Budget the palette, and publish the list

**MUST — the palette is countable and enumerable.** If nobody can list the colours in the product, there is no palette.

Audit with a grep for hex literals and colour tokens, group them into accent-family, neutral and semantic, and publish the list. **A new colour must displace an old one.** `vocabulary.mjs` measures this and names the tail.

## 3. Green and red are reserved

**MUST — green and red mean change against a comparison. Nothing else.**

Not categories. Not chrome. Not active states. Not "this row is a success". The moment a green appears that does not mean "improved", every other green becomes ambiguous and the reader stops reading colour as meaning.

**Delta colour comes from `direction === goodWhenUp`, never from the sign.** Falling cost is good. Rising churn is bad. See `numbers.md`.

**Exactly zero is a third, neutral state.** Green for flat claims an improvement that did not happen.

**Delta chip recipe:** the tone at ~10% alpha as background, the same tone at a dark shade as ink, fully rounded, small, semibold, tabular. Verify the ink against the **composited** chip background, not against page white; a 10% tint changes the ratio and the margin is often under half a point.

### The one exception, and its test

Green-to-red **may** encode categories only if all three hold:

1. The categories form a genuine **ordinal severity axis** (healthy → at risk → dormant → lost), not an unordered set.
2. The endpoints are the product's **own** positive and negative tokens, not arbitrary picks.
3. Any "no signal" member sits **outside** the ramp, in neutral.

Declare it as one exported constant with the justification in a comment above it. Without the written test, "this one is special" spreads until green means nothing.

**MUST NOT:** green for "first-ever user", green for "new", red for "churned" as a plain category fill. Those are categories wearing sentiment.

## 4. Sequential ramps

**MUST — compute from two anchors, never enumerate N swatches.** Interpolate between a dark and a light anchor, indexed by position. An enumerated five-stop palette silently breaks at step six; two anchors handle any N. Guard the single-step case so index maths cannot divide by zero.

**A ramp's allowed luminance span depends on whether text sits on the fill.**

- **No text on the fill** (labels outside the bar): the ramp may span the full range, dark to light.
- **Text on the fill** (a value inside a heat cell): the ramp must be **alpha-capped so one constant ink works at every stop**. Do not switch ink mid-scale; a column where the ink flips reads as two different tables.

This is the principle behind the two different ramps most dashboards end up with, and almost nobody writes it down.

**MUST — never hard-code text colour on a data-driven fill.** Call a luminance helper that picks ink per fill. `palette.mjs` exports the threshold and the ceiling for your hue.

## 5. Where the accent goes

The accent has a small, fixed set of jobs. Enumerate them and refuse the rest.

1. Primary data fills: bars, lines, ramp anchors.
2. The single decorative gradient, if you allow one.
3. Inline navigational links, as one fixed recipe.
4. Focus rings.
5. Text selection, themed from the accent rather than the platform blue.

**MUST NOT — navigation and view-toggle selection is neutral, not the accent.** An active nav item and an active segmented-control option use a dark neutral. If the accent marks both "this is data" and "this is where you are", it marks neither.

**Unordered categories get no categorical colour at all.** Every bar is the accent; the category is carried by its label. Rainbow category palettes are the most common way a dashboard becomes unreadable, and they are almost never necessary.

## 6. Neutrals carry the interface

Run a neutral ladder with **fixed roles**, not ad-hoc greys: numbers and headings darkest, table body next, labels mid, captions light, disabled lightest. Each rung has one job and a legibility floor.

**Borders are alpha over black, never a grey hex.** A grey hex only looks right on one background; alpha composites correctly on every surface. Run a short ladder: hairline for cards, lighter for table rows, heavier for emphasis.

**Card and canvas separate by a hairline plus one soft shadow, not by value.** A near-white card on a near-white canvas at close to 1:1 contrast, with a hairline, reads as clean. Separating by value produces grey boxes.

**Opacity is the tone dial**, and each rung has one job: a very light wash for cell hover, slightly more for control hover, more for tints and chips. Publish the rungs.

## 7. Closed sets

- **Status badges:** a closed set of tones, one formula (tone at ~10% alpha, tone at a dark shade for ink). Adding a seventh status means choosing which existing one it replaces.
- **Caveats and data-honesty notes are amber, never red.** Red means "this got worse"; amber means "read this carefully". Pick **one** amber recipe and hold it.
- **Data provenance gets its own two-tone badge**, distinct from health: one tone for live and authoritative, another for fallback or manual. A reader must be able to distinguish "the number is bad" from "the number came from somewhere else".
- **Tooltips are a dark ground with light ink**, never the accent and never a light card.
- **Chart chrome has its own neutrals** and never borrows the accent or a border token.

## 8. Restraint

- **At most two accent colours in a view.** One accent plus neutrals, with green and red only for deltas.
- **At most one decorative gradient in the product.** If everything is a gradient, the one that was meant to be special is not.
- **Absolute values, money, IDs and ratios stay uncoloured.** Judgment is carried by an adjacent chip or by weight, never by hue. Colouring the number itself makes the reader think the *value* is the status.
- A number the data cannot honestly support is **de-saturated, not hidden** — and the de-saturation covers its label too.

## 9. Surfaces that need their own palette

**MAY** — an export or notification surface (a Slack card, an email, a PDF, an OG image) may run its **own closed palette**, declared as one object at the top of the file.

This is a real exception, not drift, because those media have different grounds, no hover, and different viewing distances. The conditions: it is declared in one place, it is closed, and it maps onto the same **roles** as the app palette (ink, muted, faint). Colour the **frame** on these surfaces, not the figure: status goes behind a title or into a chip, while values stay plain ink. See `broadcast.md`.

## 10. Theming

If you ship a single-theme product deliberately, that is a legitimate choice, but it takes coordinated moves rather than one: neutralise the dark variant inside the opted-out subtree, pin the tokens, paint the canvas explicitly so the browser's own ground does not show through at the edges, and keep new files free of dark variants while leaving inherited ones alone.

If you support both themes, define the complete light palette on the root, redefine only the tokens for dark, and never give a colour its only definition inside a media query.

**Force an always-visible scrollbar on wide tables**, painted in a theme-agnostic grey. Overlay scrollbars auto-hide on some platforms, removing the only cue that more data exists.

---

## Checklist

- [ ] Every brand value exported from one module
- [ ] Palette enumerable and published
- [ ] Green and red only ever mean change
- [ ] Delta polarity per metric, flat is neutral
- [ ] Ramps computed from anchors, capped if text sits on them
- [ ] Ink chosen per fill by luminance
- [ ] Selection and nav are neutral, not accent
- [ ] Borders are alpha, not grey hex
- [ ] Caveats amber, one recipe
- [ ] At most one decorative gradient
