# Theming

**MUST — build dashboards light. Light is the default and it is not a preference.**

This is one of the few places the system overrides a team's taste, so here is the reasoning rather than the assertion.

---

## 1. Why dashboards are light

**They are read in lit rooms, on projectors.** A dashboard's highest-stakes moment is a weekly or monthly review where it is projected or screenshared. Projectors and conference-room screens wash out dark grounds badly: a dark surface in a lit room loses most of its contrast range, and the muted greys that carry labels disappear entirely. Light surfaces degrade gracefully in the same conditions.

**Screenshots leave the building.** Dashboard screenshots get pasted into decks, docs, tickets and chat, almost all of which are light. A dark screenshot fights every context it lands in, and readers perceive it as a foreign object rather than as your data.

**They get printed and exported.** Dark mode prints as either a solid black rectangle or, with backgrounds stripped by default, as an empty page with all encoding gone. See `output.md`.

**Light grounds give you more usable colour range.** Every encoding in this system is a background fill. A sequential ramp on white can run from a near-white tint all the way to a saturated fill, which is a wide, perceptually even span. On near-black the same ramp is compressed: the dark end has nowhere to go, so adjacent steps converge and the ramp encodes less. This is a measurable disadvantage, not an aesthetic one.

**The benefits of dark do not apply here.** Dark mode helps with low-light reading, long-form text, and OLED battery. A dashboard is read in an office, during working hours, in short bursts, mostly on plugged-in machines and projectors.

**Two themes doubles the validation surface.** Every ramp, every chip, every ink choice needs checking twice, and the second one drifts because nobody looks at it as often. For an internal tool the payoff does not justify the maintenance.

## 2. State it in the product

A single-theme product takes coordinated moves rather than one:

1. **Neutralise the theme variant inside the opted-out subtree**, so inherited components stop responding to the system preference.
2. **Pin the tokens** on that subtree.
3. **Paint the canvas explicitly.** Otherwise the browser's own ground shows through in the overscroll gutter and anywhere your wrapper does not paint, which is the tell that a "light-only" product is not actually light-only.
4. **Keep new files free of theme variants**, and leave inherited ones alone rather than stripping them.

That same recipe is the correct migration state when one section of a product is single-theme while the rest is theme-aware.

Set the colour scheme explicitly at the layout wrapper too, so browser-native surfaces (scrollbars, form controls, selection) do not render in the wrong mode.

## 3. The narrow exceptions

Dark is defensible in exactly three situations. All three share one property: **the reader is in a dark room and the surface is not leaving it.**

- **An always-on wall display in a dark room**, such as an operations centre. See `output.md`.
- **A dashboard embedded inside a host product that is itself dark**, where matching the host matters more than any of the above.
- **On-call tooling read at night**, where the reader is in bed and the alternative is a screen that wakes them fully.

**A brand preferring dark is not one of these.** Neither is "our engineers like dark mode", because the dashboard's priority reader is usually not an engineer, and the projector does not care what anyone likes.

**If you ship dark, it needs a written exception** under `governance.md`: the rule it breaks, why this surface qualifies, and what it does not license.

## 4. If you must ship dark

Then ship it correctly, because a bad dark theme is worse than none. Run `palette.mjs "<accent>" --css`, which derives and validates a dark block alongside the light one. Do not hand-write these values.

**Dark is not an inversion.** What actually changes:

- **Borders flip ground, not value.** Light uses alpha over black; dark uses alpha over white, and needs roughly **double** the alpha to read as the same weight.
- **Elevation reverses.** Shadows are nearly invisible on dark, so a raised surface gets **lighter** than its canvas, plus a border. Publish the surface ramp: canvas, card, raised.
- **The accent is re-derived, not reused.** A hue that clears contrast as a fill on white commonly fails as text on near-black, and the reverse. Pick the hue once, derive one working tone per theme, validate each independently.
- **The ramp anchors are re-chosen, not mirrored.** The organising principle is that the first step carries the *most* contrast against its ground, so weight falls as magnitude falls. On white that means starting dark; on near-black it means starting light.
- **The ink-selection threshold is theme-specific.** Re-run the guard per theme.
- **Chips need lighter inks over higher-alpha fills.** The light formula produces unreadable chips on dark.
- **Chart chrome vanishes.** Gridlines and baselines tuned for white disappear; dark needs its own set.
- **Both themes go through the same validator, in CI.** A dark palette that has not been contrast-checked is a guess.

## 5. Choosing, if both exist

- Default to the system preference.
- An explicit user override is persisted and wins.
- **MUST NOT ship an unlabelled auto-only mode.** A reader who cannot tell why the interface changed, or change it back, assumes it is broken.
- Never give a colour its only definition inside a media query. Define the full light palette on the root, redefine only what changes, and let an explicit override win in both directions.

## 6. Forced colours

High-contrast and forced-colour modes strip background colours. **Every encoding in this system is a background fill**, so all of it disappears.

Out of scope for most teams, with one principle: anything encoded only by background colour vanishes under forced colours, so a chart must either carry a redundant border or pattern, or explicitly opt out and accept the consequence. Text and layout survive; fills do not.
