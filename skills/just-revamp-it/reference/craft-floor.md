# Craft floor

The minimum quality bar for any UI this skill produces, for work outside the dashboard-specific rules. Load this immediately before editing when no general frontend craft skill is available.

If the `impeccable` skill is installed, prefer it for general craft and use this only as a fallback.

## Absolute bans

- Text below 4.5:1 contrast, or 3:1 for large text and graphical objects.
- Interactive targets under 44×44 on touch.
- A focus state that is removed rather than restyled.
- Motion with no `prefers-reduced-motion` alternative that preserves the state change.
- Placeholder content shipped as real content: lorem ipsum, fake names, invented figures, a chart with made-up data.
- Horizontal page scroll. Wide content scrolls inside its own container.
- A control that looks interactive and is not, or is interactive and does not look it.

## Reflexes no detector catches

- **Alignment is a decision.** Optical alignment beats mathematical alignment where they disagree, which is most often with icons beside text.
- **One radius family, one shadow family.** Two of either reads as two designs.
- **Hairlines are alpha over black, not a grey hex**, so they composite correctly on every surface.
- **Icons are drawn at the family's stroke weight.** Never mix a text glyph arrow with SVG icons; the glyph follows the font's weight and never matches.
- **Give a wide child a minimum-width override** or it refuses to shrink and pushes its container out of the grid.
- **Elements in a row of unequal content align to the top**, not the centre, unless you meant otherwise.
- **Reserve space for content that will arrive**, so nothing jumps on load, but do not reserve space for content that may never arrive.
- **Empty, loading and error states are designed, not defaulted.** See `trust.md`.

## Restraint

- Prefer removing an element to adjusting it.
- A new value on a scale must displace an old one.
- If a page needs a legend to be understood, try direct labelling first.
- Whitespace is a feature. Density is earned by a reader who asked for it.

## Verify

Bounded passes, not a loop. Build fully, inspect once at full size and at 50%, fix everything that shows in one batch, confirm once, stop.
