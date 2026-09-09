# Brand

Onboard a brand onto the system. Run once per brand, commit the result, and never hand-edit generated tokens.

The system is brand-neutral by construction. A brand supplies a small number of inputs; everything else is **derived and validated**, so a team cannot accidentally ship an illegible ramp or a delta colour that collides with its own identity.

## Inputs

Ask for these, and only these:

| Input | Required | Notes |
|---|---|---|
| Accent | yes | One hex. The brand's primary colour. |
| Wordmark | yes | Text is fine. Most internal dashboards need no logo asset. |
| Font | no | Defaults to the system stack. A brand font is a `MAY`. |
| Locale | yes | Drives number grouping and date format. |
| Currency | if money appears | Symbol and grouping convention. |
| Timezone | yes | The one named timezone every day boundary resolves in. |

Do **not** ask for a full palette. Asking for one invites a brand to supply nine colours, and the system's guarantee is that it derives them.

## Derive

```bash
node <skill>/scripts/palette.mjs "<accent>"          # report + checks
node <skill>/scripts/palette.mjs "<accent>" --css    # tokens
node <skill>/scripts/palette.mjs "<accent>" --json   # full system + checks
```

Read the checks. Three outcomes:

**Clean.** Write the tokens and continue.

**Warnings.** Usually one of two, both expected and both handled:

- *Brand accent too pale for UI.* The brand colour cannot carry a 2px line on a near-white canvas. The script derives a working colour in the same hue. **Keep both**: the brand accent for identity, the derived one for bars, lines, links and active states. Tell the brand owner this is happening and why; it is not a rejection of their colour.
- *A ramp stop cannot carry body text.* Single-hue ramps pinch in the middle. That stop becomes fill-only: labels go outside the shape. Record it.

**Failures.** Stop and resolve with a human. The one that matters:

- *Accent collides with a delta colour.* A brand whose accent is green or red cannot also use green and red to mean change. **Green and red are reserved system-wide and the brand does not get to override that**, because the reservation is what makes every dashboard in the org readable by the same rules. Offer the alternative: keep the accent, and render deltas as neutral chips carrying the arrow and an explicit signed value, so direction is encoded by glyph and text rather than hue. State clearly that this brand's dashboards will be marginally slower to scan, and that the cause is the brand palette, not the system.

## Record

Write `.revamp/brand.json` at the project root and commit it:

```json
{
  "name": "<brand>",
  "accent": "#xxxxxx",
  "accentUi": "#xxxxxx",
  "locale": "en-XX",
  "currency": "XXX",
  "timezone": "Region/City",
  "font": null,
  "notes": ["stop 3 is fill-only", "accentUi derived: brand accent too pale"]
}
```

Emit the tokens to wherever the project keeps them, generated from `palette.mjs --css`, with a header saying they are generated and must not be hand-edited.

## Rules that survive re-skinning

State these to the brand owner up front, because they are the ones people try to negotiate:

- **Green and red mean change. Always, in every brand.**
- **Amber means "read this carefully", never "this is bad".**
- Neutrals, borders, spacing, type scale and chart geometry are **structural**, not brand. A brand changes the accent and the wordmark, not the row height.
- Every generated token comes from the script. A hand-written ramp is drift on day one.

## Multi-brand

One skill, many brands, one system. Each brand gets its own `brand.json` in its own repo. The **rules** are shared; the **values** are not.

When a brand asks for an exception, the answer is usually the derived working colour or the alternative delta treatment above. Where you grant a real exception, record it in `notes` with the reason, so the next person reads a decision rather than finding an inconsistency.
