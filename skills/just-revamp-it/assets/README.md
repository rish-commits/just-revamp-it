# The kit

Three layers. Take as many as you need.

## 1. Tokens (any stack)

```
tokens.css     72 CSS variables: colour, type, space, radius, grid, z, border
tokens.json    the same values, machine-readable
```

`tokens.css` is the portable contract. Import it and everything else follows.

**Regenerate for your brand — do not hand-edit:**

```bash
node ../scripts/palette.mjs "#yourhex" --css    > tokens.css
node ../scripts/palette.mjs "#yourhex" --tokens > tokens.json
```

`tokens.json` is the single source of truth that `governance.md` requires. Point
your drift test at it: a documented token with no consumer, or a shipped literal
with no token, is a failure.

## 2. Styles (any framework, or none)

```
components.css   69 classes, every value resolved from tokens.css
```

Plain CSS on purpose. A team on Vue, Svelte, plain HTML or Tailwind can use these
classes unchanged, and re-skinning stays a tokens change.

## 3. Components (React)

```
components/     13 files, ~555 lines, React only — no other runtime dependencies
```

`Card` · `KpiTile` · `HeroStat` · `DeltaPill` · `Sparkline` · `FunnelBars` ·
`LineTrend` · `SegmentedControl` · `Tooltip` / `InfoDot` · icons · `format` · `geometry`

These encode the rules rather than restating them, so the failure modes are hard
to reproduce by accident:

- `DeltaPill` returns nothing when the prior period is zero, so you cannot ship
  "+100%" growth from nothing. Flat is neutral, never green. Direction is in the
  accessible name, not only the colour.
- `FunnelBars` scales to the first step, floors non-zero fills so a small value is
  never invisible, prints `0%` rather than blank, shows values above 100% instead
  of clamping, flags exactly one step by absolute drop, and excludes `soft` steps
  from that detection.
- `LineTrend` is zero-based, floors its domain at 1, and refuses to draw below two
  points rather than emitting a degenerate axis.
- `format.ts` takes locale and currency as parameters and names four distinct
  absences, so `n/a` and `-` and `0` never collapse into each other.

## 4. Starter

```
starter/ExampleDashboard.tsx
```

A worked page in the narrative order: H1, dek stating the question and the
population, hero, KPI strip, sections, definitions. Copy it, replace the data,
delete what you do not need.

## Verify

From the repo root:

```bash
npm install && npm run typecheck
```
