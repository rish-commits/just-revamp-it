# Dark mode

**Dark is not an inversion.** Almost every rule that makes a light dashboard work needs re-deriving rather than flipping, and a team that inverts its tokens ships something that technically renders and is visibly wrong.

Run `palette.mjs "<accent>" --dark` to derive and validate the dark system. Do not hand-write these values.

---

## 1. What actually changes

**Borders.** Light mode uses alpha over black. Dark mode uses alpha over white, and **the values do not simply flip**: 6% black on white is visually much stronger than 6% white on near-black. The dark hairline ladder typically needs roughly double the alpha to read as the same weight.

**Elevation reverses.** "White cards on a near-white canvas, separated by a hairline and a soft shadow" has no dark analogue, because **shadows are nearly invisible on dark grounds**. In dark, elevation is carried by the surface getting *lighter* than the canvas, plus a border. Publish a two-step surface ramp: canvas, then card, then any raised layer.

**The accent must be re-derived, not reused.** A saturated hue that clears 4.5:1 as a fill against white commonly fails as text against near-black, and vice versa. **Pick the hue once, then derive one tone anchor per theme and validate each independently.** This is the same identity-versus-working-colour split as in `brand.md`, applied twice.

**Both sequential ramps need new anchors.** The funnel ramp runs dark-to-light in light mode specifically so visual weight falls as the population falls. Reversed in dark, that reads inverted. **Re-choose the anchors so weight still tracks magnitude**; do not mirror them.

**The ink-selection threshold is theme-specific.** The luminance cut-off that decides black-or-white text on a fill is tuned for a light ground. Re-run the guard per theme.

**Semantic chips need dark values.** A tone at low alpha with a dark ink produces unreadable chips on a dark ground. The dark form is a *lighter* ink over a slightly higher-alpha fill.

**Chart chrome vanishes.** Light gridlines and mid-grey baselines disappear entirely on dark. Charts need their own dark axis, gridline and baseline set.

**Status fills need re-checking, not re-tinting.** Green and red keep their meaning, but the specific tint-and-ink pairs must be validated against the dark surface they sit on.

## 2. What stays the same

- Every rule in `trust.md`. Honesty is theme-independent.
- Every rule in `numbers.md`, `choosing.md`, `naming.md`.
- The geometry: spacing, radii, row heights, type scale.
- Green and red still mean change, and only change.
- The single-hue sequential ramp is still the most colour-blind-safe encoding available, because it varies lightness monotonically.

## 3. Choosing a theme

- **Default to the system preference.**
- **An explicit user override is persisted** and wins over the system.
- **MUST NOT ship an unlabelled auto-only mode.** A reader who cannot tell why the interface changed, or change it back, will assume it is broken.
- Never give a colour its only definition inside a media query. Define the full light palette on the root, redefine only what changes for dark, and let an explicit override win in both directions.

## 4. Single-theme products

Shipping one theme deliberately is legitimate, and often right for an internal tool read in one setting. It takes coordinated moves rather than one:

1. Neutralise the theme variant inside the opted-out subtree so inherited components stop responding to it.
2. Pin the tokens on the subtree.
3. **Paint the canvas explicitly**, or the browser's own ground shows through in the overscroll gutter and anywhere your wrapper does not paint.
4. Keep new files free of theme variants, and leave inherited ones alone rather than stripping them.

That recipe is also the correct migration state when one section of a product is single-theme while the rest is theme-aware.

## 5. Validation

**MUST — the dark palette ships with the same validator as the light one.** Every fill checked against the ink the helper returns for it, in both themes, at build time. See `accessibility.md` §5.

A dark palette that has not been run through the contrast guard is not a dark palette, it is a guess.

## 6. Forced colours

Windows High Contrast and similar modes strip background colours. **Every encoding in this system is a background fill**, so all of it disappears.

The honest answer for most teams is out of scope, but the principle is one line: **anything encoded only by background colour vanishes under forced colours**, so a chart must either carry a redundant border or pattern, or explicitly opt out and accept the consequence. Text and layout survive; fills do not.
