# The kit

Shipped code, not prose. Prose does not enforce anything: a team can read `typography.md` and still hand-write a Card that is subtly different from everyone else's. Tokens and components are what actually make several brands' dashboards come out as one system.

Everything lives under `<skill>/assets/`.

## What to hand a team

**Starting a new dashboard** → all three layers plus the starter.
**Revamping an existing one** → tokens first, then replace primitives one at a time. Do not rewrite a working dashboard to adopt a component library.
**A team on a stack you do not recognise** → tokens and `components.css`. They are framework-independent and carry most of the value.

## 1. Tokens

`assets/tokens.css` (72 variables) and `assets/tokens.json` (the same, machine-readable).

**MUST — regenerate per brand, never hand-edit:**

```bash
node <skill>/scripts/palette.mjs "<accent>" --css    > tokens.css
node <skill>/scripts/palette.mjs "<accent>" --tokens > tokens.json
```

The colour block varies per brand. **The structural block does not**: geometry, type scale, spacing, radii, z-ladder and border alphas are identical everywhere, and they are what make two brands read as one system. Changing one needs the system owner (`governance.md`).

`tokens.json` is the single source of truth a drift test reads.

## 2. Styles

`assets/components.css`, 69 classes, every value resolved from the tokens. Import `tokens.css` first.

Plain CSS deliberately, so a team on any framework can use it. It encodes what a stylesheet can enforce: one radius per role, one hairline recipe, one shadow, colour-only transitions, one focus ring, tabular figures on numerals that share a column, the always-visible horizontal scrollbar, and reduced-motion handling.

## 3. Components

`assets/components/`, 13 files, React with no other runtime dependencies.

They encode rules rather than restating them, which is the point:

| Component | What it makes impossible |
|---|---|
| `DeltaPill` | Growth from a zero baseline. Flat rendered as green. Direction carried by colour alone |
| `FunnelBars` | A real value rendered invisible. A blank where 0% belongs. A clamped >100%. Flagging a soft step as the biggest leak |
| `LineTrend` | A non-zero baseline. A degenerate axis below two points |
| `Sparkline` | Reserved space for a sparkline that will not render |
| `format.ts` | A bare `toLocaleString()` following the viewer's locale. Collapsing `-`, `0` and `n/a` |
| `Tooltip` | A tooltip clipped by an overflow ancestor. A hover-only affordance |

**Verify after any change:** `npm install && npm run typecheck` from the repo root.

## 4. Starter

`assets/starter/ExampleDashboard.tsx` is a worked page in the narrative order, with the annotations that matter marked inline: the dek stating the question and the population, a soft funnel step, a metric whose polarity is inverted, a metric declaring polarity before it has a delta, an empty state in domain language, and the definitions block last.

Copy it, replace the data, delete what is not needed.

## What the kit does not include

No Figma library. No design-token pipeline to Figma. No annotated screenshot gallery. If a team needs those, say so plainly rather than improvising them.
